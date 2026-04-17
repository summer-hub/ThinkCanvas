/**
 * 文档分析进度组件
 * 显示在右侧分析面板，实时展示分析进度
 */

import React from 'react';

export interface AnalysisStep {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  title: string;
  titleEn: string;
  detail?: string;
  detailEn?: string;
  progress?: number; // 0-100
}

interface Props {
  steps: AnalysisStep[];
  currentStep: number;
  onCancel?: () => void;
}

export default function AnalysisProgress({ steps, currentStep, onCancel }: Props) {
  const getStatusIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '🔄';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-canvas-text-muted';
    }
  };

  return (
    <div className="p-4 bg-canvas-node border border-canvas-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-canvas-text flex items-center gap-2">
            <span className="animate-spin">🔄</span>
            AI 文档分析中
          </h3>
          <p className="text-xs text-canvas-text-muted mt-1">
            AI Document Analysis in Progress
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-canvas-text-muted hover:text-canvas-text"
          >
            取消 Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-canvas-text-muted mb-2">
          <span>进度 Progress</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-canvas-bg rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg border transition-all ${
              step.status === 'processing'
                ? 'border-blue-500 bg-blue-500/10'
                : step.status === 'completed'
                ? 'border-green-500/30 bg-green-500/5'
                : step.status === 'error'
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-canvas-border bg-canvas-bg'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">
                {getStatusIcon(step.status)}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${getStatusColor(step.status)}`}>
                  {step.title}
                </div>
                <div className="text-xs text-canvas-text-muted mt-0.5">
                  {step.titleEn}
                </div>
                {step.detail && (
                  <div className="mt-2 text-xs text-canvas-text">
                    {step.detail}
                  </div>
                )}
                {step.detailEn && (
                  <div className="text-xs text-canvas-text-muted">
                    {step.detailEn}
                  </div>
                )}
                {step.status === 'processing' && step.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-canvas-bg rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-canvas-bg rounded-lg border border-canvas-border">
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <div className="flex-1">
            <p className="text-xs text-canvas-text-muted">
              AI 正在深度分析文档，从多个角度提取关键信息并生成知识图谱。
            </p>
            <p className="text-xs text-canvas-text-muted mt-1">
              AI is analyzing the document from multiple perspectives to extract key information and generate a knowledge graph.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
