import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

const skipElectron = process.env.ELECTRON_SKIP === '1';

export default defineConfig({
  plugins: [
    react(),
    ...(skipElectron ? [] : [
      electron([
        {
          entry: 'electron/main.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              // Use esbuild to bundle, not rollup, to avoid CJS/ESM issues
              rollupOptions: {
                // electron must be external - it can only be required in Electron runtime
                external: ['path', /^node:/],
              }
            }
          }
        },
        {
          entry: 'electron/preload.ts',
          onstart(options) {
            options.reload()
          },
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                external: ['electron', /^node:/],
              }
            }
          }
        }
      ]),
      renderer()
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
