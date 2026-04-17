import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/Canvas';
import { I18nProvider } from './components/I18nProvider';

export default function App() {
  useEffect(() => {
    // Auto-configure DeepSeek API on startup
    const configureDeepSeek = async () => {
      try {
        const response = await fetch('/config.json');
        if (response.ok) {
          const config = await response.json();
          if (config.apiKey && !localStorage.getItem('openai_api_key')) {
            localStorage.setItem('openai_api_key', config.apiKey);
            
            // Save provider config
            localStorage.setItem('ai_provider_config', JSON.stringify({
              providerId: config.defaultProvider || 'deepseek',
              baseURL: 'https://api.deepseek.com/v1',
              model: 'deepseek-reasoner',
            }));
            
            console.log('✅ DeepSeek API configured automatically');
            
            // Configure provider if electron is available
            if (window.electron?.ai) {
              await window.electron.ai.configure({
                providerId: config.defaultProvider || 'deepseek',
                apiKey: config.apiKey,
                baseURL: 'https://api.deepseek.com/v1',
                model: 'deepseek-reasoner',
              });
            }
          }
        }
      } catch (error) {
        console.log('ℹ️ No auto-config found, please configure manually');
      }
    };
    
    configureDeepSeek();
  }, []);

  return (
    <I18nProvider>
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </I18nProvider>
  );
}
