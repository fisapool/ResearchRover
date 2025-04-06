import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, rmSync, readFileSync, writeFileSync } from 'fs';

// Function to copy files after build
function copyPublicFiles() {
  return {
    name: 'copy-files',
    closeBundle() {
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'client/public/manifest.json'),
        resolve(__dirname, 'dist/manifest.json')
      );
      
      // Copy icon files
      ['16', '48', '128'].forEach(size => {
        copyFileSync(
          resolve(__dirname, `client/public/icon${size}.png`),
          resolve(__dirname, `dist/icon${size}.png`)
        );
      });

      // Move index.html to root and clean up
      if (existsSync(resolve(__dirname, 'dist/client/index.html'))) {
        copyFileSync(
          resolve(__dirname, 'dist/client/index.html'),
          resolve(__dirname, 'dist/index.html')
        );
        // Clean up client directory
        rmSync(resolve(__dirname, 'dist/client'), { recursive: true });
      }

      // Fix paths in index.html
      if (existsSync(resolve(__dirname, 'dist/index.html'))) {
        let htmlContent = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf-8');
        
        // Replace absolute paths with relative paths
        htmlContent = htmlContent.replace(/\/assets\//g, 'assets/');
        
        writeFileSync(resolve(__dirname, 'dist/index.html'), htmlContent);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyPublicFiles()
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'client/index.html'),
        background: resolve(__dirname, 'client/src/background.ts'),
        content: resolve(__dirname, 'client/src/content.tsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep the original file names for background and content scripts
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name].js';
          }
          // For other chunks, use the default naming
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep HTML files in root directory
          if (assetInfo.name && assetInfo.name.endsWith('.html')) {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/src')
    }
  }
}); 