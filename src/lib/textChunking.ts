/**
 * Text Chunking Utilities
 * 
 * Split long documents into smaller chunks for embedding and retrieval
 */

export interface TextChunk {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  metadata: {
    chunkIndex: number;
    startChar: number;
    endChar: number;
    wordCount: number;
  };
}

// Chunking parameters
const CHUNK_SIZE = 500; // characters
const CHUNK_OVERLAP = 50; // overlap between chunks
const MIN_CHUNK_SIZE = 100; // minimum chunk size

/**
 * Split text into chunks with overlap
 */
export function chunkText(
  text: string,
  fileId: string,
  fileName: string
): TextChunk[] {
  const chunks: TextChunk[] = [];
  
  // Clean and normalize text
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  if (cleanText.length === 0) {
    return chunks;
  }
  
  let startChar = 0;
  let chunkIndex = 0;
  
  while (startChar < cleanText.length) {
    // Calculate end position
    let endChar = Math.min(startChar + CHUNK_SIZE, cleanText.length);
    
    // Try to break at sentence boundary
    if (endChar < cleanText.length) {
      const sentenceEnd = findSentenceEnd(cleanText, endChar);
      if (sentenceEnd > startChar + MIN_CHUNK_SIZE) {
        endChar = sentenceEnd;
      }
    }
    
    // Extract chunk content
    const content = cleanText.substring(startChar, endChar).trim();
    
    if (content.length >= MIN_CHUNK_SIZE) {
      const chunkId = `${fileId}_chunk_${chunkIndex}`;
      
      chunks.push({
        id: chunkId,
        fileId,
        fileName,
        content,
        metadata: {
          chunkIndex,
          startChar,
          endChar,
          wordCount: content.split(/\s+/).length,
        },
      });
      
      chunkIndex++;
    }
    
    // Move to next chunk with overlap
    startChar = endChar - CHUNK_OVERLAP;
    
    // Avoid infinite loop
    if (startChar >= cleanText.length - MIN_CHUNK_SIZE) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Find the end of a sentence near the target position
 */
function findSentenceEnd(text: string, targetPos: number): number {
  // Look for sentence endings: . ! ? followed by space or end
  const searchRange = 100; // search within 100 chars
  const startSearch = Math.max(0, targetPos - searchRange);
  const endSearch = Math.min(text.length, targetPos + searchRange);
  
  const segment = text.substring(startSearch, endSearch);
  const sentenceEndings = /[.!?]\s+/g;
  
  let lastMatch = -1;
  let match;
  
  while ((match = sentenceEndings.exec(segment)) !== null) {
    const absolutePos = startSearch + match.index + match[0].length;
    if (absolutePos <= targetPos + searchRange) {
      lastMatch = absolutePos;
    }
  }
  
  return lastMatch > 0 ? lastMatch : targetPos;
}

/**
 * Merge overlapping chunks if needed
 */
export function mergeChunks(chunks: TextChunk[]): TextChunk[] {
  if (chunks.length <= 1) return chunks;
  
  const merged: TextChunk[] = [];
  let current = chunks[0];
  
  for (let i = 1; i < chunks.length; i++) {
    const next = chunks[i];
    
    // Check if chunks are from the same file and overlap significantly
    if (
      current.fileId === next.fileId &&
      next.metadata.startChar < current.metadata.endChar
    ) {
      // Merge chunks
      current = {
        ...current,
        content: current.content + ' ' + next.content,
        metadata: {
          ...current.metadata,
          endChar: next.metadata.endChar,
          wordCount: current.metadata.wordCount + next.metadata.wordCount,
        },
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  
  merged.push(current);
  return merged;
}

/**
 * Get chunk statistics
 */
export function getChunkStats(chunks: TextChunk[]): {
  totalChunks: number;
  avgChunkSize: number;
  minChunkSize: number;
  maxChunkSize: number;
  totalWords: number;
} {
  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      avgChunkSize: 0,
      minChunkSize: 0,
      maxChunkSize: 0,
      totalWords: 0,
    };
  }
  
  const sizes = chunks.map(c => c.content.length);
  const words = chunks.reduce((sum, c) => sum + c.metadata.wordCount, 0);
  
  return {
    totalChunks: chunks.length,
    avgChunkSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
    minChunkSize: Math.min(...sizes),
    maxChunkSize: Math.max(...sizes),
    totalWords: words,
  };
}
