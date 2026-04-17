/**
 * Source Attribution Component
 * 
 * Displays source files and similarity scores for RAG-enhanced AI responses
 */

import React, { useState } from 'react';
import type { AIMessage } from '@/types';

interface SourceAttributionProps {
  message: AIMessage;
  onRefresh?: () => void;
}

function SourceAttribution({ message, onRefresh }: SourceAttributionProps) {
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  if (!message.ragMetadata || message.ragMetadata.chunks.length === 0) {
    return null;
  }

  const { chunks, retrievalTime, truncated, warnings } = message.ragMetadata;

  // Sort chunks by similarity (descending)
  const sortedChunks = [...chunks].sort((a, b) => b.similarity - a.similarity);

  function toggleChunk(chunkId: string) {
    setExpandedChunks(prev => {
      const next = new Set(prev);
      if (next.has(chunkId)) {
        next.delete(chunkId);
      } else {
        next.add(chunkId);
      }
      return next;
    });
  }

  function getSimilarityColor(similarity: number): string {
    if (similarity > 0.8) return 'text-green-400';
    if (similarity > 0.6) return 'text-yellow-400';
    return 'text-gray-400';
  }

  function getSimilarityBgColor(similarity: number): string {
    if (similarity > 0.8) return 'bg-green-900/20 border-green-500/30';
    if (similarity > 0.6) return 'bg-yellow-900/20 border-yellow-500/30';
    return 'bg-gray-900/20 border-gray-500/30';
  }

  // Check if all chunks have low similarity
  const allLowSimilarity = sortedChunks.every(chunk => chunk.similarity < 0.6);

  return (
    <div className="mt-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-canvas-text-muted">
        <div className="flex items-center gap-2">
          <span>📚 来源 ({chunks.length})</span>
          <span className="opacity-60">• {retrievalTime}ms</span>
          {truncated && <span className="text-yellow-400">• 已截断</span>}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="hover:text-canvas-text transition-colors"
            title="刷新上下文"
          >
            🔄
          </button>
        )}
      </div>

      {/* Warnings */}
      {allLowSimilarity && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-500/30 rounded px-2 py-1">
          ⚠️ 所有来源的相似度较低 (&lt;0.6)，回答可能不够准确
        </div>
      )}

      {warnings.length > 0 && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-500/30 rounded px-2 py-1 space-y-1">
          {warnings.map((warning, i) => (
            <div key={i}>⚠️ {warning}</div>
          ))}
        </div>
      )}

      {/* Source chunks */}
      <div className="space-y-1">
        {sortedChunks.map((chunk, index) => {
          const isExpanded = expandedChunks.has(chunk.id);
          const similarityPercent = Math.round(chunk.similarity * 100);

          return (
            <div
              key={chunk.id}
              className={`text-xs border rounded ${getSimilarityBgColor(chunk.similarity)}`}
            >
              <button
                onClick={() => toggleChunk(chunk.id)}
                className="w-full px-2 py-1.5 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="opacity-60">[{index + 1}]</span>
                  <span className="truncate">{chunk.fileName}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={getSimilarityColor(chunk.similarity)}>
                    {similarityPercent}%
                  </span>
                  <span className="opacity-60">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-2 pb-2 pt-1 border-t border-canvas-border/30">
                  <div className="text-canvas-text-muted whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                    {chunk.content}
                  </div>
                  <div className="mt-1 text-[10px] opacity-50">
                    块 #{chunk.chunkIndex + 1}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SourceAttribution;
