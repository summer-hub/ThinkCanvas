import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { PonderNode } from '@/types';

interface Props {
  data: PonderNode['data'];
  id: string;
  selected: boolean;
  type?: 'text' | 'ai-response';
}

const DEFAULT_COLOR = '#25253a';
const AI_NODE_COLOR = '#1e3a5f';

function PonderNodeComponent({ data, id, selected, type }: Props) {
  const isAINode = type === 'ai-response';
  const bgColor = data.color || (isAINode ? AI_NODE_COLOR : DEFAULT_COLOR);

  // Use explicit dimensions or defaults
  const nodeWidth = data.width || 200;
  const nodeHeight = data.height || 100;

  return (
    <div
      className={`rounded-xl border transition-all ${
        selected 
          ? 'ring-2 ring-canvas-accent border-canvas-accent shadow-lg' 
          : 'border-canvas-border hover:border-canvas-accent/50'
      }`}
      style={{
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        backgroundColor: bgColor,
        minWidth: '160px',
        minHeight: '60px',
        maxHeight: '600px', // 添加最大高度限制
      }}
    >
      {selected && (
        <NodeResizer
          nodeId={id}
          minWidth={160}
          minHeight={60}
          maxHeight={600}
          color="#7c3aed"
          handleClassName="!w-3 !h-3 !bg-canvas-accent !border-2 !border-canvas-node !rounded-full"
          lineClassName="!border-canvas-accent"
          isVisible={selected}
        />
      )}
      <div className="p-3 h-full flex flex-col overflow-hidden">
        {isAINode && (
          <div className="flex items-center gap-1 mb-2 text-xs text-purple-400 flex-shrink-0">
            <span>🤖</span>
            <span>AI Response</span>
          </div>
        )}
        <div className="flex-1 text-sm text-canvas-text whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar">
          {data.content}
        </div>
        {data.createdAt && (
          <div className="text-xs text-canvas-text-muted mt-2 pt-2 border-t border-canvas-border/30 flex-shrink-0">
            {new Date(data.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-canvas-accent border-2 border-canvas-node"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-canvas-accent border-2 border-canvas-node"
      />
    </div>
  );
}

export default memo(PonderNodeComponent);
