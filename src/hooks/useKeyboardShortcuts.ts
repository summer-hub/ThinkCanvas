import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useHistoryStore } from '@/store/historyStore';

interface KeyboardShortcutsOptions {
  onOpenSearch?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const selectedNodeId = useCanvasStore(s => s.selectedNodeId);
  const deleteNode = useCanvasStore(s => s.deleteNode);
  const selectNode = useCanvasStore(s => s.selectNode);
  const restoreSnapshot = useCanvasStore(s => s.restoreSnapshot);
  
  const undo = useHistoryStore(s => s.undo);
  const redo = useHistoryStore(s => s.redo);
  const canUndo = useHistoryStore(s => s.canUndo);
  const canRedo = useHistoryStore(s => s.canRedo);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Search: Ctrl/Cmd + F
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        options.onOpenSearch?.();
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isTyping) {
        e.preventDefault();
        if (canUndo()) {
          const snapshot = undo();
          if (snapshot) {
            restoreSnapshot(snapshot.nodes, snapshot.edges);
          }
        }
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) {
          const snapshot = redo();
          if (snapshot) {
            restoreSnapshot(snapshot.nodes, snapshot.edges);
          }
        }
        return;
      }

      // Delete selected node (Delete or Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && !isTyping) {
        e.preventDefault();
        deleteNode(selectedNodeId);
        return;
      }

      // Deselect node (Escape)
      if (e.key === 'Escape' && selectedNodeId) {
        e.preventDefault();
        selectNode(null);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, deleteNode, selectNode, undo, redo, canUndo, canRedo, restoreSnapshot, options]);
}
