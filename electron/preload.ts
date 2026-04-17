import { contextBridge, ipcRenderer } from 'electron';

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

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: { node: process.versions.node, chrome: process.versions.chrome, electron: process.versions.electron },
  ai: {
    chat: (params: SendToAIParams): Promise<AIResult> =>
      ipcRenderer.invoke('ai:chat', params),
    configure: (config: ProviderConfig): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('ai:configure', config),
    getProvider: (): Promise<{ provider: AIProvider; hasApiKey: boolean }> =>
      ipcRenderer.invoke('ai:getProvider'),
    getProviders: (): Promise<AIProvider[]> =>
      ipcRenderer.invoke('ai:getProviders'),
    addProvider: (provider: AIProvider): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('ai:addProvider', provider),
  },
});
