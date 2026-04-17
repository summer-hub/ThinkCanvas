import React, { useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

const PRESET_COLORS = [
  { label: 'Default', value: '#25253a' },
  { label: 'Purple', value: '#4c1d95' },
  { label: 'Blue', value: '#1e3a5f' },
  { label: 'Green', value: '#14532d' },
  { label: 'Yellow', value: '#713f12' },
  { label: 'Red', value: '#7f1d1d' },
  { label: 'Pink', value: '#831843' },
  { label: 'Cyan', value: '#164e63' },
];

interface Props {
  nodeId: string;
  currentColor?: string;
  onClose: () => void;
}

export default function ColorPicker({ nodeId, currentColor, onClose }: Props) {
  const updateNodeColor = useCanvasStore(s => s.updateNodeColor);

  function handleColorSelect(color: string) {
    updateNodeColor(nodeId, color);
    onClose();
  }

  function handleReset() {
    updateNodeColor(nodeId, undefined);
    onClose();
  }

  return (
    <div className="absolute z-50 bg-canvas-node border border-canvas-border rounded-lg shadow-xl p-2 min-w-[160px]">
      <div className="text-xs text-canvas-text-muted mb-2">Node Color</div>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => handleColorSelect(c.value)}
            className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
              currentColor === c.value ? 'border-canvas-accent' : 'border-transparent'
            }`}
            style={{ backgroundColor: c.value }}
            title={c.label}
          />
        ))}
      </div>
      <button
        onClick={handleReset}
        className="w-full text-xs text-canvas-text-muted hover:text-canvas-text py-1 border border-canvas-border rounded"
      >
        Reset to Default
      </button>
    </div>
  );
}
