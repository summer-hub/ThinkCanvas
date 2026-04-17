import { create } from 'zustand';
import type { PonderNode, PonderEdge, AIMessage } from '@/types';
import { saveCanvas, loadCanvas } from '@/lib/storage';
import { useHistoryStore } from './historyStore';
import type { AnalysisStep } from '@/components/AnalysisProgress';

export interface CanvasStore {
  nodes: PonderNode[];
  edges: PonderEdge[];
  selectedNodeId: string | null;
  aiMessages: AIMessage[];
  isAIPanelOpen: boolean;
  isLoadingAI: boolean;
  
  // Panel states
  isResourcePanelCollapsed: boolean;
  isAnalysisPanelCollapsed: boolean;
  
  // Analysis progress
  isAnalyzing: boolean;
  analysisSteps: AnalysisStep[];
  currentAnalysisStep: number;

  // Actions
  addNode: (content: string, position: { x: number; y: number }, type?: 'text' | 'ai-response') => string;
  updateNode: (id: string, content: string) => void;
  updateNodeDimensions: (id: string, dimensions: { width?: number; height?: number }) => void;
  updateNodeColor: (id: string, color: string | undefined) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  addEdge: (source: string, target: string) => void;
  deleteEdge: (id: string) => void;

  setAIPanelOpen: (open: boolean) => void;
  setLoadingAI: (loading: boolean) => void;
  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;
  
  // Panel actions
  toggleResourcePanel: () => void;
  toggleAnalysisPanel: () => void;
  
  // Analysis actions
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisSteps: (steps: AnalysisStep[]) => void;
  updateAnalysisStep: (stepId: string, updates: Partial<AnalysisStep>) => void;
  setCurrentAnalysisStep: (step: number) => void;

  loadFromStorage: () => Promise<void>;
  persistToStorage: () => Promise<void>;
  
  // History actions
  saveSnapshot: () => void;
  restoreSnapshot: (nodes: PonderNode[], edges: PonderEdge[]) => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(store: CanvasStore) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCanvas({ nodes: store.nodes, edges: store.edges });
  }, 500);
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  aiMessages: [],
  isAIPanelOpen: false,
  isLoadingAI: false,
  isResourcePanelCollapsed: false,
  isAnalysisPanelCollapsed: false,
  isAnalyzing: false,
  analysisSteps: [],
  currentAnalysisStep: 0,

  saveSnapshot: () => {
    const { nodes, edges } = get();
    useHistoryStore.getState().pushHistory({
      nodes: JSON.parse(JSON.stringify(nodes)), // 深拷贝
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    });
  },

  restoreSnapshot: (nodes, edges) => {
    set({ nodes, edges });
    debouncedSave(get());
  },

  addNode: (content, position, type = 'text'): string => {
    // 保存当前状态到历史
    get().saveSnapshot();
    
    const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    // AI 响应节点使用更大的默认尺寸
    const defaultWidth = type === 'ai-response' ? 300 : 200;
    const defaultHeight = type === 'ai-response' ? 200 : 100;
    
    const node: PonderNode = {
      id,
      type,
      position,
      data: {
        content,
        createdAt: new Date().toISOString(),
        width: defaultWidth,
        height: defaultHeight,
      },
    };
    set(state => ({ nodes: [...state.nodes, node] }));
    debouncedSave(get());
    return id;
  },

  updateNode: (id, content) => {
    get().saveSnapshot();
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, content } } : n
      ),
    }));
    debouncedSave(get());
  },

  updateNodeDimensions: (id, dimensions) => {
    const state = get();
    const node = state.nodes.find(n => n.id === id);
    
    // Only update if dimensions actually changed
    if (node && (node.data.width !== dimensions.width || node.data.height !== dimensions.height)) {
      set({
        nodes: state.nodes.map(n =>
          n.id === id ? { ...n, data: { ...n.data, ...dimensions } } : n
        ),
      });
      debouncedSave(get());
    }
  },

  updateNodeColor: (id, color) => {
    get().saveSnapshot();
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, color } } : n
      ),
    }));
    debouncedSave(get());
  },

  deleteNode: (id) => {
    get().saveSnapshot();
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
    debouncedSave(get());
  },

  selectNode: (id) => {
    set({ selectedNodeId: id, isAIPanelOpen: id !== null, aiMessages: [] });
  },

  addEdge: (source, target) => {
    get().saveSnapshot();
    const edge: PonderEdge = {
      id: `edge_${Date.now()}`,
      source,
      target,
    };
    set(state => ({ edges: [...state.edges, edge] }));
    debouncedSave(get());
  },

  deleteEdge: (id) => {
    get().saveSnapshot();
    set(state => ({ edges: state.edges.filter(e => e.id !== id) }));
    debouncedSave(get());
  },

  setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),

  setLoadingAI: (loading) => set({ isLoadingAI: loading }),

  addAIMessage: (message) => {
    set(state => ({ aiMessages: [...state.aiMessages, message] }));
  },

  clearAIMessages: () => set({ aiMessages: [] }),
  
  toggleResourcePanel: () => {
    const collapsed = !get().isResourcePanelCollapsed;
    set({ isResourcePanelCollapsed: collapsed });
    localStorage.setItem('resourcePanelCollapsed', String(collapsed));
  },
  
  toggleAnalysisPanel: () => {
    const collapsed = !get().isAnalysisPanelCollapsed;
    set({ isAnalysisPanelCollapsed: collapsed });
    localStorage.setItem('analysisPanelCollapsed', String(collapsed));
  },
  
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  
  setAnalysisSteps: (steps) => set({ analysisSteps: steps, currentAnalysisStep: 0 }),
  
  updateAnalysisStep: (stepId, updates) => {
    set(state => ({
      analysisSteps: state.analysisSteps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    }));
  },
  
  setCurrentAnalysisStep: (step) => set({ currentAnalysisStep: step }),

  loadFromStorage: async () => {
    const state = await loadCanvas();
    if (state) {
      set({ nodes: state.nodes || [], edges: state.edges || [] });
    }
    
    // Load panel states
    const resourceCollapsed = localStorage.getItem('resourcePanelCollapsed') === 'true';
    const analysisCollapsed = localStorage.getItem('analysisPanelCollapsed') === 'true';
    set({ 
      isResourcePanelCollapsed: resourceCollapsed,
      isAnalysisPanelCollapsed: analysisCollapsed,
    });
  },

  persistToStorage: async () => {
    const { nodes, edges } = get();
    await saveCanvas({ nodes, edges });
  },
}));
