export interface AIAuthor {
  name?: string;
  apiKey?: string;
  baseURL?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  baseURL: string;
  defaultModel: string;
  enabled: boolean;
  description?: string;
}

export interface ProviderConfig {
  providerId: string;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export async function configureAI(config: ProviderConfig): Promise<void> {
  // Save to localStorage for browser mode
  localStorage.setItem('ai_provider_config', JSON.stringify({
    providerId: config.providerId,
    baseURL: config.baseURL,
    model: config.model,
  }));

  if (config.apiKey) {
    localStorage.setItem('openai_api_key', config.apiKey);
  }

  // If in Electron, also configure via IPC
  if (window.electron?.ai) {
    await window.electron.ai.configure(config);
  }
}

export async function sendToAI(
  content: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const apiKey = localStorage.getItem('openai_api_key') || '';

  if (!apiKey) {
    throw new Error('API key not configured. Please set your API key in Settings (⚙️).');
  }

  // If running in Electron, use IPC
  if (window.electron?.ai) {
    const result = await window.electron.ai.chat({
      content,
      messages,
      apiKey,
    });

    if (!result.success) {
      throw new Error(result.error || 'AI request failed');
    }

    return result.content || 'No response received.';
  }

  // If running in browser, call API directly
  try {
    const systemPrompt = `You are a thoughtful thinking partner. Your role is to help users explore ideas deeply by asking questions, identifying blind spots, suggesting connections, and helping structure their thoughts. Be concise, insightful, and focus on deepening understanding rather than just summarizing.`;

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Help me think through this idea: ${content}` },
      ...messages,
    ];

    // Get provider settings from localStorage
    const providerConfig = JSON.parse(localStorage.getItem('ai_provider_config') || '{}');
    const baseURL = providerConfig.baseURL || 'https://api.deepseek.com/v1';
    const model = providerConfig.model || 'deepseek-reasoner';

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received.';
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with AI service');
  }
}

export async function getActiveProvider(): Promise<{ provider: AIProvider; hasApiKey: boolean } | null> {
  // Try Electron first
  if (window.electron?.ai) {
    return window.electron.ai.getProvider();
  }

  // Fallback to localStorage for browser mode
  const config = JSON.parse(localStorage.getItem('ai_provider_config') || '{}');
  const apiKey = localStorage.getItem('openai_api_key') || '';
  
  const providers = await getAllProviders();
  const provider = providers.find(p => p.id === config.providerId) || providers[0];

  return {
    provider: {
      ...provider,
      baseURL: config.baseURL || provider.baseURL,
      defaultModel: config.model || provider.defaultModel,
    },
    hasApiKey: !!apiKey,
  };
}

export async function getAllProviders(): Promise<AIProvider[]> {
  // Try Electron first
  if (window.electron?.ai) {
    return window.electron.ai.getProviders();
  }

  // Fallback to built-in providers for browser mode
  return [
    {
      id: 'deepseek',
      name: 'DeepSeek',
      baseURL: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-reasoner',
      enabled: true,
      description: 'DeepSeek Reasoner - 强大的推理能力',
    },
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      baseURL: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-chat',
      enabled: true,
      description: 'DeepSeek Chat - 快速响应',
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
  ];
}
