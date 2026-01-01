import { defineConfig } from 'rolldown'

export default defineConfig({
  input: './src/extension.ts',
  tsconfig: true,
  output: {
    dir: 'dist',
    format: 'cjs',
    entryFileNames: 'extension.js',
    sourcemap: true,
  },
  platform: 'node',
  external: [
    'vscode',
    'less',
    'sass',
    'stylus',
  ],
  transform: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.I18N_ALLY_ENV || 'production'),
    },
  }
})
