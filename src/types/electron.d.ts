interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SendToAIParams {
  content: string;
  messages: AIMessage[];
  model?: string;
  apiKey?: string;
}

interface AIResult {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  provider?: string;
}

interface ProviderConfig {
  providerId: string;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

interface AIProvider {
  id: string;
  name: string;
  baseURL: string;
  defaultModel: string;
  enabled: boolean;
  description?: string;
}

interface ElectronAI {
  chat: (params: SendToAIParams) => Promise<AIResult>;
  configure: (config: ProviderConfig) => Promise<{ success: boolean }>;
  getProvider: () => Promise<{ provider: AIProvider; hasApiKey: boolean }>;
  getProviders: () => Promise<AIProvider[]>;
  addProvider: (provider: AIProvider) => Promise<{ success: boolean }>;
}

interface ElectronAPI {
  platform: string;
  versions: { node: string; chrome: string; electron: string };
  ai: ElectronAI;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
