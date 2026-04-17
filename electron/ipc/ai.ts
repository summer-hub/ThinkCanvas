import { ipcMain } from 'electron';
import OpenAI from 'openai';
import {
  type AIProvider,
  type ProviderConfig,
  getActiveProvider,
  configureProvider,
  getActiveConfig,
  addCustomProvider,
  getAllProviders,
} from './providers';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SendToAIParams {
  content: string;
  messages: AIMessage[];
  model?: string; // override active provider's model
  apiKey?: string; // override (for custom endpoint)
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const provider = getActiveProvider();
  const config = getActiveConfig();

  if (!client) {
    client = new OpenAI({
      apiKey: config.apiKey || '',
      baseURL: provider.baseURL,
    });
  } else {
    client.apiKey = config.apiKey || '';
    (client as any).baseURL = provider.baseURL;
  }
  return client;
}

export function setupAIHandlers() {
  // Chat with AI
  ipcMain.handle('ai:chat', async (_event, params: SendToAIParams) => {
    try {
      const provider = getActiveProvider();
      const config = getActiveConfig();
      const model = params.model || provider.defaultModel;

      if (!config.apiKey) {
        return {
          success: false,
          error: 'API key not configured. Please set your API key in Settings.',
        };
      }

      const aiClient = getClient();

      const systemPrompt = `You are a thoughtful thinking partner. Your role is to help users explore ideas deeply by asking questions, identifying blind spots, suggesting connections, and helping structure their thoughts. Be concise, insightful, and focus on deepening understanding rather than just summarizing.`;

      const allMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Help me think through this idea: ${params.content}` },
        ...params.messages,
      ];

      const response = await aiClient.chat.completions.create({
        model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return {
        success: true,
        content: response.choices[0]?.message?.content || 'No response received.',
        model,
        provider: provider.name,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
      };
    }
  });

  // Configure active provider
  ipcMain.handle('ai:configure', async (_event, config: ProviderConfig) => {
    configureProvider(config);
    client = null; // reset client to pick up new config
    return { success: true };
  });

  // Get active provider info
  ipcMain.handle('ai:getProvider', async () => {
    const provider = getActiveProvider();
    const config = getActiveConfig();
    return {
      provider,
      hasApiKey: !!config.apiKey,
    };
  });

  // Get all available providers
  ipcMain.handle('ai:getProviders', async () => {
    return getAllProviders();
  });

  // Add custom provider
  ipcMain.handle('ai:addProvider', async (_event, provider: AIProvider) => {
    addCustomProvider(provider);
    return { success: true };
  });
}
