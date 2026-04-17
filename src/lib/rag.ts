/**
 * RAG (Retrieval-Augmented Generation)
 * 
 * Core RAG functionality for semantic search and context retrieval
 */

import { chunkText, type TextChunk } from './textChunking';
import { generateEmbedding, batchGenerateEmbeddings, findTopKSimilar } from './embeddings';
import {
  saveVectorChunks,
  saveVectorIndex,
  getAllVectorChunks,
  getVectorChunksByFile,
  isFileIndexed,
  type VectorChunk,
} from './vectorStore';
import { getFile, type UploadedFile } from './fileStorage';

/**
 * Index a file for RAG
 */
export async function indexFile(
  file: UploadedFile,
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    // Check if already indexed
    const indexed = await isFileIndexed(file.id);
    if (indexed) {
      console.log(`File ${file.name} is already indexed`);
      return;
    }
    
    // 1. Chunk the text
    const chunks = chunkText(file.content, file.id, file.name);
    
    if (chunks.length === 0) {
      console.warn(`No chunks generated for file ${file.name}`);
      return;
    }
    
    // 2. Generate embeddings
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await batchGenerateEmbeddings(texts, apiKey, onProgress);
    
    // 3. Create vector chunks
    const vectorChunks: VectorChunk[] = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));
    
    // 4. Save to vector store
    await saveVectorChunks(vectorChunks);
    
    // 5. Save index
    await saveVectorIndex({
      fileId: file.id,
      fileName: file.name,
      chunkIds: vectorChunks.map(c => c.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`Indexed file ${file.name}: ${chunks.length} chunks`);
  } catch (error) {
    console.error(`Failed to index file ${file.name}:`, error);
    throw error;
  }
}

/**
 * Search for similar chunks across all files
 */
export async function searchSimilarChunks(
  query: string,
  apiKey: string,
  topK: number = 3,
  minSimilarity: number = 0.5
): Promise<Array<VectorChunk & { similarity: number }>> {
  try {
    // 1. Generate query embedding
    const queryEmbedding = await generateEmbedding(query, apiKey);
    
    // 2. Get all vector chunks
    const allChunks = await getAllVectorChunks();
    
    if (allChunks.length === 0) {
      return [];
    }
    
    // 3. Find top K similar chunks
    const results = findTopKSimilar(
      queryEmbedding,
      allChunks.map(chunk => ({
        id: chunk.id,
        embedding: chunk.embedding,
        metadata: chunk,
      })),
      topK
    );
    
    // 4. Filter by minimum similarity and return with metadata
    return results
      .filter(result => result.similarity >= minSimilarity)
      .map(result => ({
        ...(result.metadata as VectorChunk),
        similarity: result.similarity,
      }));
  } catch (error) {
    console.error('Failed to search similar chunks:', error);
    throw error;
  }
}

/**
 * Search for similar chunks in specific files
 */
export async function searchInFiles(
  query: string,
  fileNames: string[],
  apiKey: string,
  topK: number = 3,
  minSimilarity: number = 0.5
): Promise<Array<VectorChunk & { similarity: number }>> {
  try {
    // 1. Generate query embedding
    const queryEmbedding = await generateEmbedding(query, apiKey);
    
    // 2. Get chunks from specified files
    const allChunks = await getAllVectorChunks();
    const fileChunks = allChunks.filter(chunk =>
      fileNames.some(name => chunk.fileName.toLowerCase().includes(name.toLowerCase()))
    );
    
    if (fileChunks.length === 0) {
      return [];
    }
    
    // 3. Find top K similar chunks
    const results = findTopKSimilar(
      queryEmbedding,
      fileChunks.map(chunk => ({
        id: chunk.id,
        embedding: chunk.embedding,
        metadata: chunk,
      })),
      topK
    );
    
    // 4. Filter by minimum similarity
    return results
      .filter(result => result.similarity >= minSimilarity)
      .map(result => ({
        ...(result.metadata as VectorChunk),
        similarity: result.similarity,
      }));
  } catch (error) {
    console.error('Failed to search in files:', error);
    throw error;
  }
}

