import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

interface Props {
  nodeId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onColorChange: () => void;
}

export default function NodeContextMenu({ nodeId, position, onClose, onColorChange }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteNode = useCanvasStore(s => s.deleteNode);
  const addNode = useCanvasStore(s => s.addNode);
  const nodes = useCanvasStore(s => s.nodes);
  const selectedNode = nodes.find(n => n.id === nodeId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleDelete() {
    deleteNode(nodeId);
    onClose();
  }

  function handleDuplicate() {
    if (!selectedNode) return;
    addNode(
      selectedNode.data.content,
      { x: selectedNode.position.x + 50, y: selectedNode.position.y + 50 },
      selectedNode.type
    );
    onClose();
  }

  function handleExport() {
    if (!selectedNode) return;
    const text = `[${selectedNode.type}] ${selectedNode.data.content}`;
    navigator.clipboard.writeText(text).catch(() => {});
    onClose();
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-canvas-node border border-canvas-border rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={onColorChange}
        className="w-full px-3 py-2 text-sm text-canvas-text hover:bg-canvas-bg text-left flex items-center gap-2"
      >
        <span>🎨</span> Change Color
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full px-3 py-2 text-sm text-canvas-text hover:bg-canvas-bg text-left flex items-center gap-2"
      >
        <span>📋</span> Duplicate
      </button>
      <button
        onClick={handleExport}
        className="w-full px-3 py-2 text-sm text-canvas-text hover:bg-canvas-bg text-left flex items-center gap-2"
      >
        <span>📤</span> Copy to Clipboard
      </button>
      <div className="border-t border-canvas-border my-1" />
      <button
        onClick={handleDelete}
        className="w-full px-3 py-2 text-sm text-red-400 hover:bg-canvas-bg text-left flex items-center gap-2"
      >
        <span>🗑️</span> Delete
      </button>
    </div>
  );
}
