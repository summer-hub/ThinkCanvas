# Technology Stack

## Build System & Tooling

- **Build Tool**: Vite 6.2.0
- **Package Manager**: npm
- **TypeScript**: 5.7.3 with strict mode enabled
- **Bundler**: Vite with Electron plugins

## Frontend Stack

- **Framework**: React 18.3.1 with TypeScript
- **Canvas Library**: @xyflow/react 12.4.4 (React Flow) for infinite canvas and node management
- **State Management**: Zustand 5.0.3 for global state
- **Styling**: Tailwind CSS 3.4.17 with PostCSS
- **Storage**: idb-keyval 6.2.1 for IndexedDB persistence

## Desktop Platform

- **Runtime**: Electron 34.5.8
- **Builder**: electron-builder 25.1.8
- **Plugins**: 
  - vite-plugin-electron for Electron integration
  - vite-plugin-electron-renderer for renderer process

## AI Integration

- **Primary SDK**: OpenAI 4.85.4 (compatible with OpenAI, DeepSeek, and other OpenAI-compatible APIs)
- **Supported Providers**:
  - OpenAI (GPT-4o, GPT-4o-mini)
  - DeepSeek (deepseek-reasoner, deepseek-chat)
  - Ollama (local models)

## File Processing

- **PDF**: pdfjs-dist 5.6.205
- **Word**: mammoth 1.12.0
- **Export**: html2canvas 1.4.1 for canvas screenshots

## Common Commands

### Development
```bash
# Web mode (faster, no Electron overhead)
npm run dev

# Electron mode (full desktop app)
npm run electron:dev

# Preview production build
npm run preview
```

### Building
```bash
# Build Electron main process
npm run build:electron

# Full production build (includes packaging)
npm run build
```

### Testing
No test framework currently configured.

## Configuration Files

- **vite.config.ts**: Main build configuration with conditional Electron plugins
- **tsconfig.json**: TypeScript config for React/Vite (renderer process)
- **tsconfig.electron.json**: Separate TypeScript config for Electron main process
- **tailwind.config.js**: Tailwind CSS configuration
- **postcss.config.js**: PostCSS with Tailwind and Autoprefixer

## Environment Variables

- **ELECTRON_SKIP=1**: Run in web-only mode (skips Electron build)
- **VITE_DEV_SERVER_URL**: Development server URL for Electron

## Path Aliases

- `@/*` maps to `src/*` for cleaner imports

## Build Output

- **dist/**: Vite build output (renderer process)
- **dist-electron/**: Compiled Electron main/preload scripts
- **release/**: Final packaged application (DMG for macOS)
