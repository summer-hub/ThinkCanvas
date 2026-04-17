/**
 * File Reference Autocomplete Component
 * 
 * Provides autocomplete suggestions for @filename references in AI chat
 */

import React, { useEffect, useRef } from 'react';
import type { UploadedFile } from '@/types';

interface FileReferenceAutocompleteProps {
  files: UploadedFile[];
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
  onSelect: (fileName: string) => void;
  onClose: () => void;
  onNavigate: (direction: 'up' | 'down') => void;
}

function FileReferenceAutocomplete({
  files,
  query,
  position,
  selectedIndex,
  onSelect,
  onClose,
  onNavigate,
}: FileReferenceAutocompleteProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter files based on query
  const filteredFiles = files
    .filter(file => file.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10); // Limit to 10 suggestions

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('up');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredFiles[selectedIndex]) {
          onSelect(filteredFiles[selectedIndex].name);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredFiles, onSelect, onClose, onNavigate]);

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (filteredFiles.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-canvas-node border border-canvas-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '200px',
        maxWidth: '300px',
      }}
      role="listbox"
      aria-label="File suggestions"
    >
      {filteredFiles.map((file, index) => (
        <div
          key={file.id}
          className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 ${
            index === selectedIndex
              ? 'bg-canvas-accent text-white'
              : 'text-canvas-text hover:bg-canvas-bg'
          }`}
          onClick={() => onSelect(file.name)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          <span className="text-xs opacity-70">
            {getFileIcon(file.type)}
          </span>
          <span className="flex-1 truncate">{file.name}</span>
        </div>
      ))}
    </div>
  );
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('text')) return '📃';
  return '📎';
}

export default FileReferenceAutocomplete;
