import React, { useState, useEffect } from 'react';
import { getAllProviders, getActiveProvider, configureAI, type AIProvider, type ProviderConfig } from '@/lib/ai';
import { EMBEDDINGS_PROVIDERS, saveEmbeddingsConfig, getEmbeddingsConfig } from '@/lib/embeddingsProvider';
import { resetEmbeddingsProvider } from '@/lib/embeddings';

interface Props {
  onClose: () => void;
}

export default function ProviderSettings({ onClose }: Props) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [customURL, setCustomURL] = useState('');
  const [customModel, setCustomModel] = useState('');
  
  // Embeddings configuration
  const [embeddingsProvider, setEmbeddingsProvider] = useState<string>('openai');
  const [embeddingsApiKey, setEmbeddingsApiKey] = useState('');
  const [embeddingsBaseURL, setEmbeddingsBaseURL] = useState('');
  const [embeddingsModel, setEmbeddingsModel] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllProviders().then(setProviders).catch(() => {});
    getActiveProvider().then(result => {
      if (result) {
        setSelectedProvider(result.provider.id);
        setCustomURL(result.provider.baseURL);
        setCustomModel(result.provider.defaultModel);
      }
    }).catch(() => {});
    
    // Load embeddings configuration
    const embConfig = getEmbeddingsConfig();
    setEmbeddingsProvider(embConfig.provider);
    setEmbeddingsApiKey(embConfig.apiKey);
    setEmbeddingsBaseURL(embConfig.baseURL || '');
    setEmbeddingsModel(embConfig.model || '');
  }, []);

  async function handleSave() {
    if (!apiKey.trim() && selectedProvider !== 'ollama') {
      setError('API key is required');
      return;
    }

    if (!embeddingsApiKey.trim()) {
      setError('Embeddings API key is required');
      return;
    }

    setSaving(true);
    setError('');

    const provider = providers.find(p => p.id === selectedProvider);
    const config: ProviderConfig = {
      providerId: selectedProvider,
      apiKey: apiKey.trim(),
      baseURL: provider?.baseURL,
      model: customModel.trim() || provider?.defaultModel,
    };

    try {
      await configureAI(config);
      localStorage.setItem('openai_api_key', apiKey.trim());
      
      // Save embeddings configuration
      saveEmbeddingsConfig({
        provider: embeddingsProvider as any,
        apiKey: embeddingsApiKey.trim(),
        baseURL: embeddingsBaseURL.trim() || undefined,
        model: embeddingsModel.trim() || undefined,
      });
      
      // Reset embeddings provider to use new config
      resetEmbeddingsProvider();
      
      onClose();
    } catch (e) {
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-canvas-node border border-canvas-border rounded-xl p-6 w-[520px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-canvas-text">AI Provider Settings</h2>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="text-sm text-canvas-text-muted mb-1 block">Provider</label>
            <select
              value={selectedProvider}
              onChange={e => {
                setSelectedProvider(e.target.value);
                const p = providers.find(p => p.id === e.target.value);
                if (p) {
                  setCustomURL(p.baseURL);
                  setCustomModel(p.defaultModel);
                }
              }}
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text focus:outline-none focus:border-canvas-accent"
            >
              <option value="">Select a provider...</option>
              {providers.filter(p => p.enabled || p.id === selectedProvider).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.description ? `- ${p.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm text-canvas-text-muted mb-1 block">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={selectedProviderData?.id === 'ollama' ? 'not required for local' : 'sk-...'}
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text placeholder-canvas-text-muted focus:outline-none focus:border-canvas-accent"
            />
          </div>

          {/* Base URL (shown for custom or info) */}
          <div>
            <label className="text-sm text-canvas-text-muted mb-1 block">API Endpoint</label>
            <input
              type="text"
              value={customURL}
              onChange={e => setCustomURL(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text placeholder-canvas-text-muted focus:outline-none focus:border-canvas-accent"
            />
          </div>

          {/* Model */}
          <div>
            <label className="text-sm text-canvas-text-muted mb-1 block">Model</label>
            <input
              type="text"
              value={customModel}
              onChange={e => setCustomModel(e.target.value)}
              placeholder={selectedProviderData?.defaultModel || 'gpt-4o-mini'}
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text placeholder-canvas-text-muted focus:outline-none focus:border-canvas-accent"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          {/* Quick Tips */}
          {selectedProvider === 'deepseek' && (
            <div className="text-xs text-canvas-text-muted bg-canvas-bg rounded p-2">
              💡 Get DeepSeek API key at <span className="text-canvas-accent">platform.deepseek.com</span>
            </div>
          )}
          {selectedProvider === 'ollama' && (
            <div className="text-xs text-canvas-text-muted bg-canvas-bg rounded p-2">
              💡 Make sure Ollama is running locally. Get it at <span className="text-canvas-accent">ollama.com</span>
            </div>
          )}

          {/* Embeddings Provider Section */}
          <div className="text-sm font-semibold text-canvas-text border-t border-canvas-border pt-4 mt-6">
            Embeddings Provider (for RAG)
          </div>

          {/* Embeddings Provider Selection */}
          <div>
            <label className="text-sm text-canvas-text-muted mb-1 block">Embeddings Provider</label>
            <select
              value={embeddingsProvider}
              onChange={e => {
                setEmbeddingsProvider(e.target.value);
                const p = EMBEDDINGS_PROVIDERS.find(p => p.id === e.target.value);
                if (p) {
                  setEmbeddingsBaseURL(p.baseURL);
                  setEmbeddingsModel(p.defaultModel);
                }
              }}
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text focus:outline-none focus:border-canvas-accent"
            >
              {EMBEDDINGS_PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.recommended ? '⭐' : ''} - {p.description}
                </option>
              ))}
            </select>
          </div>

          {/* Embeddings API Key */}
          <div>
            <label className="text-sm text-canvas-text-muted mb-1 block">Embeddings API Key</label>
            <input
              type="password"
              value={embeddingsApiKey}
              onChange={e => setEmbeddingsApiKey(e.target.value)}
              placeholder="API key for embeddings"
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text placeholder-canvas-text-muted focus:outline-none focus:border-canvas-accent"
            />
          </div>

          {/* Embeddings Tips */}
          {embeddingsProvider === 'youdao' && (
            <div className="text-xs text-canvas-text-muted bg-canvas-bg rounded p-2">
              ⭐ Youdao BCEmbedding is recommended for Chinese RAG. Get API key at <span className="text-canvas-accent">ai.youdao.com</span>
            </div>
          )}
          {embeddingsProvider === 'zhipu' && (
            <div className="text-xs text-canvas-text-muted bg-canvas-bg rounded p-2">
              💡 Get Zhipu AI API key at <span className="text-canvas-accent">open.bigmodel.cn</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-canvas-text-muted hover:text-canvas-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedProvider}
            className="px-4 py-2 text-sm bg-canvas-accent hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
