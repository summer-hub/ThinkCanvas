/**
 * Vector Store
 * 
 * Store and retrieve text chunks with embeddings using IndexedDB
 */

import { get, set, del } from 'idb-keyval';
import type { TextChunk } from './textChunking';

export interface VectorChunk extends TextChunk {
  embedding: number[];
}

export interface VectorIndex {
  fileId: string;
  fileName: string;
  chunkIds: string[];
  createdAt: string;
  updatedAt: string;
}

const VECTOR_CHUNKS_KEY = 'vector-chunks';
const VECTOR_INDEX_KEY = 'vector-index';

/**
 * Save vector chunks to storage
 */
export async function saveVectorChunks(chunks: VectorChunk[]): Promise<void> {
  try {
    // Get existing chunks
    const existing = await get<Map<string, VectorChunk>>(VECTOR_CHUNKS_KEY) || new Map();
    
    // Add new chunks
    chunks.forEach(chunk => {
      existing.set(chunk.id, chunk);
    });
    
    // Save back
    await set(VECTOR_CHUNKS_KEY, existing);
  } catch (error) {
    console.error('Failed to save vector chunks:', error);
    throw error;
  }
}

/**
 * Get all vector chunks
 */
export async function getAllVectorChunks(): Promise<VectorChunk[]> {
  try {
    const chunks = await get<Map<string, VectorChunk>>(VECTOR_CHUNKS_KEY);
    return chunks ? Array.from(chunks.values()) : [];
  } catch (error) {
    console.error('Failed to get vector chunks:', error);
    return [];
  }
}

/**
 * Get vector chunks for a specific file
 */
export async function getVectorChunksByFile(fileId: string): Promise<VectorChunk[]> {
  try {
    const allChunks = await getAllVectorChunks();
    return allChunks.filter(chunk => chunk.fileId === fileId);
  } catch (error) {
    console.error('Failed to get vector chunks by file:', error);
    return [];
  }
}

/**
 * Delete vector chunks for a file
 */
export async function deleteVectorChunksByFile(fileId: string): Promise<void> {
  try {
    const chunks = await get<Map<string, VectorChunk>>(VECTOR_CHUNKS_KEY);
    if (!chunks) return;
    
    // Remove chunks for this file
    for (const [id, chunk] of chunks.entries()) {
      if (chunk.fileId === fileId) {
        chunks.delete(id);
      }
    }
    
    await set(VECTOR_CHUNKS_KEY, chunks);
    
    // Update index
    await deleteVectorIndex(fileId);
  } catch (error) {
    console.error('Failed to delete vector chunks:', error);
    throw error;
  }
}

/**
 * Save vector index
 */
export async function saveVectorIndex(index: VectorIndex): Promise<void> {
  try {
    const indices = await get<Map<string, VectorIndex>>(VECTOR_INDEX_KEY) || new Map();
    indices.set(index.fileId, index);
    await set(VECTOR_INDEX_KEY, indices);
  } catch (error) {
    console.error('Failed to save vector index:', error);
    throw error;
  }
}

/**
 * Get all vector indices
 */
export async function getAllVectorIndices(): Promise<VectorIndex[]> {
  try {
    const indices = await get<Map<string, VectorIndex>>(VECTOR_INDEX_KEY);
    return indices ? Array.from(indices.values()) : [];
  } catch (error) {
    console.error('Failed to get vector indices:', error);
    return [];
  }
}

/**
 * Get vector index for a file
 */
export async function getVectorIndex(fileId: string): Promise<VectorIndex | null> {
  try {
    const indices = await get<Map<string, VectorIndex>>(VECTOR_INDEX_KEY);
    return indices?.get(fileId) || null;
  } catch (error) {
    console.error('Failed to get vector index:', error);
    return null;
  }
}

/**
 * Delete vector index for a file
 */
export async function deleteVectorIndex(fileId: string): Promise<void> {
  try {
    const indices = await get<Map<string, VectorIndex>>(VECTOR_INDEX_KEY);
    if (!indices) return;
    
    indices.delete(fileId);
    await set(VECTOR_INDEX_KEY, indices);
  } catch (error) {
    console.error('Failed to delete vector index:', error);
    throw error;
  }
}

/**
 * Check if a file is indexed
 */
export async function isFileIndexed(fileId: string): Promise<boolean> {
  const index = await getVectorIndex(fileId);
  return index !== null;
}

/**
 * Get indexed file IDs
 */
export async function getIndexedFileIds(): Promise<string[]> {
  const indices = await getAllVectorIndices();
  return indices.map(index => index.fileId);
}

/**
 * Clear all vector data
 */
export async function clearVectorStore(): Promise<void> {
  try {
    await del(VECTOR_CHUNKS_KEY);
    await del(VECTOR_INDEX_KEY);
  } catch (error) {
    console.error('Failed to clear vector store:', error);
    throw error;
  }
}

/**
 * Get vector store statistics
 */
export async function getVectorStoreStats(): Promise<{
  totalChunks: number;
  totalFiles: number;
  avgChunksPerFile: number;
  estimatedSize: number; // in MB
}> {
  try {
    const chunks = await getAllVectorChunks();
    const indices = await getAllVectorIndices();
    
    // Estimate size: each chunk ~12KB (embedding) + ~1KB (content)
    const estimatedSize = (chunks.length * 13) / 1024; // in MB
    
    return {
      totalChunks: chunks.length,
      totalFiles: indices.length,
      avgChunksPerFile: indices.length > 0 ? Math.round(chunks.length / indices.length) : 0,
      estimatedSize,
    };
  } catch (error) {
    console.error('Failed to get vector store stats:', error);
    return {
      totalChunks: 0,
      totalFiles: 0,
      avgChunksPerFile: 0,
      estimatedSize: 0,
    };
  }
}
