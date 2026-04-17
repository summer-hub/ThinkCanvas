import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

interface Props {
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export default function SearchPanel({ onClose, onSelectNode }: Props) {
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodes = useCanvasStore(s => s.nodes);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search logic
  const searchResults = query.trim()
    ? nodes.filter(node =>
        node.data.content.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const hasResults = searchResults.length > 0;
  const currentNode = hasResults ? searchResults[currentIndex] : null;

  // Navigate to previous result
  const handlePrevious = () => {
    if (hasResults) {
      setCurrentIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  // Navigate to next result
  const handleNext = () => {
    if (hasResults) {
      setCurrentIndex((prev) => (prev + 1) % searchResults.length);
    }
  };

  // Select current result
  useEffect(() => {
    if (currentNode) {
      onSelectNode(currentNode.id);
    }
  }, [currentNode, onSelectNode]);

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handlePrevious();
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[500px] max-w-[90vw]">
      <div className="bg-canvas-node border border-canvas-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-2 p-3 border-b border-canvas-border">
          <svg className="w-5 h-5 text-canvas-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent text-canvas-text placeholder-canvas-text-muted focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setCurrentIndex(0);
              }}
              className="text-canvas-text-muted hover:text-canvas-text"
              title="Clear"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-canvas-text-muted hover:text-canvas-text"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results Info */}
        {query && (
          <div className="flex items-center justify-between px-3 py-2 bg-canvas-bg border-b border-canvas-border">
            <span className="text-xs text-canvas-text-muted">
              {hasResults ? (
                <>
                  {currentIndex + 1} of {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </>
              ) : (
                'No results found'
              )}
            </span>
            {hasResults && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevious}
                  className="p-1 text-canvas-text hover:bg-canvas-node rounded transition-colors"
                  title="Previous (Shift+Enter or ↑)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 text-canvas-text hover:bg-canvas-node rounded transition-colors"
                  title="Next (Enter or ↓)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Results List */}
        {query && hasResults && (
          <div className="max-h-[300px] overflow-y-auto">
            {searchResults.map((node, index) => {
              const isActive = index === currentIndex;
              const highlightedContent = highlightMatch(node.data.content, query);
              
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    onSelectNode(node.id);
                  }}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-canvas-accent/20 border-l-2 border-canvas-accent'
                      : 'hover:bg-canvas-bg border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-canvas-text-muted mt-0.5">
                      {node.type === 'ai-response' ? '🤖' : '💭'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-canvas-text line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightedContent }}
                      />
                      <p className="text-xs text-canvas-text-muted mt-1">
                        {new Date(node.data.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Keyboard Hints */}
        <div className="px-3 py-2 bg-canvas-bg border-t border-canvas-border">
          <div className="flex items-center gap-4 text-xs text-canvas-text-muted">
            <span><kbd className="px-1 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Enter</kbd> Next</span>
            <span><kbd className="px-1 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Shift+Enter</kbd> Previous</span>
            <span><kbd className="px-1 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-canvas-accent/30 text-canvas-text">$1</mark>');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
