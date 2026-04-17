/**
 * Embeddings Provider Abstraction
 * 
 * Support multiple embeddings services:
 * - OpenAI (international)
 * - Youdao BCEmbedding (China, RAG-optimized)
 * - Zhipu AI (China)
 * - Qwen (Alibaba Cloud)
 * - Wenxin (Baidu)
 */

import OpenAI from 'openai';
import * as jose from 'jose';

// Embeddings configuration
export interface EmbeddingsConfig {
  provider: 'openai' | 'youdao' | 'zhipu' | 'qwen' | 'wenxin';
  apiKey: string;
  baseURL?: string;
  model?: string;
}

// Embeddings provider interface
export interface EmbeddingsProvider {
  name: string;
  dimensions: number;
  generateEmbedding(text: string): Promise<number[]>;
  batchGenerateEmbeddings(texts: string[], onProgress?: (current: number, total: number) => void): Promise<number[][]>;
}

// OpenAI Embeddings Provider
class OpenAIEmbeddingsProvider implements EmbeddingsProvider {
  name = 'openai';
  dimensions = 1536;
  private client: OpenAI;
  private model: string;

  constructor(config: EmbeddingsConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model || 'text-embedding-3-small';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0].embedding;
  }

  async batchGenerateEmbeddings(
    texts: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<number[][]> {
    const batchSize = 100;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.client.embeddings.create({
        model: this.model,
        input: batch,
      });

      response.data.forEach(item => {
        embeddings.push(item.embedding);
      });

      if (onProgress) {
        onProgress(Math.min(i + batchSize, texts.length), texts.length);
      }
    }

    return embeddings;
  }
}

// Youdao BCEmbedding Provider (China, RAG-optimized)
class YoudaoEmbeddingsProvider implements EmbeddingsProvider {
  name = 'youdao';
  dimensions = 768; // BCEmbedding uses 768 dimensions
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: EmbeddingsConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://aidemo.youdao.com/trans';
    this.model = config.model || 'bce-embedding-base_v1';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Youdao BCEmbedding API call
    // Note: This is a placeholder. Actual API format may differ.
    // Please refer to official documentation: https://ai.youdao.com/product-embedding.s
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Youdao API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding || data.data?.[0]?.embedding;
  }

  async batchGenerateEmbeddings(
    texts: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i]);
      embeddings.push(embedding);

      if (onProgress) {
        onProgress(i + 1, texts.length);
      }
    }

    return embeddings;
  }
}

// Zhipu AI Embeddings Provider (China)
class ZhipuEmbeddingsProvider implements EmbeddingsProvider {
  name = 'zhipu';
  dimensions = 1024;
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: EmbeddingsConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://open.bigmodel.cn/api/paas/v4';
    this.model = config.model || 'embedding-2';
  }

  /**
   * Generate JWT token from API key
   * Zhipu AI uses API key format: id.secret
   */
  private async generateToken(): Promise<string> {
    try {
      // Split API key into id and secret
      const parts = this.apiKey.split('.');
      if (parts.length !== 2) {
        throw new Error('Invalid API key format. Expected format: id.secret');
      }

      const [id, secret] = parts;
      
      // Create JWT payload
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        api_key: id,
        exp: now + 180, // 3 minutes expiry
        timestamp: now * 1000,
      };

      // Create secret key
      const secretKey = new TextEncoder().encode(secret);

      // Sign JWT
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' })
        .sign(secretKey);

      return token;
    } catch (error) {
      console.error('Failed to generate JWT token:', error);
      throw new Error(`Failed to generate authentication token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate JWT token
    const token = await this.generateToken();

    // Zhipu AI API call (OpenAI-compatible format)
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zhipu API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Zhipu AI returns OpenAI-compatible format
    if (data.data && data.data[0] && data.data[0].embedding) {
      return data.data[0].embedding;
    }
    
    throw new Error('Invalid response format from Zhipu AI');
  }

  async batchGenerateEmbeddings(
    texts: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Process one by one (Zhipu AI may support batch, but process individually for safety)
    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i]);
      embeddings.push(embedding);

      if (onProgress) {
        onProgress(i + 1, texts.length);
      }
    }

    return embeddings;
  }
}

// Qwen (Alibaba Cloud) Embeddings Provider
class QwenEmbeddingsProvider implements EmbeddingsProvider {
  name = 'qwen';
  dimensions = 1536;
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: EmbeddingsConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://dashscope.aliyuncs.com/api/v1';
    this.model = config.model || 'text-embedding-v1';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Qwen API call
    const response = await fetch(`${this.baseURL}/services/embeddings/text-embedding/text-embedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          texts: [text],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.output.embeddings[0].embedding;
  }

  async batchGenerateEmbeddings(
    texts: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i]);
      embeddings.push(embedding);

      if (onProgress) {
        onProgress(i + 1, texts.length);
      }
    }

    return embeddings;
  }
}

