/**
 * AI Provider Registry
 * All providers use OpenAI-compatible API protocol.
 * Just configure baseURL + apiKey + model name.
 */

export interface AIProvider {
  id: string;
  name: string;
  baseURL: string;
  defaultModel: string;
  enabled: boolean;
  description?: string;
}

export const BUILT_IN_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-reasoner',
    enabled: true,
    description: 'DeepSeek Reasoner - 强大的推理能力，适合深度思考',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    enabled: true,
    description: 'DeepSeek Chat - 快速响应，适合日常对话',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    enabled: true,
    description: 'OpenAI GPT-4o-mini',
  },
  {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    enabled: true,
    description: 'OpenAI GPT-4o - 更强推理',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    baseURL: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-20250514',
    enabled: true,
    description: 'Claude via OpenAI-compatible endpoint',
  },
  {
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    enabled: true,
    description: 'Groq - 免费快速，支持 Llama/Mixtral',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    enabled: true,
    description: '本地模型，通过 Ollama 运行时',
  },
  {
    id: 'custom',
    name: 'Custom',
    baseURL: '',
    defaultModel: '',
    enabled: false,
    description: '自定义 OpenAI 兼容 API',
  },
];

export interface ProviderConfig {
  providerId: string;
  apiKey: string;
  baseURL?: string; // override
  model?: string; // override
}

let activeConfig: ProviderConfig = {
  providerId: 'deepseek',
  apiKey: '',
};

let customProviders: AIProvider[] = [];

export function getActiveProvider(): AIProvider {
  const builtIn = BUILT_IN_PROVIDERS.find(p => p.id === activeConfig.providerId);
  const custom = customProviders.find(p => p.id === activeConfig.providerId);
  const provider = custom || builtIn;

  if (!provider) {
    return {
      id: activeConfig.providerId,
      name: activeConfig.providerId,
      baseURL: activeConfig.baseURL || '',
      defaultModel: activeConfig.model || 'gpt-4o-mini',
      enabled: true,
    };
  }

  return {
    ...provider,
    baseURL: activeConfig.baseURL || provider.baseURL,
    defaultModel: activeConfig.model || provider.defaultModel,
  };
}

export function getAllProviders(): AIProvider[] {
  return [...BUILT_IN_PROVIDERS, ...customProviders];
}

export function configureProvider(config: ProviderConfig) {
  activeConfig = config;
}

export function getActiveConfig(): ProviderConfig {
  return { ...activeConfig };
}

export function addCustomProvider(provider: AIProvider) {
  const existing = customProviders.findIndex(p => p.id === provider.id);
  if (existing >= 0) {
    customProviders[existing] = provider;
  } else {
    customProviders.push(provider);
  }
}
