/**
 * RAG Integration
 * 
 * Orchestrates RAG operations for AI chat integration
 */

import { retrieveContext, type VectorChunk } from './rag';
import { getEmbeddingsConfig } from './embeddingsProvider';

export interface RetrievalOptions {
  topK?: number;              // Default: 3
  minSimilarity?: number;     // Default: 0.5
  timeout?: number;           // Default: 2000ms
  maxContextChars?: number;   // Default: 3000
}

export interface ContextChunk {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  similarity: number;
  chunkIndex: number;
}

export interface RetrievalResult {
  success: boolean;
  chunks: ContextChunk[];
  error?: string;
  warnings: string[];
  metadata: {
    retrievalTime: number;
    totalChunksScanned: number;
    chunksTruncated: boolean;
  };
}

/**
 * Retrieve context with timeout and error handling
 */
export async function retrieveContextWithTimeout(
  message: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const {
    topK = 3,
    timeout = 2000,
    maxContextChars = 3000,
  } = options;

  const startTime = Date.now();
  
  try {
    // Get API key from config
    const config = getEmbeddingsConfig();
    if (!config.apiKey) {
      return {
        success: false,
        chunks: [],
        error: '未配置 Embeddings API Key',
        warnings: [],
        metadata: {
          retrievalTime: 0,
          totalChunksScanned: 0,
          chunksTruncated: false,
        },
      };
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Retrieval timeout')), timeout);
    });

    // Retrieve context with timeout
    const result = await Promise.race([
      retrieveContext(message, config.apiKey, topK),
      timeoutPromise,
    ]);

    const retrievalTime = Date.now() - startTime;

    // Convert to ContextChunk format
    let chunks: ContextChunk[] = result.sources.map(chunk => ({
      id: chunk.id,
      fileId: chunk.fileId,
      fileName: chunk.fileName,
      content: chunk.content,
      similarity: chunk.similarity,
      chunkIndex: chunk.chunkIndex,
    }));

    // Check if truncation is needed
    let chunksTruncated = false;
    const totalChars = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0);
    
    if (totalChars > maxContextChars) {
      // Sort by similarity (descending) and truncate
      chunks = chunks.sort((a, b) => b.similarity - a.similarity);
      
      let currentChars = 0;
      const truncatedChunks: ContextChunk[] = [];
      
      for (const chunk of chunks) {
        if (currentChars + chunk.content.length <= maxContextChars) {
          truncatedChunks.push(chunk);
          currentChars += chunk.content.length;
        } else {
          chunksTruncated = true;
          break;
        }
      }
      
      chunks = truncatedChunks;
      result.warnings.push(`上下文已截断以适应 ${maxContextChars} 字符限制`);
    }

    return {
      success: true,
      chunks,
      warnings: result.warnings,
      metadata: {
        retrievalTime,
        totalChunksScanned: result.sources.length,
        chunksTruncated,
      },
    };
  } catch (error) {
    const retrievalTime = Date.now() - startTime;
    
    if (error instanceof Error && error.message === 'Retrieval timeout') {
      return {
        success: false,
        chunks: [],
        error: '检索超时（超过 2 秒）',
        warnings: ['将在没有文档上下文的情况下继续'],
        metadata: {
          retrievalTime,
          totalChunksScanned: 0,
          chunksTruncated: false,
        },
      };
    }

    return {
      success: false,
      chunks: [],
      error: error instanceof Error ? error.message : '未知错误',
      warnings: [],
      metadata: {
        retrievalTime,
        totalChunksScanned: 0,
        chunksTruncated: false,
      },
    };
  }
}

/**
 * Format context chunks for display
 */
export function formatContextChunks(chunks: ContextChunk[]): string {
  if (chunks.length === 0) {
    return '';
  }

  return chunks
    .map((chunk, i) => `[来源 ${i + 1}: ${chunk.fileName}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English, 1.5 characters for Chinese
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}
