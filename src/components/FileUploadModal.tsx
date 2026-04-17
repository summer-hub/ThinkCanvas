import React, { useState, useRef } from 'react';
import { parseFile, validateFile, formatFileSize, getFileIcon } from '@/lib/fileParser';
import { saveFile } from '@/lib/fileStorage';
import { indexFile } from '@/lib/rag';
import { useCanvasStore } from '@/store/canvasStore';
import { analyzeDocument, quickAnalyze, type DocumentStructure } from '@/lib/analysis/documentAnalysis';
import { generateKnowledgeGraph } from '@/lib/analysis/graphGeneration';

interface Props {
  onClose: () => void;
  onFileUploaded?: (fileId: string) => void;
}

type UploadStage = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'indexing' | 'complete';

export default function FileUploadModal({ onClose, onFileUploaded }: Props) {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [indexProgress, setIndexProgress] = useState({ current: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentStructure, setDocumentStructure] = useState<DocumentStructure | null>(null);
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addNode = useCanvasStore(s => s.addNode);
  const addEdge = useCanvasStore(s => s.addEdge);
  const setAnalyzing = useCanvasStore(s => s.setAnalyzing);
  const setAnalysisSteps = useCanvasStore(s => s.setAnalysisSteps);
  const updateAnalysisStep = useCanvasStore(s => s.updateAnalysisStep);
  const setCurrentAnalysisStep = useCanvasStore(s => s.setCurrentAnalysisStep);
  const isAnalysisPanelCollapsed = useCanvasStore(s => s.isAnalysisPanelCollapsed);
  const toggleAnalysisPanel = useCanvasStore(s => s.toggleAnalysisPanel);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setStage('uploading');

    try {
      const file = files[0];

      // 1. 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setStage('idle');
        return;
      }

      // 2. 解析文件
      const parsedFile = await parseFile(file);
      await saveFile(parsedFile);

      // 3. AI 分析文档结构
      if (enableAIAnalysis && parsedFile.content) {
        setStage('analyzing');
        
        // 初始化分析步骤
        const steps = [
          { id: 'understanding', status: 'pending' as const, title: '理解文档结构', titleEn: 'Understanding structure' },
          { id: 'analyzing', status: 'pending' as const, title: 'AI 深度分析', titleEn: 'AI deep analysis' },
          { id: 'parsing', status: 'pending' as const, title: '解析分析结果', titleEn: 'Parsing results' },
          { id: 'extracting', status: 'pending' as const, title: '提取章节内容', titleEn: 'Extracting sections' },
          { id: 'calculating', status: 'pending' as const, title: '计算章节权重', titleEn: 'Calculating weights' },
          { id: 'generating', status: 'pending' as const, title: '生成知识图谱', titleEn: 'Generating graph' },
        ];
        
        setAnalyzing(true);
        setAnalysisSteps(steps);
        // 如果右侧面板是折叠的，展开它
        if (isAnalysisPanelCollapsed) {
          toggleAnalysisPanel();
        }
        
        try {
          // 进度回调
          const onProgress = (stepId: string, detail: string) => {
            // 更新当前步骤为完成
            const currentIndex = steps.findIndex(s => s.id === stepId);
            if (currentIndex > 0) {
              updateAnalysisStep(steps[currentIndex - 1].id, { status: 'completed' });
            }
            
            // 更新当前步骤为处理中
            updateAnalysisStep(stepId, { 
              status: 'processing',
              detail: detail.split('|')[0].trim(),
              detailEn: detail.split('|')[1]?.trim() || detail,
            });
            setCurrentAnalysisStep(currentIndex + 1);
          };
          
          const structure = await analyzeDocument(parsedFile.content, parsedFile.name, onProgress);
          setDocumentStructure(structure);
          
          // 标记分析步骤完成
          updateAnalysisStep('calculating', { status: 'completed' });
          
          // 4. 生成知识图谱
          setStage('generating');
          updateAnalysisStep('generating', { 
            status: 'processing',
            detail: '正在生成知识图谱节点',
            detailEn: 'Generating knowledge graph nodes',
          });
          
          const graph = generateKnowledgeGraph(structure, parsedFile.id);
          
          // 添加生成的节点和连接
          graph.nodes.forEach(node => {
            addNode(node.data.content, node.position, node.type);
          });
          graph.edges.forEach(edge => {
            addEdge(edge.source, edge.target);
          });
          
          updateAnalysisStep('generating', { status: 'completed' });
          
          console.log(`✅ 知识图谱生成完成: ${graph.nodes.length} 个节点`);
        } catch (analysisError) {
          console.error('❌ AI 分析失败，使用快速分析:', analysisError);
          
          // 标记错误
          const currentStep = useCanvasStore.getState().currentAnalysisStep;
          if (currentStep < steps.length) {
            updateAnalysisStep(steps[currentStep].id, { 
              status: 'error',
              detail: '分析失败，使用快速分析',
              detailEn: 'Analysis failed, using quick analysis',
            });
          }
          
          // 降级到快速分析
          const structure = quickAnalyze(parsedFile.content, parsedFile.name);
          setDocumentStructure(structure);
          
          // 创建简单节点
          addNode(
            `📎 ${parsedFile.name}\n\n${parsedFile.content.substring(0, 200)}${parsedFile.content.length > 200 ? '...' : ''}`,
            { x: 300, y: 200 }
          );
        } finally {
          setAnalyzing(false);
        }
      } else {
        // 不使用 AI 分析，直接创建节点
        addNode(
          `📎 ${parsedFile.name}\n\n${parsedFile.content.substring(0, 200)}${parsedFile.content.length > 200 ? '...' : ''}`,
          { x: 300, y: 200 }
        );
      }

      // 5. 索引文件（用于 RAG）
      setStage('indexing');
      setIndexProgress({ current: 0, total: 0 });
      try {
        const apiKey = localStorage.getItem('openai_api_key') || '';
        if (apiKey && parsedFile.content) {
          await indexFile(parsedFile, apiKey, (current, total) => {
            setIndexProgress({ current, total });
          });
          console.log(`✅ 文件索引完成: ${parsedFile.name}`);
        } else if (!apiKey) {
          console.warn('⚠️ Embeddings API Key 未配置，跳过索引');
        }
      } catch (indexError) {
        console.error('❌ 索引失败:', indexError);
      }

      setStage('complete');
      onFileUploaded?.(parsedFile.id);

      // 关闭弹窗
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('上传失败:', err);
      setError(err instanceof Error ? err.message : '上传失败');
      setStage('idle');
      setAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-canvas-node border border-canvas-border rounded-xl p-6 w-[500px] max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2 text-canvas-text">Upload File</h2>
        <p className="text-sm text-canvas-text-muted mb-6">
          Upload a document to extract and analyze its content
        </p>

        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-canvas-accent bg-canvas-accent/10'
              : 'border-canvas-border hover:border-canvas-accent/50'
          } ${stage !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="text-4xl mb-4">
            {stage === 'uploading' && '📤'}
            {stage === 'analyzing' && '🔍'}
            {stage === 'generating' && '🎨'}
            {stage === 'indexing' && '🔄'}
            {stage === 'complete' && '✅'}
            {stage === 'idle' && '📁'}
          </div>
          
          {stage === 'uploading' && (
            <p className="text-sm text-canvas-text mb-2">📤 正在上传文件...</p>
          )}
          
          {stage === 'analyzing' && (
            <p className="text-sm text-canvas-text mb-2">🔍 AI 正在分析文档结构...</p>
          )}
          
          {stage === 'generating' && (
            <p className="text-sm text-canvas-text mb-2">🎨 正在生成知识图谱...</p>
          )}
          
          {stage === 'indexing' && (
            <>
              <p className="text-sm text-canvas-text mb-3">🔄 正在索引文件...</p>
              {indexProgress.total > 0 && (
                <>
                  <div className="w-full bg-canvas-bg rounded-full h-2 mb-2">
                    <div
                      className="bg-canvas-accent h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(indexProgress.current / indexProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-canvas-text-muted">
                    {indexProgress.current} / {indexProgress.total} 块 ({Math.round((indexProgress.current / indexProgress.total) * 100)}%)
                  </p>
                </>
              )}
            </>
          )}
          
          {stage === 'complete' && (
            <p className="text-sm text-green-400 mb-2">✅ 上传完成！</p>
          )}
          
          {stage === 'idle' && (
            <>
              <p className="text-sm text-canvas-text mb-2">
                拖拽文件到这里，或
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-canvas-accent hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
              >
                浏览文件
              </button>
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".txt,.md,.pdf,.doc,.docx"
            className="hidden"
          />
        </div>

        {/* AI 分析选项 */}
        <div className="mt-4 p-3 bg-canvas-bg rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableAIAnalysis}
              onChange={(e) => setEnableAIAnalysis(e.target.checked)}
              className="w-4 h-4 rounded border-canvas-border bg-canvas-node text-canvas-accent focus:ring-2 focus:ring-canvas-accent"
            />
            <span className="text-sm text-canvas-text">
              🤖 启用 AI 智能分析（自动生成知识图谱）
            </span>
          </label>
          <p className="text-xs text-canvas-text-muted mt-2 ml-6">
            AI 将分析文档结构、提取关键信息并自动生成可视化知识图谱
          </p>
        </div>

        {/* Supported Formats */}
        <div className="mt-4 p-3 bg-canvas-bg rounded-lg">
          <p className="text-xs text-canvas-text-muted mb-2">Supported formats:</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-canvas-node border border-canvas-border rounded">
              📃 TXT
            </span>
            <span className="text-xs px-2 py-1 bg-canvas-node border border-canvas-border rounded">
              📋 MD
            </span>
            <span className="text-xs px-2 py-1 bg-canvas-node border border-canvas-border rounded">
              📄 PDF
            </span>
            <span className="text-xs px-2 py-1 bg-canvas-node border border-canvas-border rounded">
              📝 DOCX
            </span>
          </div>
          <p className="text-xs text-canvas-text-muted mt-2">
            Maximum file size: 10MB
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={stage !== 'idle' && stage !== 'complete'}
            className="px-4 py-2 text-sm text-canvas-text-muted hover:text-canvas-text transition-colors disabled:opacity-50"
          >
            {stage === 'complete' ? '关闭' : '取消'}
          </button>
        </div>
      </div>
    </div>
  );
}
