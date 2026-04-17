/**
 * Embeddings Generation
 * 
 * Generate vector embeddings using multiple providers
 * Supports: OpenAI, Youdao BCEmbedding, Zhipu AI, Qwen, Wenxin
 */

import { createEmbeddingsProvider, getEmbeddingsConfig, type EmbeddingsProvider } from './embeddingsProvider';
import { getEmbeddingCache } from './embeddingCache';

// Get embeddings provider instance
let providerInstance: EmbeddingsProvider | null = null;

function getProvider(): EmbeddingsProvider {
  if (!providerInstance) {
    const config = getEmbeddingsConfig();
    providerInstance = createEmbeddingsProvider(config);
  }
  return providerInstance;
}

// Reset provider (call when config changes)
export function resetEmbeddingsProvider(): void {
  providerInstance = null;
}

/**
 * Generate embedding for a single text with caching
 * @param text - Text to generate embedding for
 * @param apiKey - API key (optional, will use config from localStorage if not provided)
 */
export async function generateEmbedding(
  text: string,
  apiKey?: string
): Promise<number[]> {
  try {
    // Get config
    const config = getEmbeddingsConfig();
    
    // Check cache first
    const cache = getEmbeddingCache();
    const cached = cache.get(text, config.provider, config.model || 'default');
    
    if (cached) {
      return cached;
    }

    // If apiKey is provided, update config temporarily
    if (apiKey) {
      config.apiKey = apiKey;
      providerInstance = createEmbeddingsProvider(config);
    }
    
    const provider = getProvider();
    const embedding = await provider.generateEmbedding(text);
    
    // Cache the result
    cache.set(text, config.provider, config.model || 'default', embedding);
    
    return embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batches with caching
 * @param texts - Array of texts to generate embeddings for
 * @param apiKey - API key (optional, will use config from localStorage if not provided)
 * @param onProgress - Progress callback
 */
export async function batchGenerateEmbeddings(
  texts: string[],
  apiKey?: string,
  onProgress?: (current: number, total: number) => void
): Promise<number[][]> {
  const config = getEmbeddingsConfig();
  const cache = getEmbeddingCache();
  const embeddings: number[][] = [];
  
  // Check cache first
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    const cached = cache.get(texts[i], config.provider, config.model || 'default');
    if (cached) {
      embeddings[i] = cached;
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(texts[i]);
    }
  }
  
  // Generate embeddings for uncached texts
  if (uncachedTexts.length > 0) {
    try {
      // If apiKey is provided, update config temporarily
      if (apiKey) {
        config.apiKey = apiKey;
        providerInstance = createEmbeddingsProvider(config);
      }
      
      const provider = getProvider();
      const newEmbeddings = await provider.batchGenerateEmbeddings(uncachedTexts, onProgress);
      
      // Store results
      newEmbeddings.forEach((embedding, idx) => {
        const originalIndex = uncachedIndices[idx];
        embeddings[originalIndex] = embedding;
        
        // Cache the result
        cache.set(uncachedTexts[idx], config.provider, config.model || 'default', embedding);
      });
    } catch (error) {
      console.error('Failed to generate batch embeddings:', error);
      throw new Error(`Batch embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find top K most similar vectors
 */
export function findTopKSimilar(
  queryEmbedding: number[],
  embeddings: Array<{ id: string; embedding: number[]; metadata?: any }>,
  k: number = 3
): Array<{ id: string; similarity: number; metadata?: any }> {
  const similarities = embeddings.map(item => ({
    id: item.id,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
    metadata: item.metadata,
  }));
  
  // Sort by similarity (descending) and return top K
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * Clear embedding cache
 */
export function clearEmbeddingCache(): void {
  const cache = getEmbeddingCache();
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
} {
  const cache = getEmbeddingCache();
  return cache.getStats();
}
