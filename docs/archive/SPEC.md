# Ponder AI — MVP Specification

## 1. Project Overview

- **Name**: Ponder AI
- **Type**: Desktop AI Thought Space
- **Core**: An infinite canvas where users create nodes, connect them, and chat with an AI partner that persists responses as new nodes.
- **Target**: Individual knowledge workers who want a local-first, privacy-focused thinking tool.

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Desktop Shell | Electron (dev) → Tauri (prod later) |
| Frontend | React 18 + TypeScript |
| Canvas | `@xyflow/react` (formerly React Flow) |
| State | Zustand |
| AI | OpenAI API (GPT-4o-mini) with `ollama` interface预留 |
| Storage | IndexedDB via `idb-keyval` (pure client-side) |
| Styling | Tailwind CSS |
| Build | Vite |

---

## 3. Feature List (MVP)

### Core Canvas
- [ ] Infinite canvas with pan & zoom
- [ ] Create text nodes by double-clicking canvas
- [ ] Edit node content inline (double-click node)
- [ ] Connect nodes with directed edges
- [ ] Delete nodes and edges
- [ ] Node styling: draggable, resizable

### AI Integration
- [ ] Select a node → open AI chat panel
- [ ] Send message → GPT-4o-mini responds
- [ ] AI response saved as a **child node** connected to the parent
- [ ] Simple prompt: "You are a thinking partner. Help me explore this idea: {node_content}"

### Persistence
- [ ] Auto-save canvas state to IndexedDB on every change
- [ ] Load canvas from IndexedDB on startup

### Import (Simple)
- [ ] Paste text → create a new text node

---

## 4. UI Layout

```
┌──────────────────────────────────────────────────┐
│  Header: Ponder AI                    [Import]   │
├─────────────────────────────────────┬────────────┤
│                                     │  AI Panel  │
│                                     │            │
│         Infinite Canvas             │  [Chat]    │
│         (nodes + edges)             │            │
│                                     │            │
│                                     │            │
└─────────────────────────────────────┴────────────┘
```

- **Header**: App title + Import button
- **Canvas**: Full area with nodes/edges
- **AI Panel**: Right sidebar (toggleable), shows chat history per selected node

---

## 5. Data Model

### Node
```typescript
interface PonderNode {
  id: string;
  type: 'text' | 'ai-response';
  position: { x: number; y: number };
  data: {
    content: string;       // text content
    createdAt: string;    // ISO timestamp
  };
}
```

### Edge
```typescript
interface PonderEdge {
  id: string;
  source: string;   // node id
  target: string;   // node id
}
```

### Canvas State
```typescript
interface CanvasState {
  nodes: PonderNode[];
  edges: PonderEdge[];
}
```

---

## 6. Project Structure

```
ponder-ai/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── electron/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script
│   └── window.ts        # BrowserWindow setup
├── src/
│   ├── main.tsx         # React entry
│   ├── App.tsx           # Root component
│   ├── index.css        # Tailwind + custom
│   ├── components/
│   │   ├── Canvas.tsx       # XyFlow wrapper
│   │   ├── PonderNode.tsx   # Custom node component
│   │   ├── AIPanel.tsx      # AI chat sidebar
│   │   ├── Header.tsx       # Top bar
│   │   └── ImportModal.tsx  # Text import modal
│   ├── store/
│   │   └── canvasStore.ts   # Zustand store
│   ├── lib/
│   │   ├── ai.ts           # OpenAI API call
│   │   └── storage.ts       # IndexedDB helpers
│   └── types/
│       └── index.ts         # TypeScript interfaces
└── SPEC.md
```

---

## 7. Non-Goals (MVP)

- No multi-format file import (PDF, audio, video)
- No knowledge graph visualization
- No export functionality
- No local LLM (Ollama) support — only OpenAI API
- No canvas styling customization (colors, fonts)
