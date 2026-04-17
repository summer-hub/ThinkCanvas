# 🌱 ThinkCanvas

> An infinite canvas for thinking with AI - Your personal knowledge workspace

ThinkCanvas is a desktop application that combines an infinite canvas with AI-powered thinking assistance. Create nodes, connect ideas, and chat with AI to explore your thoughts in a visual, non-linear way.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Capabilities
- 🎨 **Infinite Canvas** - Unlimited space for your ideas with pan, zoom, and minimap
- 💭 **Visual Thinking** - Create nodes and connect them to build your thought network
- 🤖 **AI Partner** - Chat with AI about any node, responses become new connected nodes
- 📚 **RAG Integration** - Reference uploaded documents in chat with @filename syntax
- 🔍 **Semantic Search** - AI retrieves relevant context from your documents automatically
- 💾 **Auto-Save** - Everything is saved locally in IndexedDB automatically
- 🎯 **Node Types** - Distinguish between your ideas and AI responses
- 🎨 **Customization** - Color-code your nodes, resize them as needed
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with keyboard support

### User Experience
- 🚀 **Welcome Screen** - Guided onboarding for first-time users
- 📥 **Import Text** - Paste text to create nodes instantly
- 📁 **File Upload** - Upload PDF, Word, and text documents
- 📂 **File Management** - View, preview, and manage uploaded files
- 🔍 **Context Menu** - Right-click nodes for quick actions
- 📊 **Statistics** - Track your nodes and connections count
- ⚙️ **AI Settings** - Configure OpenAI, DeepSeek, or local Ollama
- ↩️ **Undo/Redo** - Full history management with keyboard shortcuts
- 🔍 **Search** - Find nodes quickly with full-text search
- 💾 **Export** - Export canvas as Markdown, JSON, or PNG

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd thinkcanvas

# Install dependencies
npm install

# Set up your OpenAI API key (or configure in app)
# You can also use DeepSeek or Ollama
```

### Development

```bash
# Run in web mode (faster for development)
npm run dev

# Run in Electron mode
npm run electron:dev
```

### Build

```bash
# Build for production
npm run build

