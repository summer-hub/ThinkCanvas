import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useHistoryStore } from '@/store/historyStore';
import { useI18n } from '@/i18n';
import ImportModal from './ImportModal';
import ColorPicker from './ColorPicker';
import ProviderSettings from './ProviderSettings';
import ExportModal from './ExportModal';
import FileUploadModal from './FileUploadModal';
import FileList from './FileList';
import RAGTestPanel from './RAGTestPanel';
import RAGTestSuite from './RAGTestSuite';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Props {
  onOpenSearch: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export default function Header({ onOpenSearch, canvasRef }: Props) {
  const { t } = useI18n();
  const [showImport, setShowImport] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const [showRAGTest, setShowRAGTest] = useState(false);
  const [showE2ETest, setShowE2ETest] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const selectedNodeId = useCanvasStore(s => s.selectedNodeId);
  const nodes = useCanvasStore(s => s.nodes);
  const edges = useCanvasStore(s => s.edges);
  const restoreSnapshot = useCanvasStore(s => s.restoreSnapshot);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const undo = useHistoryStore(s => s.undo);
  const redo = useHistoryStore(s => s.redo);
  const canUndo = useHistoryStore(s => s.canUndo);
  const canRedo = useHistoryStore(s => s.canRedo);

  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUndo = () => {
    if (canUndo()) {
      const snapshot = undo();
      if (snapshot) {
        restoreSnapshot(snapshot.nodes, snapshot.edges);
      }
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      const snapshot = redo();
      if (snapshot) {
        restoreSnapshot(snapshot.nodes, snapshot.edges);
      }
    }
  };

  return (
    <>
      <header className="h-12 bg-canvas-node border-b border-canvas-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h1 className="text-base font-semibold text-canvas-text">{t('header.appName')}</h1>
          </div>
          <div className="text-xs text-canvas-text-muted flex items-center gap-3 pl-3 border-l border-canvas-border">
            <span>{nodes.length} {t('header.nodes')}</span>
            <span>{edges.length} {t('header.connections')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-1 pr-2 border-r border-canvas-border">
            <button
              onClick={handleUndo}
              disabled={!canUndo()}
              className="p-1.5 text-canvas-text hover:bg-canvas-bg rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={t('header.undo')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo()}
              className="p-1.5 text-canvas-text hover:bg-canvas-bg rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={t('header.redo')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          {selectedNode && (
            <div ref={colorPickerRef} className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent rounded-lg transition-colors"
                title="Change node color"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedNode.data.color || '#25253a' }}
                />
                <span className="text-canvas-text text-sm">{t('header.color')}</span>
              </button>
              {showColorPicker && (
                <ColorPicker
                  nodeId={selectedNode.id}
                  currentColor={selectedNode.data.color}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </div>
          )}
          <button
            onClick={onOpenSearch}
            className="px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors flex items-center gap-2"
            title={t('header.search')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{t('header.search')}</span>
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 text-sm bg-canvas-accent hover:bg-purple-600 text-white rounded-lg transition-colors"
            title={t('header.import')}
          >
            + {t('header.import')}
          </button>
          <button
            onClick={() => setShowFileUpload(true)}
            className="px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors flex items-center gap-2"
            title={t('header.upload')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>{t('header.upload')}</span>
          </button>
          <button
            onClick={() => setShowFileList(true)}
            className="px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors flex items-center gap-2"
            title={t('header.files')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>{t('header.files')}</span>
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors flex items-center gap-2"
            title={t('header.export')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{t('header.export')}</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors"
            title={t('header.settings')}
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowRAGTest(true)}
            className="px-3 py-1.5 text-sm border border-yellow-500/50 hover:border-yellow-500 text-yellow-200 rounded-lg transition-colors"
            title={t('header.test')}
          >
            🧪 {t('header.test')}
          </button>
          <button
            onClick={() => setShowE2ETest(true)}
            className="px-3 py-1.5 text-sm border border-green-500/50 hover:border-green-500 text-green-200 rounded-lg transition-colors"
            title={t('header.e2e')}
          >
            🎯 {t('header.e2e')}
          </button>
        </div>
      </header>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showFileUpload && <FileUploadModal onClose={() => setShowFileUpload(false)} />}
      {showFileList && <FileList isOpen={showFileList} onClose={() => setShowFileList(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} canvasRef={canvasRef} />}
      {showSettings && <ProviderSettings onClose={() => setShowSettings(false)} />}
      {showRAGTest && <RAGTestPanel isOpen={showRAGTest} onClose={() => setShowRAGTest(false)} />}
      {showE2ETest && <RAGTestSuite onClose={() => setShowE2ETest(false)} />}
    </>
  );
}
