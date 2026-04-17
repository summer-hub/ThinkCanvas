import React from 'react';

interface Props {
  onClose: () => void;
}

export default function WelcomeScreen({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-canvas-node border border-canvas-border rounded-2xl p-8 w-[600px] max-w-[90vw] shadow-2xl animate-fadeIn">
        <div className="text-center mb-6">
          <span className="text-5xl mb-4 block">🌱</span>
          <h1 className="text-2xl font-bold text-canvas-text mb-2">Welcome to ThinkCanvas</h1>
          <p className="text-sm text-canvas-text-muted">
            Your infinite canvas for thinking with AI
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 p-3 bg-canvas-bg rounded-lg">
            <span className="text-2xl">💭</span>
            <div>
              <h3 className="text-sm font-semibold text-canvas-text mb-1">Create Ideas</h3>
              <p className="text-xs text-canvas-text-muted">
                Double-click anywhere on the canvas to create a new thought node
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-canvas-bg rounded-lg">
            <span className="text-2xl">🔗</span>
            <div>
              <h3 className="text-sm font-semibold text-canvas-text mb-1">Connect Thoughts</h3>
              <p className="text-xs text-canvas-text-muted">
                Drag from one node to another to create connections
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-canvas-bg rounded-lg">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="text-sm font-semibold text-canvas-text mb-1">Chat with AI</h3>
              <p className="text-xs text-canvas-text-muted">
                Select a node to open the AI panel and explore ideas together
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-canvas-bg rounded-lg">
            <span className="text-2xl">⌨️</span>
            <div>
              <h3 className="text-sm font-semibold text-canvas-text mb-1">Keyboard Shortcuts</h3>
              <div className="text-xs text-canvas-text-muted space-y-1">
                <p><kbd className="px-1.5 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Ctrl/Cmd+F</kbd> - Search nodes</p>
                <p><kbd className="px-1.5 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Ctrl/Cmd+Z</kbd> - Undo</p>
                <p><kbd className="px-1.5 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Ctrl/Cmd+Shift+Z</kbd> - Redo</p>
                <p><kbd className="px-1.5 py-0.5 bg-canvas-node border border-canvas-border rounded text-xs">Delete</kbd> - Remove selected node</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-canvas-accent hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
          >
            Start Pondering
          </button>
        </div>
      </div>
    </div>
  );
}
