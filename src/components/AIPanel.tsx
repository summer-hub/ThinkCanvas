import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { sendToAI } from '@/lib/ai';
import { useI18n } from '@/i18n';
import ProviderSettings from './ProviderSettings';
import FileReferenceAutocomplete from './FileReferenceAutocomplete';
import SourceAttribution from './SourceAttribution';
import ModeSwitch from './ModeSwitch';
import { parseFileReferences } from '@/lib/rag';
import { retrieveContextWithTimeout } from '@/lib/ragIntegration';
import { enhancePrompt } from '@/lib/promptEnhancement';
import { getAllFiles } from '@/lib/fileStorage';
import { manageConversationHistory, formatHistoryForAPI, getHistoryStats } from '@/lib/conversationHistory';
import { getModeSystemPrompt, formatModePrompt, getPreferredMode, savePreferredMode, type AIMode } from '@/lib/aiModes';
import type { AIMessage, UploadedFile } from '@/types';

function AIPanel() {
  const { t } = useI18n();
  const nodes = useCanvasStore(s => s.nodes);
  const selectedNodeId = useCanvasStore(s => s.selectedNodeId);
  const aiMessages = useCanvasStore(s => s.aiMessages);
  const isAIPanelOpen = useCanvasStore(s => s.isAIPanelOpen);
  const isLoadingAI = useCanvasStore(s => s.isLoadingAI);
  const addAIMessage = useCanvasStore(s => s.addAIMessage);
  const addNode = useCanvasStore(s => s.addNode);
  const addEdge = useCanvasStore(s => s.addEdge);
  const selectNode = useCanvasStore(s => s.selectNode);
  const setLoadingAI = useCanvasStore(s => s.setLoadingAI);

  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [currentMode, setCurrentMode] = useState<AIMode>(getPreferredMode());
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [ragStatus, setRagStatus] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  // Handle mode change
  function handleModeChange(mode: AIMode) {
    setCurrentMode(mode);
    savePreferredMode(mode);
  }

  // Load files on mount
  useEffect(() => {
    async function loadFiles() {
      try {
        const allFiles = await getAllFiles();
        setFiles(allFiles);
      } catch (error) {
        console.error('Failed to load files:', error);
      }
    }
    loadFiles();
  }, []);

  useEffect(function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages]);

  // Handle @ character detection for autocomplete
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setInput(value);

    // Detect @ character
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if there's a space after @, if so, close autocomplete
      if (textAfterAt.includes(' ')) {
        setShowAutocomplete(false);
        return;
      }

      // Show autocomplete
      setAutocompleteQuery(textAfterAt);
      setSelectedSuggestionIndex(0);
      setShowAutocomplete(true);

      // Calculate position (below textarea)
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setAutocompletePosition({
          top: rect.bottom + 5,
          left: rect.left,
        });
      }
    } else {
      setShowAutocomplete(false);
    }
  }

  function handleAutocompleteSelect(fileName: string) {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = input.slice(0, cursorPosition);
    const textAfterCursor = input.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newValue = 
        input.slice(0, lastAtIndex) + 
        `@${fileName} ` + 
        textAfterCursor;
      
      setInput(newValue);
      setShowAutocomplete(false);

      // Set cursor position after inserted filename
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = lastAtIndex + fileName.length + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  }

  function handleAutocompleteNavigate(direction: 'up' | 'down') {
    const filteredFiles = files.filter(f => 
      f.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
    ).slice(0, 10);

    if (direction === 'down') {
      setSelectedSuggestionIndex(prev => 
        prev < filteredFiles.length - 1 ? prev + 1 : 0
      );
    } else {
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredFiles.length - 1
      );
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoadingAI) return;

    const userMessage = input.trim();
    const userMsg: AIMessage = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    addAIMessage(userMsg);
    setInput('');
    setShowAutocomplete(false);
    setLoadingAI(true);

    try {
      // Step 1: Parse file references
      setRagStatus(t('aiPanel.parsingReferences'));
      const parseResult = await parseFileReferences(userMessage);
      
      let enhancedPromptData;
      let ragMetadata;

      // Step 2: Retrieve context if there are file references
      if (parseResult.validFiles.length > 0) {
        setRagStatus(`${t('aiPanel.retrievingContext')} (${parseResult.validFiles.length} ${t('header.files')})...`);
        
        const retrievalResult = await retrieveContextWithTimeout(userMessage, {
          topK: 3,
          timeout: 2000,
          maxContextChars: 3000,
        });

        // Show warnings if any
        if (parseResult.invalidFiles.length > 0) {
          const warningMsg = `⚠️ 以下文件未找到或未索引: ${parseResult.invalidFiles.join(', ')}`;
          addAIMessage({ 
            role: 'assistant', 
            content: warningMsg, 
            timestamp: new Date().toISOString() 
          });
        }

        if (retrievalResult.warnings.length > 0) {
          retrievalResult.warnings.forEach(warning => {
            addAIMessage({ 
              role: 'assistant', 
              content: `⚠️ ${warning}`, 
              timestamp: new Date().toISOString() 
            });
          });
        }

        // Step 3: Enhance prompt with context
        if (retrievalResult.success && retrievalResult.chunks.length > 0) {
          setRagStatus(t('aiPanel.enhancingPrompt'));
          enhancedPromptData = enhancePrompt(
            parseResult.cleanMessage,
            retrievalResult.chunks,
            aiMessages
          );

          ragMetadata = {
            chunks: retrievalResult.chunks,
            retrievalTime: retrievalResult.metadata.retrievalTime,
            truncated: retrievalResult.metadata.chunksTruncated,
            warnings: retrievalResult.warnings,
          };
        } else if (retrievalResult.error) {
          // Show error but continue without context
          addAIMessage({ 
            role: 'assistant', 
            content: `❌ 上下文检索失败: ${retrievalResult.error}`, 
            timestamp: new Date().toISOString() 
          });
        }
      }

      // Step 4: Send to AI with managed conversation history
      setRagStatus(t('aiPanel.generatingResponse'));
      
      // Manage conversation history (limit to 10 messages, 4000 tokens)
      const managedHistory = manageConversationHistory(aiMessages, {
        maxMessages: 10,
        maxTokens: 4000,
        preserveSystemMessages: true,
      });
      
      const contextNode = selectedNode ? `The user's current idea: "${selectedNode.data.content}"` : '';
      
      // Get mode-specific system prompt
      const modeSystemPrompt = getModeSystemPrompt(currentMode);
      
      let response: string;
      if (enhancedPromptData) {
        // Use enhanced prompt with RAG context + mode-specific system prompt
        const combinedSystemPrompt = `${modeSystemPrompt}\n\n${enhancedPromptData.systemPrompt}`;
        response = await sendToAI(enhancedPromptData.userPrompt, [
          { role: 'system' as const, content: combinedSystemPrompt },
          ...formatHistoryForAPI(managedHistory),
          { role: 'user' as const, content: contextNode }
        ]);
      } else {
        // Use mode-formatted message without RAG
        const formattedMessage = formatModePrompt(currentMode, userMessage, contextNode);
        response = await sendToAI(formattedMessage, [
          { role: 'system' as const, content: modeSystemPrompt },
          ...formatHistoryForAPI(managedHistory),
        ]);
      }

      const aiMsg: AIMessage = { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date().toISOString(),
        ragMetadata,
      };
      addAIMessage(aiMsg);

      // Create node if there's a selected node
      if (selectedNode && selectedNodeId) {
        const newNodeId = addNode(response, {
          x: selectedNode.position.x + 200,
          y: selectedNode.position.y + 150,
        }, 'ai-response');
        if (newNodeId) {
          addEdge(selectedNodeId, newNodeId);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addAIMessage({ role: 'assistant', content: `Error: ${message}`, timestamp: new Date().toISOString() });
    } finally {
      setLoadingAI(false);
      setRagStatus('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Don't handle Enter if autocomplete is open (let autocomplete handle it)
    if (showAutocomplete && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape')) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isAIPanelOpen) return null;

  return (
    <div className="w-80 bg-canvas-node border-l border-canvas-border flex flex-col h-full">
      <div className="p-3 border-b border-canvas-border flex items-center justify-between">
        <div className="flex-1">
          <span className="text-sm font-medium">{t('aiPanel.title')}</span>
          {aiMessages.length > 0 && (
            <div className="text-[10px] text-canvas-text-muted mt-0.5">
              {(() => {
                const stats = getHistoryStats(aiMessages);
                const contextUsage = Math.round((stats.totalTokens / 4000) * 100);
                return (
                  <span>
                    {stats.totalMessages} {t('aiPanel.messages')} • {stats.totalTokens} {t('aiPanel.tokens')} ({contextUsage}%)
                    {stats.hasRAGContext && ' • 📚 RAG'}
                  </span>
                );
              })()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="text-canvas-text-muted hover:text-canvas-text text-xs"
            title="AI Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => selectNode(null)}
            className="text-canvas-text-muted hover:text-canvas-text text-xs px-2"
            aria-label="Close AI panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="p-3 border-b border-canvas-border">
        <ModeSwitch currentMode={currentMode} onModeChange={handleModeChange} />
      </div>

      {selectedNode && (
        <div className="p-3 border-b border-canvas-border bg-canvas-bg">
          <p className="text-xs text-canvas-text-muted mb-1">{t('aiPanel.thinkingAbout')}</p>
          <p className="text-sm text-canvas-text line-clamp-3">{selectedNode.data.content}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiMessages.length === 0 && (
          <div className="text-center mt-8 space-y-2">
            <p className="text-xs text-canvas-text-muted">
              {t('aiPanel.startConversation')}
            </p>
            <div className="text-xs text-canvas-text-muted/60 space-y-1">
              <p>💡 {t('aiPanel.askQuestions')}</p>
              <p>🔍 {t('aiPanel.exploreConnections')}</p>
              <p>✨ {t('aiPanel.generateInsights')}</p>
            </div>
          </div>
        )}
        {aiMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-canvas-accent text-white'
                : msg.content.startsWith('Error:') || msg.content.startsWith('❌')
                ? 'bg-red-900/30 border border-red-500/50 text-red-200'
                : msg.content.startsWith('⚠️')
                ? 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-200'
                : 'bg-canvas-bg border border-canvas-border text-canvas-text'
            }`}>
              {msg.content}
              {msg.role === 'assistant' && msg.ragMetadata && (
                <SourceAttribution message={msg} />
              )}
            </div>
          </div>
        ))}
        {isLoadingAI && (
          <div className="flex items-start">
            <div className="bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-canvas-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-canvas-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-canvas-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-canvas-text-muted">
                  {ragStatus || t('aiPanel.thinking')}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-canvas-border relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t('aiPanel.placeholder')}
              rows={2}
              className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-sm text-canvas-text placeholder-canvas-text-muted resize-none focus:outline-none focus:border-canvas-accent"
            />
            {showAutocomplete && (
              <FileReferenceAutocomplete
                files={files}
                query={autocompleteQuery}
                position={autocompletePosition}
                selectedIndex={selectedSuggestionIndex}
                onSelect={handleAutocompleteSelect}
                onClose={() => setShowAutocomplete(false)}
                onNavigate={handleAutocompleteNavigate}
              />
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoadingAI}
            className="px-3 bg-canvas-accent hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            {isLoadingAI ? '...' : '\u2192'}
          </button>
        </div>
      </div>

      {showSettings && <ProviderSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default AIPanel;
