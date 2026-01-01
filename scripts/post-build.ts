import { write } from 'bun'

async function run() {
  await write('dist/extension.d.ts', 'export * from \'./src/extension\'')
}

run()
