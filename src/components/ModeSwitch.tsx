/**
 * AI 模式切换组件
 * 在 Agent 和 Inspire 模式之间切换
 */

import React, { useState } from 'react';
import { getAllModes, type AIMode, type ModeConfig } from '@/lib/aiModes';

interface Props {
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

export default function ModeSwitch({ currentMode, onModeChange }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const modes = getAllModes();
  const currentModeConfig = modes.find(m => m.id === currentMode)!;

  return (
    <div className="relative">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 p-2 bg-canvas-bg rounded-lg border border-canvas-border">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentMode === mode.id
                ? 'bg-canvas-accent text-white shadow-lg'
                : 'text-canvas-text-muted hover:text-canvas-text hover:bg-canvas-node'
            }`}
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.name}
          </button>
        ))}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-canvas-text-muted hover:text-canvas-text transition-colors"
          title="查看模式详情"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Mode Details Dropdown */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          
          {/* Details Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-canvas-node border border-canvas-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {modes.map((mode) => (
                <div
                  key={mode.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    currentMode === mode.id
                      ? 'border-canvas-accent bg-canvas-accent/10'
                      : 'border-canvas-border bg-canvas-bg'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-canvas-text">
                        {mode.nameCn}
                      </h3>
                      <p className="text-xs text-canvas-text-muted">
                        {mode.descriptionCn}
                      </p>
                    </div>
                    {currentMode === mode.id && (
                      <span className="text-xs px-2 py-1 bg-canvas-accent text-white rounded">
                        当前
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-canvas-text-muted mb-2">适用场景：</p>
                    <div className="flex flex-wrap gap-1">
                      {mode.useCasesCn.map((useCase, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-canvas-bg border border-canvas-border rounded"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  {currentMode !== mode.id && (
                    <button
                      onClick={() => {
                        onModeChange(mode.id);
                        setShowDetails(false);
                      }}
                      className="mt-3 w-full px-3 py-2 bg-canvas-bg hover:bg-canvas-accent/20 border border-canvas-border rounded-lg text-xs text-canvas-text transition-colors"
                    >
                      切换到 {mode.nameCn}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-canvas-bg rounded-lg border border-canvas-border">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-canvas-text mb-1">
                    使用建议
                  </p>
                  <ul className="text-xs text-canvas-text-muted space-y-1">
                    <li>• <strong>Agent 模式</strong>：当你有明确的任务需要完成时使用</li>
                    <li>• <strong>Inspire 模式</strong>：当你需要探索想法、寻找灵感时使用</li>
                    <li>• 可以随时切换模式以适应不同的工作流程</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
