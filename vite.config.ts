
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Use type casting for process.cwd() to handle missing node types
  const currentDir = (process as any).cwd();
  const env = loadEnv(mode, currentDir, '');
  return {
    plugins: [react()],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(currentDir, './'), // Maps '@' to project root
      },
    },
    server: {
        fs: {
            strict: false
        }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {}
    }
  };
});
