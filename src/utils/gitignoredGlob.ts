import { resolve, join } from 'path'
import fs from 'fs-extra'
// @ts-expect-error
import parseGitIgnore from 'parse-gitignore'
import { Config } from '../core/Config'
import { Global } from '../core/Global'
import { glob } from './glob'
import { Log } from './Log'

function gitignoreToGlob(pattern: string): string[] {
  let p = pattern.trim()
  if (!p || p.startsWith('#') || p.startsWith('!')) return []
  p = p.replace(/\/+$/, '')
  const anchored = p.startsWith('/')
  if (anchored) p = p.slice(1)
  const base = anchored || p.includes('/') ? p : `**/${p}`
  return [base, `${base}/**`]
}

export async function gitignoredGlob(globStr: string, dir: string) {
  const root = Global.rootpath
  const gitignorePath = join(root, '.gitignore')
  let gitignore: string[] = []
  try {
    if (fs.existsSync(gitignorePath)) gitignore = parseGitIgnore(await fs.promises.readFile(gitignorePath))
  } catch (e) {
    Log.error(e)
  }

  const ignore = ['node_modules', 'dist', ...gitignore, ...(Global.localesPaths || []), ...Config.usageScanningIgnore]
    .flatMap(gitignoreToGlob)

  const files = await glob(globStr, {
    cwd: dir,
    ignore,
    onlyFiles: true,
  })

  return files.map(f => resolve(dir, f))
}