# The app will be in the release/ folder
```

## 🎮 How to Use

### Creating Nodes
1. **Double-click** anywhere on the canvas to create a new node
2. **Double-click** a node to edit its content
3. **Drag** nodes to reposition them
4. **Resize** selected nodes using the corner handles

### Connecting Ideas
1. **Drag** from the bottom handle of one node to the top handle of another
2. Connections show the flow of your thoughts
3. **Delete** connections by selecting and pressing Delete

### AI Assistance
1. **Click** a node to select it
2. The AI panel opens on the right
3. **Type** your question or thought
4. **Use @filename** to reference uploaded documents (autocomplete available)
5. AI responds with context from your documents and creates a new connected node
6. **View sources** below AI responses to see which documents were used

### Document-Aware Chat (RAG)
1. **Upload** documents (PDF, Word, Text) using the "Upload" button
2. Wait for automatic indexing (progress bar shown)
3. In AI chat, type **@** to see available files
4. Select a file or type its name: `@research.pdf what are the main findings?`
5. AI will retrieve relevant context and answer based on the document
6. **Source attribution** shows which parts of the document were used
7. Click sources to expand and view the exact content used

### Keyboard Shortcuts
- `Double-click canvas` - Create new node
- `Double-click node` - Edit node
- `Delete/Backspace` - Delete selected node
- `Escape` - Deselect node
- `Ctrl/Cmd + Enter` - Submit in import modal

### Importing Content
1. Click **"+ Import"** in the header
2. Paste your text
3. Separate paragraphs with blank lines to create multiple nodes
4. Press `Ctrl/Cmd + Enter` or click "Create Node"

### Uploading Files
1. Click **"Upload"** in the header
2. Drag and drop a file or click "Browse Files"
3. Supported formats: PDF, Word (.docx), Text (.txt), Markdown (.md)
4. Wait for parsing and automatic indexing (progress bar shown)
5. A new node is created automatically with the file content
6. File is now searchable via @filename in AI chat

### Managing Files
1. Click **"Files"** in the header to view all uploaded files
2. Click on a file to preview its full content
3. Use **"Create Node"** to generate a new node from the file
4. Use **"Delete"** to remove files you no longer need

## 🛠️ Tech Stack

- **Desktop**: Electron
- **Frontend**: React 18 + TypeScript
- **Canvas**: @xyflow/react (React Flow)
- **State**: Zustand
- **Storage**: IndexedDB (idb-keyval)
- **AI**: OpenAI API (GPT-4o, GPT-4o-mini), DeepSeek, Ollama
- **RAG**: Custom vector store with IndexedDB
- **Embeddings**: Multi-provider (OpenAI, Youdao, Zhipu, Qwen, Wenxin)
- **File Processing**: pdfjs-dist, mammoth
- **Styling**: Tailwind CSS
- **Build**: Vite

## 📁 Project Structure

```
thinkcanvas/
├── electron/           # Electron main process
│   ├── main.ts        # Main entry point
│   ├── preload.ts     # Preload script
│   └── ipc/           # IPC handlers
├── src/
│   ├── components/    # React components
│   │   ├── Canvas.tsx
│   │   ├── PonderNode.tsx
│   │   ├── AIPanel.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities
│   │   ├── ai.ts      # AI integration
│   │   └── storage.ts # IndexedDB helpers
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   └── App.tsx        # Root component
├── SPEC.md            # Project specification
├── PROGRESS.md        # Development progress
└── package.json
```

## 🔧 Configuration

### AI Providers

ThinkCanvas supports multiple AI providers for chat:

1. **OpenAI** (default)
   - Get API key from [platform.openai.com](https://platform.openai.com)
   - Models: GPT-4o-mini, GPT-4o, GPT-4

2. **DeepSeek**
   - Get API key from [platform.deepseek.com](https://platform.deepseek.com)
   - Cost-effective alternative
   - Models: deepseek-chat, deepseek-reasoner

3. **Ollama** (local)
   - Install from [ollama.com](https://ollama.com)
   - Run models locally for privacy

### Embeddings Providers (for RAG)

For document search and RAG features, configure an embeddings provider:

1. **OpenAI** (International)
   - Model: text-embedding-3-small
   - Dimensions: 1536

2. **Youdao BCEmbedding** (China) ⭐ Recommended
   - Optimized for RAG
   - Dimensions: 768
   - Get API key from [ai.youdao.com](https://ai.youdao.com)

3. **Zhipu AI** (China)
   - Model: embedding-3
   - Dimensions: 1024
   - Requires JWT authentication

4. **Qwen** (Alibaba Cloud)
   - Model: text-embedding-v3
   - Dimensions: 1536

5. **Wenxin** (Baidu)
   - Model: embedding-v1
   - Dimensions: 384

**Mixed Usage**: You can use different providers for chat and embeddings. For example:
- Chat: DeepSeek (cost-effective)
- Embeddings: Youdao BCEmbedding (RAG-optimized)

Configure in the app: Click ⚙️ in the header → Configure both Chat Provider and Embeddings Provider

## 🗺️ Roadmap

See [PROGRESS.md](./PROGRESS.md) for detailed development progress.

### ✅ Phase 1: MVP Complete
- Infinite canvas with nodes and edges
- AI chat integration
- Local storage
- Keyboard shortcuts
- Welcome screen
- Undo/redo functionality
- Search functionality
- Export features

### ✅ Phase 2: File Processing Complete
- PDF/Word document parsing
- File upload and management
- Document preview
- Extract content to nodes

### ✅ Phase 3: RAG Integration Complete (v0.4.0)
- ✅ Vector database (IndexedDB-based)
- ✅ Text embeddings (multi-provider support)
- ✅ @filename reference in chat with autocomplete
- ✅ Context retrieval with semantic search
- ✅ Source attribution display
- ✅ Multi-provider embeddings (OpenAI, Youdao, Zhipu, Qwen, Wenxin)
- ✅ Automatic file indexing
- ✅ RAG test suite

### 🚀 Phase 4: Advanced Features (1-3 months)
- [ ] Deep research workflows (LangGraph)
- [ ] Knowledge graph visualization
- [ ] Multi-agent systems
- [ ] Export to Markdown/PDF/PPT
- [ ] Collaboration features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Ponder.ing](https://ponder.ing)
- Built with [React Flow](https://reactflow.dev)
- AI powered by [OpenAI](https://openai.com)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Happy Pondering! 🌱**
