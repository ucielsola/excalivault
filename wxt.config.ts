import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, './src/lib'),
      },
    },
  }),
  manifest: {
    name: 'Excalivault',
    description: 'Personal vault for storing Excalidraws',
    version: '0.0.0',
    permissions: ['storage', 'scripting', 'activeTab'],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '96': 'icon/96.png',
        '128': 'icon/128.png'
      }
    },
    chrome_action: {
      default_area: {
        width: 400,
        height: 300,
        anchor: 'top_right'
      }
    },
    content_scripts: [
      {
        matches: ['https://excalidraw.com/*'],
        js: ['excalidraw-content.js'],
        run_at: 'document_start',
        all_frames: true
      }
    ]
  }
});
