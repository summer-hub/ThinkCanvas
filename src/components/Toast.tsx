/**
 * Toast 通知组件
 * 显示临时的成功/错误/信息提示
 */

import React, { useEffect, useState } from 'react';
import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const typeStyles = {
    success: {
      bg: 'bg-green-500/90',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-500/90',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-500/90',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-500/90',
      icon: 'ℹ️',
    },
  };

  const style = typeStyles[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px] pointer-events-auto transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
    >
      <span className="text-xl flex-shrink-0">{style.icon}</span>
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Helper functions for easy toast usage
export const toast = {
  success: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'success', message, duration });
  },
  error: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'error', message, duration });
  },
  info: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'info', message, duration });
  },
  warning: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration });
  },
};
