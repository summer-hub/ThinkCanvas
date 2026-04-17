import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

interface Props {
  onClose: () => void;
}

export default function ImportModal({ onClose }: Props) {
  const [text, setText] = useState('');
  const addNode = useCanvasStore(s => s.addNode);

  useEffect(() => {
    // Close on Escape key
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleImport = () => {
    if (!text.trim()) return;
    
    // Split by double newlines to create multiple nodes if needed
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    if (paragraphs.length === 1) {
      // Single node
      addNode(text.trim(), { x: 300, y: 200 });
    } else {
      // Multiple nodes in a vertical layout
      paragraphs.forEach((para, i) => {
        addNode(para.trim(), { x: 300, y: 200 + i * 150 });
      });
    }
    
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleImport();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-canvas-node border border-canvas-border rounded-xl p-6 w-[500px] max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2 text-canvas-text">Import Text</h2>
        <p className="text-xs text-canvas-text-muted mb-4">
          Paste your text below. Separate paragraphs with blank lines to create multiple nodes.
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your text here..."
          className="w-full h-40 bg-canvas-bg border border-canvas-border rounded-lg p-3 text-sm text-canvas-text placeholder-canvas-text-muted resize-none focus:outline-none focus:border-canvas-accent"
          autoFocus
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-canvas-text-muted">
            💡 Press Ctrl+Enter to create
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-canvas-text-muted hover:text-canvas-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!text.trim()}
              className="px-4 py-2 text-sm bg-canvas-accent hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create Node{text.split(/\n\n+/).filter(p => p.trim()).length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
