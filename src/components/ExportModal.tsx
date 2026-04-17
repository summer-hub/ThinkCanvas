import React, { useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { exportToMarkdown, exportToJSON, exportToPNG, downloadFile, generateFilename } from '@/lib/export';

interface Props {
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export default function ExportModal({ onClose, canvasRef }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'markdown' | 'json' | 'png' | null>(null);
  const nodes = useCanvasStore(s => s.nodes);
  const edges = useCanvasStore(s => s.edges);

  const handleExport = async (type: 'markdown' | 'json' | 'png') => {
    setExporting(true);
    setExportType(type);

    try {
      switch (type) {
        case 'markdown': {
          const content = exportToMarkdown(nodes, edges);
          downloadFile(content, generateFilename('ponder-canvas', 'md'), 'text/markdown');
          break;
        }
        case 'json': {
          const content = exportToJSON(nodes, edges);
          downloadFile(content, generateFilename('ponder-canvas', 'json'), 'application/json');
          break;
        }
        case 'png': {
          if (canvasRef.current) {
            await exportToPNG(canvasRef.current);
          }
          break;
        }
      }
      
      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setExportType(null);
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
        <h2 className="text-lg font-semibold mb-2 text-canvas-text">Export Canvas</h2>
        <p className="text-sm text-canvas-text-muted mb-6">
          Choose a format to export your canvas
        </p>

        <div className="space-y-3">
          {/* Markdown Export */}
          <button
            onClick={() => handleExport('markdown')}
            disabled={exporting || nodes.length === 0}
            className="w-full p-4 bg-canvas-bg border border-canvas-border hover:border-canvas-accent rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">📝</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-canvas-text mb-1 group-hover:text-canvas-accent transition-colors">
                  Markdown (.md)
                </h3>
                <p className="text-xs text-canvas-text-muted">
                  Export as formatted text document with headings and structure
                </p>
                <div className="text-xs text-canvas-text-muted mt-2">
                  {nodes.length} nodes, {edges.length} connections
                </div>
              </div>
              {exporting && exportType === 'markdown' && (
                <div className="animate-spin text-canvas-accent">⏳</div>
              )}
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={() => handleExport('json')}
            disabled={exporting || nodes.length === 0}
            className="w-full p-4 bg-canvas-bg border border-canvas-border hover:border-canvas-accent rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-canvas-text mb-1 group-hover:text-canvas-accent transition-colors">
                  JSON (.json)
                </h3>
                <p className="text-xs text-canvas-text-muted">
                  Export as structured data for backup or import into other tools
                </p>
                <div className="text-xs text-canvas-text-muted mt-2">
                  Full data including positions, colors, and metadata
                </div>
              </div>
              {exporting && exportType === 'json' && (
                <div className="animate-spin text-canvas-accent">⏳</div>
              )}
            </div>
          </button>

          {/* PNG Export */}
          <button
            onClick={() => handleExport('png')}
            disabled={exporting || nodes.length === 0}
            className="w-full p-4 bg-canvas-bg border border-canvas-border hover:border-canvas-accent rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🖼️</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-canvas-text mb-1 group-hover:text-canvas-accent transition-colors">
                  Image (.png)
                </h3>
                <p className="text-xs text-canvas-text-muted">
                  Export as high-quality image for sharing or presentations
                </p>
                <div className="text-xs text-canvas-text-muted mt-2">
                  Captures current canvas view
                </div>
              </div>
              {exporting && exportType === 'png' && (
                <div className="animate-spin text-canvas-accent">⏳</div>
              )}
            </div>
          </button>
        </div>

        {nodes.length === 0 && (
          <div className="mt-4 p-3 bg-canvas-bg border border-canvas-border rounded-lg">
            <p className="text-xs text-canvas-text-muted text-center">
              ℹ️ Create some nodes first to enable export
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 text-sm text-canvas-text-muted hover:text-canvas-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
