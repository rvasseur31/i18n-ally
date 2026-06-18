import { glob as tinyGlob, globSync as tinyGlobSync, type GlobOptions } from 'tinyglobby'

function compat({ deep, ...rest }: GlobOptions): GlobOptions {
  return { ...rest, expandDirectories: false, deep: deep === undefined ? undefined : deep - 1 }
}

const stripTrailingSlash = (paths: string[]): string[] => paths.map(p => p.replace(/\/+$/, ''))

export async function glob(patterns: string | string[], options: GlobOptions = {}): Promise<string[]> {
  return stripTrailingSlash(await tinyGlob(patterns, compat(options)))
}

export function globSync(patterns: string | string[], options: GlobOptions = {}): string[] {
  return stripTrailingSlash(tinyGlobSync(patterns, compat(options)))
}