// Wenxin (Baidu) Embeddings Provider
class WenxinEmbeddingsProvider implements EmbeddingsProvider {
  name = 'wenxin';
  dimensions = 384;
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: EmbeddingsConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop';
    this.model = config.model || 'embedding-v1';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Wenxin API call
    const response = await fetch(`${this.baseURL}/embeddings/${this.model}?access_token=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [text],
      }),
    });

    if (!response.ok) {
      throw new Error(`Wenxin API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async batchGenerateEmbeddings(
    texts: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i]);
      embeddings.push(embedding);

      if (onProgress) {
        onProgress(i + 1, texts.length);
      }
    }

    return embeddings;
  }
}

// Provider factory
export function createEmbeddingsProvider(config: EmbeddingsConfig): EmbeddingsProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIEmbeddingsProvider(config);
    case 'youdao':
      return new YoudaoEmbeddingsProvider(config);
    case 'zhipu':
      return new ZhipuEmbeddingsProvider(config);
    case 'qwen':
      return new QwenEmbeddingsProvider(config);
    case 'wenxin':
      return new WenxinEmbeddingsProvider(config);
    default:
      throw new Error(`Unknown embeddings provider: ${config.provider}`);
  }
}

// Get embeddings configuration from localStorage
export function getEmbeddingsConfig(): EmbeddingsConfig {
  const provider = (localStorage.getItem('embeddings_provider') || 'openai') as EmbeddingsConfig['provider'];
  const apiKey = localStorage.getItem('embeddings_api_key') || localStorage.getItem('openai_api_key') || '';
  const baseURL = localStorage.getItem('embeddings_base_url') || undefined;
  const model = localStorage.getItem('embeddings_model') || undefined;

  return {
    provider,
    apiKey,
    baseURL,
    model,
  };
}

// Save embeddings configuration to localStorage
export function saveEmbeddingsConfig(config: Partial<EmbeddingsConfig>): void {
  if (config.provider) {
    localStorage.setItem('embeddings_provider', config.provider);
  }
  if (config.apiKey) {
    localStorage.setItem('embeddings_api_key', config.apiKey);
  }
  if (config.baseURL) {
    localStorage.setItem('embeddings_base_url', config.baseURL);
  } else {
    localStorage.removeItem('embeddings_base_url');
  }
  if (config.model) {
    localStorage.setItem('embeddings_model', config.model);
  } else {
    localStorage.removeItem('embeddings_model');
  }
}

// Provider metadata
export const EMBEDDINGS_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'International standard, best quality',
    dimensions: 1536,
    defaultModel: 'text-embedding-3-small',
    baseURL: 'https://api.openai.com/v1',
    pricing: '$0.00002/1K tokens',
    languages: ['en', 'zh', 'multi'],
  },
  {
    id: 'youdao',
    name: 'Youdao BCEmbedding',
    description: 'China service, RAG-optimized, bilingual',
    dimensions: 768,
    defaultModel: 'bce-embedding-base_v1',
    baseURL: 'https://aidemo.youdao.com/trans',
    pricing: '¥0.0001/1K tokens (~$0.000014)',
    languages: ['zh', 'en'],
    recommended: true, // Best for Chinese RAG
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (GLM)',
    description: 'China service, Tsinghua University',
    dimensions: 1024,
    defaultModel: 'embedding-2',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    pricing: '¥0.0001/1K tokens',
    languages: ['zh', 'en'],
  },
  {
    id: 'qwen',
    name: 'Qwen (Alibaba Cloud)',
    description: 'China service, Alibaba Cloud',
    dimensions: 1536,
    defaultModel: 'text-embedding-v1',
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    pricing: '¥0.0007/1K tokens',
    languages: ['zh', 'en'],
  },
  {
    id: 'wenxin',
    name: 'Wenxin (Baidu)',
    description: 'China service, Baidu',
    dimensions: 384,
    defaultModel: 'embedding-v1',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    pricing: '¥0.0004/1K tokens',
    languages: ['zh'],
  },
] as const;
