/**
 * 分析面板 - 右侧边栏
 * 显示文档统计、章节占比、AI 洞察
 */

import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import StatisticsTable from './StatisticsTable';
import InsightsList from './InsightsList';
import AnalysisProgress, { type AnalysisStep } from './AnalysisProgress';

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface DocumentAnalysis {
  title: string;
  sections: Array<{
    title: string;
    weight: number;
    wordCount: number;
  }>;
  insights: string[];
  totalWords: number;
  nodeCount: number;
}

export default function AnalysisPanel({ isCollapsed, onToggle }: Props) {
  const nodes = useCanvasStore(s => s.nodes);
  const isAnalyzing = useCanvasStore(s => s.isAnalyzing);
  const analysisSteps = useCanvasStore(s => s.analysisSteps);
  const currentAnalysisStep = useCanvasStore(s => s.currentAnalysisStep);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'statistics' | 'insights'>('statistics');

  // 分析当前画布
  useEffect(() => {
    analyzeCanvas();
  }, [nodes]);

  const analyzeCanvas = () => {
    if (nodes.length === 0) {
      setAnalysis(null);
      return;
    }

    // 查找根节点（紫色节点或第一个节点）
    const rootNode = nodes.find(n => n.data.color === '#9333ea') || nodes[0];
    
    // 查找章节节点（蓝色节点）
    const sectionNodes = nodes.filter(n => n.data.color === '#3b82f6');
    
    // 查找洞察节点（橙色节点）
    const insightNodes = nodes.filter(n => n.data.color === '#f59e0b');

    // 计算总字数
    const totalWords = nodes.reduce((sum, node) => {
      return sum + (node.data.content?.split(/\s+/).length || 0);
    }, 0);

    // 提取章节信息
    const sections = sectionNodes.map(node => {
      const content = node.data.content || '';
      const wordCount = content.split(/\s+/).length;
      
      // 提取标题（第一行）
      const lines = content.split('\n');
      const title = lines[0].replace(/^📑\s*/, '').trim();
      
      return {
        title,
        wordCount,
        weight: totalWords > 0 ? Math.round((wordCount / totalWords) * 100) : 0,
      };
    });

    // 提取洞察
    const insights = insightNodes.map(node => {
      const content = node.data.content || '';
      // 移除图标和标题，只保留内容
      return content.replace(/^💡.*?\n\n/, '').trim();
    });

    setAnalysis({
      title: rootNode.data.content?.split('\n')[0].replace(/^🎯\s*/, '').trim() || '未命名文档',
      sections,
      insights,
      totalWords,
      nodeCount: nodes.length,
    });
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-canvas-node border-l border-canvas-border flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-canvas-bg rounded-lg transition-colors"
          title="展开分析面板"
        >
          <svg className="w-5 h-5 text-canvas-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="mt-4 text-xs text-canvas-text-muted rotate-90 whitespace-nowrap">
          分析
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-canvas-node border-l border-canvas-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-canvas-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-canvas-text flex items-center gap-2">
          📊 文档分析
        </h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-canvas-bg rounded transition-colors"
          title="折叠面板"
        >
          <svg className="w-5 h-5 text-canvas-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-canvas-border">
        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'statistics'
              ? 'text-canvas-accent border-b-2 border-canvas-accent'
              : 'text-canvas-text-muted hover:text-canvas-text'
          }`}
        >
          📈 统计
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'text-canvas-accent border-b-2 border-canvas-accent'
              : 'text-canvas-text-muted hover:text-canvas-text'
          }`}
        >
          💡 洞察
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isAnalyzing ? (
          <div className="p-4">
            <AnalysisProgress 
              steps={analysisSteps}
              currentStep={currentAnalysisStep}
            />
          </div>
        ) : !analysis ? (
          <div className="p-8 text-center text-canvas-text-muted">
            <div className="text-4xl mb-3">📊</div>
            <p className="mb-2">暂无分析数据</p>
            <p className="text-xs">上传文档后将自动显示分析结果</p>
          </div>
        ) : (
          <>
            {/* Document Info */}
            <div className="p-4 border-b border-canvas-border">
              <h3 className="text-sm font-medium text-canvas-text mb-3">
                {analysis.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-canvas-bg rounded-lg">
                  <div className="text-xs text-canvas-text-muted mb-1">总字数</div>
                  <div className="text-lg font-semibold text-canvas-text">
                    {analysis.totalWords.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-canvas-bg rounded-lg">
                  <div className="text-xs text-canvas-text-muted mb-1">节点数</div>
                  <div className="text-lg font-semibold text-canvas-text">
                    {analysis.nodeCount}
                  </div>
                </div>
                <div className="p-3 bg-canvas-bg rounded-lg">
                  <div className="text-xs text-canvas-text-muted mb-1">章节数</div>
                  <div className="text-lg font-semibold text-canvas-text">
                    {analysis.sections.length}
                  </div>
                </div>
                <div className="p-3 bg-canvas-bg rounded-lg">
                  <div className="text-xs text-canvas-text-muted mb-1">洞察数</div>
                  <div className="text-lg font-semibold text-canvas-text">
                    {analysis.insights.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'statistics' ? (
              <StatisticsTable sections={analysis.sections} totalWords={analysis.totalWords} />
            ) : (
              <InsightsList insights={analysis.insights} />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-canvas-border">
        <button
          onClick={analyzeCanvas}
          className="w-full px-3 py-2 bg-canvas-bg hover:bg-canvas-accent/20 border border-canvas-border rounded-lg text-sm text-canvas-text transition-colors"
        >
          🔄 刷新分析
        </button>
      </div>
    </div>
  );
}
