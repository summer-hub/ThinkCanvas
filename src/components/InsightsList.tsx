/**
 * 洞察列表组件
 * 显示 AI 生成的深层洞察
 */

import React from 'react';

interface Props {
  insights: string[];
}

export default function InsightsList({ insights }: Props) {
  if (insights.length === 0) {
    return (
      <div className="p-8 text-center text-canvas-text-muted">
        <div className="text-4xl mb-3">💡</div>
        <p className="mb-2">暂无洞察数据</p>
        <p className="text-xs">上传文档并启用 AI 分析后将显示洞察</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-canvas-text mb-3">
        核心洞察 ({insights.length})
      </h3>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-orange-400 mb-2">
                  洞察 {index + 1}
                </div>
                <p className="text-sm text-canvas-text leading-relaxed whitespace-pre-wrap">
                  {insight}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-canvas-bg rounded-lg border border-canvas-border">
        <div className="flex items-start gap-2">
          <span className="text-lg">💭</span>
          <div className="flex-1">
            <div className="text-xs font-medium text-canvas-text mb-1">
              关于洞察
            </div>
            <p className="text-xs text-canvas-text-muted leading-relaxed">
              这些洞察由 AI 自动生成，旨在发现文档中的深层问题、结构性缺陷或优化建议。
            </p>
          </div>
        </div>
      </div>

      {/* Insight Types */}
      <div className="mt-4 p-3 bg-canvas-bg rounded-lg">
        <div className="text-xs text-canvas-text-muted mb-2">洞察类型</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🔍</span>
            <div>
              <div className="text-canvas-text font-medium">结构性洞察</div>
              <div className="text-canvas-text-muted">文档组织和结构问题</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📝</span>
            <div>
              <div className="text-canvas-text font-medium">内容性洞察</div>
              <div className="text-canvas-text-muted">信息缺失或冗余</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">✨</span>
            <div>
              <div className="text-canvas-text font-medium">体验性洞察</div>
              <div className="text-canvas-text-muted">可读性和可用性建议</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
