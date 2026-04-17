import { create } from 'zustand';
import type { PonderNode, PonderEdge } from '@/types';

interface CanvasSnapshot {
  nodes: PonderNode[];
  edges: PonderEdge[];
  timestamp: number;
}

interface HistoryStore {
  past: CanvasSnapshot[];
  future: CanvasSnapshot[];
  maxHistorySize: number;

  // Actions
  pushHistory: (snapshot: CanvasSnapshot) => void;
  undo: () => CanvasSnapshot | null;
  redo: () => CanvasSnapshot | null;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  maxHistorySize: 50, // 限制历史记录数量

  pushHistory: (snapshot) => {
    set((state) => {
      const newPast = [...state.past, snapshot];
      
      // 限制历史记录大小
      if (newPast.length > state.maxHistorySize) {
        newPast.shift(); // 移除最旧的记录
      }

      return {
        past: newPast,
        future: [], // 新操作会清空 redo 栈
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return null;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);

    set({
      past: newPast,
      future: [previous, ...state.future],
    });

    return newPast[newPast.length - 1] || null;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    set({
      past: [...state.past, next],
      future: newFuture,
    });

    return next;
  },

  clear: () => {
    set({ past: [], future: [] });
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },
}));