/**
 * Parse @file references from user message
 * Enhanced version with validation
 */
export async function parseFileReferences(message: string): Promise<{
  originalMessage: string;
  cleanMessage: string;
  fileReferences: string[];
  validFiles: string[];
  invalidFiles: string[];
}> {
  // Match @filename.ext pattern
  const fileRefRegex = /@([^\s]+\.(pdf|docx|doc|txt|md))/gi;
  const fileRefs: string[] = [];
  
  // Extract all file references
  let match;
  while ((match = fileRefRegex.exec(message)) !== null) {
    fileRefs.push(match[1]);
  }
  
  // Remove duplicates
  const uniqueFileRefs = Array.from(new Set(fileRefs));
  
  // Validate which files exist in vector store
  const allChunks = await getAllVectorChunks();
  const existingFiles = new Set(allChunks.map(chunk => chunk.fileName.toLowerCase()));
  
  const validFiles: string[] = [];
  const invalidFiles: string[] = [];
  
  uniqueFileRefs.forEach(fileRef => {
    if (existingFiles.has(fileRef.toLowerCase())) {
      validFiles.push(fileRef);
    } else {
      invalidFiles.push(fileRef);
    }
  });
  
  // Replace @file references with [文件: filename] notation
  const cleanMessage = message.replace(fileRefRegex, (match, filename) => {
    return `[文件: ${filename}]`;
  });
  
  return {
    originalMessage: message,
    cleanMessage,
    fileReferences: uniqueFileRefs,
    validFiles,
    invalidFiles,
  };
}

/**
 * Retrieve context for a query
 */
export async function retrieveContext(
  message: string,
  apiKey: string,
  topK: number = 3
): Promise<{
  context: string;
  sources: Array<VectorChunk & { similarity: number }>;
  warnings: string[];
}> {
  try {
    const warnings: string[] = [];
    
    // 1. Parse file references
    const { cleanMessage, validFiles, invalidFiles } = await parseFileReferences(message);
    
    // Add warnings for invalid files
    if (invalidFiles.length > 0) {
      warnings.push(`未找到以下文件: ${invalidFiles.join(', ')}`);
    }
    
    // 2. Search for relevant chunks
    let chunks: Array<VectorChunk & { similarity: number }>;
    
    if (validFiles.length > 0) {
      // Search in specific files
      chunks = await searchInFiles(cleanMessage, validFiles, apiKey, topK);
    } else {
      // Search across all files
      chunks = await searchSimilarChunks(cleanMessage, apiKey, topK);
    }
    
    // 3. Format context
    const context = chunks.length > 0
      ? chunks
          .map((chunk, i) => `[来源 ${i + 1}: ${chunk.fileName}]\n${chunk.content}`)
          .join('\n\n---\n\n')
      : '';
    
    return { context, sources: chunks, warnings };
  } catch (error) {
    console.error('Failed to retrieve context:', error);
    return { context: '', sources: [], warnings: ['检索上下文失败'] };
  }
}

/**
 * Enhance AI prompt with retrieved context
 */
export function enhancePrompt(
  userMessage: string,
  context: string
): string {
  if (!context) {
    return userMessage;
  }
  
  return `你是一个知识助手。请基于以下参考资料回答用户的问题。

## 参考资料
${context}

## 用户问题
${userMessage}

## 回答要求
1. 基于参考资料回答问题
2. 如果参考资料不足以回答问题，请说明需要更多信息
3. 引用来源时使用 [来源 X] 标记
4. 保持回答简洁明了`;
}

/**
 * Get file suggestions for autocomplete
 */
export async function getFileSuggestions(
  prefix: string
): Promise<string[]> {
  try {
    const allChunks = await getAllVectorChunks();
    const uniqueFiles = new Set(allChunks.map(chunk => chunk.fileName));
    
    const files = Array.from(uniqueFiles);
    
    if (!prefix) {
      return files;
    }
    
    // Filter by prefix
    const lowerPrefix = prefix.toLowerCase();
    return files.filter(file => file.toLowerCase().includes(lowerPrefix));
  } catch (error) {
    console.error('Failed to get file suggestions:', error);
    return [];
  }
}
