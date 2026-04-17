# Project Structure

## Root Directory Organization

```
thinkcanvas/
├── electron/          # Electron main process code
├── src/              # React application (renderer process)
├── public/           # Static assets
├── dist/             # Vite build output (gitignored)
├── dist-electron/    # Compiled Electron code (gitignored)
├── release/          # Packaged applications (gitignored)
├── scripts/          # Build and setup scripts
└── node_modules/     # Dependencies (gitignored)
```

## Electron Process (`electron/`)

Main process code for the Electron desktop application:

- **main.ts**: Application entry point, window creation, lifecycle management
- **preload.ts**: Preload script for secure IPC bridge between main and renderer
- **ipc/**: IPC handlers organized by domain
  - `ai.ts`: AI provider configuration and chat handlers
  - `providers.ts`: AI provider management

## Source Code (`src/`)

React application organized by feature and responsibility:

### Components (`src/components/`)

UI components following a flat structure:

- **Canvas.tsx**: Main infinite canvas component (React Flow wrapper)
- **PonderNode.tsx**: Individual node component with editing, resizing, color picker
- **AIPanel.tsx**: Right sidebar for AI chat interface
- **Header.tsx**: Top navigation with stats, import, settings
- **WelcomeScreen.tsx**: First-time user onboarding
- **ColorPicker.tsx**: Node color selection UI
- **ExportModal.tsx**: Canvas export functionality
- **ImportModal.tsx**: Text import for bulk node creation
- **NodeContextMenu.tsx**: Right-click menu for node actions
- **ProviderSettings.tsx**: AI provider configuration UI
- **SearchPanel.tsx**: Search functionality (if implemented)

### State Management (`src/store/`)

Zustand stores for global state:

- **canvasStore.ts**: Canvas state (nodes, edges, selection, AI messages)
  - Node CRUD operations
  - Edge management
  - AI panel state
  - Persistence coordination
  - History snapshot management
- **historyStore.ts**: Undo/redo functionality
  - History stack management
  - Snapshot restoration

### Library Code (`src/lib/`)

Utility functions and integrations:

- **ai.ts**: AI provider abstraction layer
  - Provider configuration
  - Chat API calls
  - Multi-provider support (OpenAI, DeepSeek, Ollama)
- **storage.ts**: IndexedDB persistence layer
  - Canvas state save/load
  - Auto-save coordination
- **fileStorage.ts**: File handling utilities
- **fileParser.ts**: Document parsing (PDF, Word)
- **export.ts**: Canvas export functionality

### Type Definitions (`src/types/`)

- **index.ts**: Core application types (PonderNode, PonderEdge, AIMessage)
- **electron.d.ts**: Electron IPC type definitions for window.electron

### Hooks (`src/hooks/`)

- **useKeyboardShortcuts.ts**: Global keyboard shortcut handling

### Entry Points

- **main.tsx**: React application entry point
- **App.tsx**: Root component with React Flow provider
- **index.css**: Global styles and Tailwind imports

## Configuration Files (Root)

- **vite.config.ts**: Vite build configuration with conditional Electron plugins
- **tsconfig.json**: TypeScript config for React code
- **tsconfig.electron.json**: TypeScript config for Electron main process
- **tailwind.config.js**: Tailwind CSS configuration
- **postcss.config.js**: PostCSS plugins
- **package.json**: Dependencies and scripts
- **.gitignore**: Git exclusions
- **.env.local**: Local environment variables (gitignored)

## Documentation Files

- **README.md**: Project overview and setup instructions
- **SPEC.md**: Original project specification
- **PROGRESS.md**: Development progress tracking
- **TODO.md**: Task list
- **QUICKSTART.md**: Quick start guide
- Various feature documentation (BUGFIX.md, EXPORT_FEATURE.md, etc.)

## Architecture Patterns

### State Management Pattern

- Zustand stores are the single source of truth
- Components subscribe to specific slices of state
- Actions are defined in stores, not components
- Debounced auto-save prevents excessive writes

### Component Pattern

- Functional components with TypeScript
- Props interfaces defined inline or in types/
- Hooks for side effects and subscriptions
- Minimal prop drilling (use Zustand instead)

### IPC Pattern (Electron)

- Main process handlers in `electron/ipc/`
- Preload script exposes typed API via `window.electron`
- Renderer uses IPC for privileged operations (file system, AI config)
- Fallback to browser APIs when not in Electron

### File Naming Conventions

- React components: PascalCase (e.g., `Canvas.tsx`, `AIPanel.tsx`)
- Utilities/libraries: camelCase (e.g., `storage.ts`, `fileParser.ts`)
- Stores: camelCase with "Store" suffix (e.g., `canvasStore.ts`)
- Types: camelCase (e.g., `index.ts`, `electron.d.ts`)
- Config files: kebab-case or standard names (e.g., `vite.config.ts`)

## Import Conventions

- Use `@/` alias for src imports: `import { useCanvasStore } from '@/store/canvasStore'`
- Relative imports for same-directory files
- Type-only imports use `import type` syntax
- Group imports: external deps → internal modules → types → styles
