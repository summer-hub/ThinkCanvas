export interface PonderNode {
  id: string;
  type: 'text' | 'ai-response';
  position: { x: number; y: number };
  data: {
    content: string;
    createdAt: string;
    color?: string;
    width?: number;
    height?: number;
    tags?: string[];
    linkedFiles?: string[]; // File IDs linked to this node
  };
}

export interface PonderEdge {
  id: string;
  source: string;
  target: string;
}

export interface CanvasState {
  nodes: PonderNode[];
  edges: PonderEdge[];
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  ragMetadata?: {
    chunks: Array<{
      id: string;
      fileId: string;
      fileName: string;
      content: string;
      similarity: number;
      chunkIndex: number;
    }>;
    retrievalTime: number;
    truncated: boolean;
    warnings: string[];
  };
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  uploadedAt: string;
  content?: string; // Extracted text content
  metadata?: {
    pageCount?: number; // For PDFs
    wordCount?: number;
    author?: string;
    title?: string;
  };
}
