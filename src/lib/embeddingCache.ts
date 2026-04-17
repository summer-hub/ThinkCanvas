/**
 * Embedding Cache
 * 
 * LRU cache for query embeddings to reduce API calls and improve performance
 */

interface CacheEntry {
  embedding: number[];
  timestamp: number;
  provider: string;
  model: string;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
}

class EmbeddingCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private hits: number;
  private misses: number;
  private storageKey: string;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
    this.storageKey = 'embedding_cache';
    
    // Load from localStorage on init
    this.loadFromStorage();
  }

  /**
   * Generate cache key from query text, provider, and model
   */
  private generateKey(query: string, provider: string, model: string): string {
    // Normalize query (lowercase, trim)
    const normalizedQuery = query.toLowerCase().trim();
    return `${provider}:${model}:${normalizedQuery}`;
  }

  /**
   * Get embedding from cache
   */
  get(query: string, provider: string, model: string): number[] | null {
    const key = this.generateKey(query, provider, model);
    const entry = this.cache.get(key);

    if (entry) {
      // Check if entry is still valid (not expired)
      const age = Date.now() - entry.timestamp;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (age < maxAge) {
        this.hits++;
        // Move to end (LRU)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.embedding;
      } else {
        // Expired, remove
        this.cache.delete(key);
      }
    }

    this.misses++;
    return null;
  }

  /**
   * Set embedding in cache
   */
  set(query: string, provider: string, model: string, embedding: number[]): void {
    const key = this.generateKey(query, provider, model);

    // If cache is full, remove oldest entry (first in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry = {
      embedding,
      timestamp: Date.now(),
      provider,
      model,
    };

    this.cache.set(key, entry);
    
    // Persist to localStorage (debounced)
    this.saveToStorage();
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Clear cache for specific provider
   */
  clearProvider(provider: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.provider === provider) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 10) / 10,
    };
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore cache entries
        if (data.entries && Array.isArray(data.entries)) {
          for (const [key, entry] of data.entries) {
            // Check if entry is still valid
            const age = Date.now() - entry.timestamp;
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            if (age < maxAge) {
              this.cache.set(key, entry);
            }
          }
        }

        // Restore stats
        this.hits = data.hits || 0;
        this.misses = data.misses || 0;
      }
    } catch (error) {
      console.error('Failed to load embedding cache:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        hits: this.hits,
        misses: this.misses,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save embedding cache:', error);
      // If storage is full, clear old entries
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldEntries();
        // Try again
        try {
          const data = {
            entries: Array.from(this.cache.entries()),
            hits: this.hits,
            misses: this.misses,
            timestamp: Date.now(),
          };
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch {
          // Give up
        }
      }
    }
  }

  /**
   * Clear old entries (older than 3 days)
   */
  private clearOldEntries(): void {
    const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = Date.now() - entry.timestamp;
      if (age > maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSizeInBytes(): number {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        hits: this.hits,
        misses: this.misses,
      };
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }
}

// Singleton instance
let cacheInstance: EmbeddingCache | null = null;

/**
 * Get embedding cache instance
 */
export function getEmbeddingCache(): EmbeddingCache {
  if (!cacheInstance) {
    cacheInstance = new EmbeddingCache(100);
  }
  return cacheInstance;
}

/**
 * Clear embedding cache (useful when API key changes)
 */
export function clearEmbeddingCache(): void {
  const cache = getEmbeddingCache();
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  const cache = getEmbeddingCache();
  return cache.getStats();
}

/**
 * Format cache size for display
 */
export function formatCacheSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
