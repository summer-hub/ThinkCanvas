/**
 * 统计表格组件
 * 显示章节占比和字数统计
 */

import React from 'react';

interface Section {
  title: string;
  weight: number;
  wordCount: number;
}

interface Props {
  sections: Section[];
  totalWords: number;
}

export default function StatisticsTable({ sections, totalWords }: Props) {
  // 按权重排序
  const sortedSections = [...sections].sort((a, b) => b.weight - a.weight);

  // 获取权重对应的颜色
  const getWeightColor = (weight: number) => {
    if (weight >= 30) return 'bg-red-500';
    if (weight >= 20) return 'bg-orange-500';
    if (weight >= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center text-canvas-text-muted">
        <div className="text-4xl mb-3">📊</div>
        <p>暂无章节数据</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-canvas-text mb-3">章节占比统计</h3>
      
      {/* Table */}
      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <div
            key={index}
            className="p-3 bg-canvas-bg rounded-lg hover:bg-canvas-bg/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-canvas-text font-medium truncate flex-1">
                {section.title}
              </span>
              <span className="text-sm font-semibold text-canvas-accent ml-2">
                {section.weight}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-canvas-node rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getWeightColor(section.weight)} transition-all duration-300`}
                style={{ width: `${section.weight}%` }}
              />
            </div>
            
            <div className="mt-2 text-xs text-canvas-text-muted">
              {section.wordCount.toLocaleString()} 字
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-canvas-bg rounded-lg border border-canvas-border">
        <div className="text-xs text-canvas-text-muted mb-2">章节分布</div>
        <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden">
          {sortedSections.map((section, index) => (
            <div
              key={index}
              className={`h-full ${getWeightColor(section.weight)}`}
              style={{ width: `${section.weight}%` }}
              title={`${section.title}: ${section.weight}%`}
            />
          ))}
        </div>
        <div className="mt-2 text-xs text-canvas-text-muted">
          总计 {totalWords.toLocaleString()} 字，{sections.length} 个章节
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-canvas-bg rounded-lg">
        <div className="text-xs text-canvas-text-muted mb-2">权重说明</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-canvas-text-muted">≥30% - 核心章节</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-canvas-text-muted">20-29% - 重要章节</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-canvas-text-muted">10-19% - 一般章节</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-canvas-text-muted">&lt;10% - 次要章节</span>
          </div>
        </div>
      </div>
    </div>
  );
}
