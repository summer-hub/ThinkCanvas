/**
 * 加载动画组件
 * 提供多种加载状态的视觉反馈
 */

import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  variant = 'spinner' 
}: Props) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-canvas-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-canvas-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-canvas-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {text && <p className="text-sm text-canvas-text-muted">{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className={`${sizeClasses[size]} bg-canvas-accent rounded-full animate-pulse`} />
        {text && <p className="text-sm text-canvas-text-muted">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-canvas-border border-t-canvas-accent rounded-full animate-spin`} />
      {text && <p className="text-sm text-canvas-text-muted">{text}</p>}
    </div>
  );
}
