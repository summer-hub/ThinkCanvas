/**
 * 错误消息组件
 * 显示用户友好的错误提示
 */

import React from 'react';

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  title,
  message, 
  onRetry, 
  onDismiss,
  variant = 'error'
}: Props) {
  const variantStyles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'ℹ️',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold ${style.text} mb-1`}>
              {title}
            </h3>
          )}
          <p className="text-sm text-canvas-text-muted break-words">
            {message}
          </p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`px-3 py-1.5 text-sm ${style.text} border ${style.border} rounded hover:bg-canvas-bg transition-colors`}
                >
                  🔄 重试
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 text-sm text-canvas-text-muted border border-canvas-border rounded hover:bg-canvas-bg transition-colors"
                >
                  关闭
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
