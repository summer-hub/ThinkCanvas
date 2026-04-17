import React, { useState, useEffect } from 'react';
import { getAllFiles, deleteFile } from '@/lib/fileStorage';
import { getFileIcon, formatFileSize } from '@/lib/fileParser';
import type { UploadedFile } from '@/types';
import { useCanvasStore } from '@/store/canvasStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileList({ isOpen, onClose }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const addNode = useCanvasStore(s => s.addNode);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const allFiles = await getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const handleCreateNode = (file: UploadedFile) => {
    // Create a node with file content preview
    const preview = file.content.substring(0, 300);
    const nodeContent = `📎 ${file.name}\n\n${preview}${file.content.length > 300 ? '...' : ''}`;
    
    addNode(nodeContent, { x: 300, y: 200 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-canvas-node border border-canvas-border rounded-xl w-[800px] max-w-[90vw] h-[600px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-canvas-border">
          <div>
            <h2 className="text-lg font-semibold text-canvas-text">Uploaded Files</h2>
            <p className="text-sm text-canvas-text-muted">{files.length} files</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-canvas-bg rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-canvas-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File List */}
          <div className="w-1/3 border-r border-canvas-border overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-canvas-text-muted">
                Loading files...
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 text-center text-canvas-text-muted">
                <div className="text-4xl mb-2">📁</div>
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-canvas-border">
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`p-3 cursor-pointer hover:bg-canvas-bg transition-colors ${
                      selectedFile?.id === file.id ? 'bg-canvas-bg' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-canvas-text truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-canvas-text-muted">
                          {formatFileSize(file.size)}
                          {file.metadata.pageCount && ` • ${file.metadata.pageCount} pages`}
                          {file.metadata.wordCount && ` • ${file.metadata.wordCount} words`}
                        </p>
                        <p className="text-xs text-canvas-text-muted">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedFile ? (
              <>
                <div className="p-4 border-b border-canvas-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-canvas-text mb-1">
                        {selectedFile.name}
                      </h3>
                      <p className="text-xs text-canvas-text-muted">
                        {formatFileSize(selectedFile.size)}
                        {selectedFile.metadata.pageCount && ` • ${selectedFile.metadata.pageCount} pages`}
                        {selectedFile.metadata.wordCount && ` • ${selectedFile.metadata.wordCount} words`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreateNode(selectedFile)}
                        className="px-3 py-1.5 text-sm bg-canvas-accent hover:bg-purple-600 text-white rounded-lg transition-colors"
                        title="Create node from file"
                      >
                        Create Node
                      </button>
                      <button
                        onClick={() => handleDelete(selectedFile.id)}
                        className="px-3 py-1.5 text-sm border border-red-500/50 hover:bg-red-900/30 text-red-200 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <pre className="text-sm text-canvas-text whitespace-pre-wrap font-mono">
                    {selectedFile.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-canvas-text-muted">
                <div className="text-center">
                  <div className="text-4xl mb-2">👈</div>
                  <p>Select a file to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
