import { defineConfig } from 'rolldown'
import { visualizer } from 'rollup-plugin-visualizer'

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
    'prettier',
  ],
  transform: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.I18N_ALLY_ENV || 'production'),
    },
  },
  plugins: [
    visualizer(),
  ],
})
