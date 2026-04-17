import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PonderNodeComponent from './PonderNode';
import AIPanel from './AIPanel';
import Header from './Header';
import NodeContextMenu from './NodeContextMenu';
import ColorPicker from './ColorPicker';
import WelcomeScreen from './WelcomeScreen';
import SearchPanel from './SearchPanel';
import ResourcePanel from './ResourcePanel';
import AnalysisPanel from './AnalysisPanel';
import ToastContainer from './Toast';
import { useCanvasStore } from '@/store/canvasStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const nodeTypes = {
  ponder: PonderNodeComponent,
};

export default function Canvas() {
  const storeNodes = useCanvasStore(s => s.nodes);
  const storeEdges = useCanvasStore(s => s.edges);
  const selectedNodeId = useCanvasStore(s => s.selectedNodeId);
  const isAIPanelOpen = useCanvasStore(s => s.isAIPanelOpen);
  const isResourcePanelCollapsed = useCanvasStore(s => s.isResourcePanelCollapsed);
  const isAnalysisPanelCollapsed = useCanvasStore(s => s.isAnalysisPanelCollapsed);
  const addNode = useCanvasStore(s => s.addNode);
  const updateNode = useCanvasStore(s => s.updateNode);
  const deleteNode = useCanvasStore(s => s.deleteNode);
  const selectNode = useCanvasStore(s => s.selectNode);
  const addEdgeToStore = useCanvasStore(s => s.addEdge);
  const deleteEdge = useCanvasStore(s => s.deleteEdge);
  const loadFromStorage = useCanvasStore(s => s.loadFromStorage);
  const updateNodeDimensions = useCanvasStore(s => s.updateNodeDimensions);
  const toggleResourcePanel = useCanvasStore(s => s.toggleResourcePanel);
  const toggleAnalysisPanel = useCanvasStore(s => s.toggleAnalysisPanel);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const isLoaded = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onOpenSearch: () => setShowSearch(true),
  });

  // Load from IndexedDB once
  useEffect(() => {
    loadFromStorage().then(() => {
      isLoaded.current = true;
      // Show welcome screen if no nodes exist and it's first time
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    });
  }, []);

  // Sync store → ReactFlow whenever store changes (after initial load)
  useEffect(() => {
    if (!isLoaded.current) return;
    setNodes(storeNodes.map(n => ({
      id: n.id,
      type: 'ponder',
      position: n.position,
      data: { ...n.data, type: n.type },
      selected: n.id === selectedNodeId,
    })));
  }, [storeNodes, selectedNodeId]);

  useEffect(() => {
    if (!isLoaded.current) return;
    setEdges(storeEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'default',
    })));
  }, [storeEdges]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      changes.forEach(change => {
        if (change.type === 'remove') {
          deleteNode(change.id);
        }
        if (change.type === 'select') {
          selectNode(change.id ?? null);
        }
        // Only save dimensions when user finishes resizing (not during resize)
        if (change.type === 'dimensions' && change.dimensions) {
          // Check if this is the final dimension change (resizing is false or undefined)
          const isResizing = (change as any).resizing;
          if (isResizing === false) {
            updateNodeDimensions(change.id, {
              width: change.dimensions.width,
              height: change.dimensions.height,
            });
          }
        }
      });
    },
    [deleteNode, selectNode, updateNodeDimensions]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      changes.forEach(change => {
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [deleteEdge]
  );

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        addEdgeToStore(connection.source, connection.target);
        setEdges(eds => addEdge({ ...connection, type: 'default' }, eds));
      }
    },
    []
  );

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't create node if clicking on Controls, MiniMap, or Background
      if (
        target.closest('.react-flow__controls') ||
        target.closest('.react-flow__minimap') ||
        target.closest('.react-flow__background')
      ) {
        return;
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode('New idea...', position);
    },
    [addNode, screenToFlowPosition]
  );

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: { id: string; data?: { content?: string } }) => {
      event.stopPropagation();
      const currentContent = node.data?.content || '';
      const newContent = window.prompt('Edit node:', currentContent);
      if (newContent !== null && newContent.trim()) {
        updateNode(node.id, newContent.trim());
      }
    },
    [updateNode]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    setContextMenu(null);
  }, [selectNode]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleSelectSearchNode = (nodeId: string) => {
    selectNode(nodeId);
    // Optionally center the node in view
    const node = storeNodes.find(n => n.id === nodeId);
    if (node) {
      // React Flow will handle the selection and focus
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer />
      <Header onOpenSearch={() => setShowSearch(true)} canvasRef={canvasRef} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Resource Management */}
        <ResourcePanel 
          isCollapsed={isResourcePanelCollapsed}
          onToggle={toggleResourcePanel}
        />
        
        {/* Center Panel - Canvas */}
        <div className="flex-1 relative" ref={canvasRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onPaneClick={handlePaneClick}
            // @ts-expect-error - onPaneDoubleClick exists in ReactFlow but not in types
            onPaneDoubleClick={handlePaneDoubleClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeContextMenu={handleNodeContextMenu}
            nodeTypes={nodeTypes}
            fitView
            className="bg-canvas-bg"
            defaultEdgeOptions={{
              style: { stroke: '#3d3d5c', strokeWidth: 2 },
              type: 'default',
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#2d2d44"
            />
            <Controls className="bg-canvas-node border border-canvas-border rounded-lg" />
            <MiniMap
              className="bg-canvas-node border border-canvas-border rounded-lg"
              nodeColor="#7c3aed"
              maskColor="rgba(26, 26, 46, 0.8)"
            />
          </ReactFlow>
          {contextMenu && !showColorPicker && (
            <NodeContextMenu
              nodeId={contextMenu.nodeId}
              position={{ x: contextMenu.x, y: contextMenu.y }}
              onClose={() => setContextMenu(null)}
              onColorChange={() => setShowColorPicker(true)}
            />
          )}
          {contextMenu && showColorPicker && (
            <div
              style={{ left: contextMenu.x, top: contextMenu.y }}
              className="fixed z-50"
            >
              <ColorPicker
                nodeId={contextMenu.nodeId}
                currentColor={(nodes.find(n => n.id === contextMenu.nodeId)?.data.color as string | undefined)}
                onClose={() => { setShowColorPicker(false); setContextMenu(null); }}
              />
            </div>
          )}
          {showSearch && (
            <SearchPanel
              onClose={() => setShowSearch(false)}
              onSelectNode={handleSelectSearchNode}
            />
          )}
        </div>
        
        {/* Right Panel - Analysis or AI Panel */}
        {isAIPanelOpen ? (
          <AIPanel />
        ) : (
          <AnalysisPanel 
            isCollapsed={isAnalysisPanelCollapsed}
            onToggle={toggleAnalysisPanel}
          />
        )}
      </div>
      {showWelcome && <WelcomeScreen onClose={handleCloseWelcome} />}
    </div>
  );
}
