/**
 * 资源管理面板 - 左侧边栏
 * 显示所有已上传的文档，支持搜索、分类、拖拽
 */

import React, { useState, useEffect } from 'react';
import { getAllFiles, deleteFile, type UploadedFile } from '@/lib/fileStorage';
import { getFileIcon, formatFileSize } from '@/lib/fileParser';

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function ResourcePanel({ isCollapsed, onToggle }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pdf' | 'word' | 'markdown' | 'text'>('all');
  const [loading, setLoading] = useState(true);

  // 加载文件列表
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const allFiles = await getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error('加载文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除文件
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    try {
      await deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('删除文件失败:', error);
      alert('删除失败');
    }
  };

  // 文件分类
  const getFileCategory = (file: UploadedFile): string => {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'word';
    if (file.type.includes('markdown')) return 'markdown';
    return 'text';
  };

  // 过滤文件
  const filteredFiles = files.filter(file => {
    // 分类过滤
    if (selectedCategory !== 'all' && getFileCategory(file) !== selectedCategory) {
      return false;
    }
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        file.name.toLowerCase().includes(query) ||
        file.content.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // 统计
  const stats = {
    total: files.length,
    pdf: files.filter(f => getFileCategory(f) === 'pdf').length,
    word: files.filter(f => getFileCategory(f) === 'word').length,
    markdown: files.filter(f => getFileCategory(f) === 'markdown').length,
    text: files.filter(f => getFileCategory(f) === 'text').length,
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-canvas-node border-r border-canvas-border flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-canvas-bg rounded-lg transition-colors"
          title="展开资源面板"
        >
          <svg className="w-5 h-5 text-canvas-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="mt-4 text-xs text-canvas-text-muted rotate-90 whitespace-nowrap">
          资源 ({files.length})
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-canvas-node border-r border-canvas-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-canvas-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-canvas-text flex items-center gap-2">
          📁 项目资料
          <span className="text-sm text-canvas-text-muted">({files.length})</span>
        </h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-canvas-bg rounded transition-colors"
          title="折叠面板"
        >
          <svg className="w-5 h-5 text-canvas-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-canvas-border">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件..."
            className="w-full px-3 py-2 pl-9 bg-canvas-bg border border-canvas-border rounded-lg text-sm text-canvas-text placeholder-canvas-text-muted focus:outline-none focus:ring-2 focus:ring-canvas-accent"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-canvas-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-canvas-border">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              selectedCategory === 'all'
                ? 'bg-canvas-accent text-white'
                : 'bg-canvas-bg text-canvas-text-muted hover:text-canvas-text'
            }`}
          >
            全部 ({stats.total})
          </button>
          <button
            onClick={() => setSelectedCategory('pdf')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              selectedCategory === 'pdf'
                ? 'bg-canvas-accent text-white'
                : 'bg-canvas-bg text-canvas-text-muted hover:text-canvas-text'
            }`}
          >
            📄 PDF ({stats.pdf})
          </button>
          <button
            onClick={() => setSelectedCategory('word')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              selectedCategory === 'word'
                ? 'bg-canvas-accent text-white'
                : 'bg-canvas-bg text-canvas-text-muted hover:text-canvas-text'
            }`}
          >
            📝 Word ({stats.word})
          </button>
          <button
            onClick={() => setSelectedCategory('markdown')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              selectedCategory === 'markdown'
                ? 'bg-canvas-accent text-white'
                : 'bg-canvas-bg text-canvas-text-muted hover:text-canvas-text'
            }`}
          >
            📋 MD ({stats.markdown})
          </button>
          <button
            onClick={() => setSelectedCategory('text')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              selectedCategory === 'text'
                ? 'bg-canvas-accent text-white'
                : 'bg-canvas-bg text-canvas-text-muted hover:text-canvas-text'
            }`}
          >
            📃 TXT ({stats.text})
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-canvas-text-muted">
            <div className="animate-spin w-8 h-8 border-2 border-canvas-accent border-t-transparent rounded-full mx-auto mb-2"></div>
            加载中...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-canvas-text-muted">
            {searchQuery || selectedCategory !== 'all' ? (
              <>
                <div className="text-4xl mb-2">🔍</div>
                <p>没有找到匹配的文件</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">📁</div>
                <p>还没有上传文件</p>
                <p className="text-xs mt-1">点击顶部的"上传"按钮开始</p>
              </>
            )}
          </div>
        ) : (
          filteredFiles.map(file => (
            <div
              key={file.id}
              className="p-3 bg-canvas-bg border border-canvas-border rounded-lg hover:border-canvas-accent transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <h3 className="text-sm font-medium text-canvas-text truncate">
                      {file.name}
                    </h3>
                  </div>
                  <p className="text-xs text-canvas-text-muted line-clamp-2 mb-2">
                    {file.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-3 text-xs text-canvas-text-muted">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString('zh-CN')}</span>
                    {file.metadata?.pageCount && (
                      <>
                        <span>•</span>
                        <span>{file.metadata.pageCount} 页</span>
                      </>
                    )}
                    {file.metadata?.wordCount && (
                      <>
                        <span>•</span>
                        <span>{file.metadata.wordCount} 字</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded transition-all"
                  title="删除文件"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-canvas-border">
        <button
          onClick={loadFiles}
          className="w-full px-3 py-2 bg-canvas-bg hover:bg-canvas-accent/20 border border-canvas-border rounded-lg text-sm text-canvas-text transition-colors"
        >
          🔄 刷新列表
        </button>
      </div>
    </div>
  );
}
