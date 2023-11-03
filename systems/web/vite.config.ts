import { dirname, join } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import packageJson from './package.json' assert { type: 'json' };

const rootDir = new URL(dirname(import.meta.url)).pathname;
const projectRoot = join(rootDir, '../..');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, projectRoot, 'WEB_');
  return {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: `assets/[name]-[hash]-${packageJson.version}[extname]`,
          entryFileNames: `[name]-[hash]-${packageJson.version}.js`,
        },
      },
    },
    envDir: projectRoot,
    envPrefix: 'WEB',
    plugins: [react()],
    server: {
      port: Number(loadedEnv['WEB_DEV_SERVER_PORT']),
    },
  };
});
