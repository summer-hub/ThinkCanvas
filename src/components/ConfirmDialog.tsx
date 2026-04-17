/**
 * 确认对话框组件
 * 用于需要用户确认的操作（如删除多个节点）
 */

import React from 'react';

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'warning',
  onConfirm,
  onCancel,
}: Props) {
  const variantStyles = {
    danger: {
      button: 'bg-red-500 hover:bg-red-600',
      icon: '⚠️',
    },
    warning: {
      button: 'bg-yellow-500 hover:bg-yellow-600',
      icon: '⚠️',
    },
    info: {
      button: 'bg-blue-500 hover:bg-blue-600',
      icon: 'ℹ️',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-canvas-node border border-canvas-border rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-canvas-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{style.icon}</span>
            <h2 className="text-xl font-semibold text-canvas-text">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-canvas-text-muted leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-canvas-border flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-canvas-border hover:bg-canvas-bg text-canvas-text rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm ${style.button} text-white rounded-lg transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
