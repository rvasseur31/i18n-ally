import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind, languages } from 'vscode'
import Fuse from 'fuse.js'
import { ExtensionModule } from '~/modules'
import { Global, KeyDetector, Loader, CurrentFile } from '~/core'

interface Candidate {
  key: string
  value: any
}

class CompletionProvider implements CompletionItemProvider {
  // memoized per scopedKey, invalidated on loader.onDidChange (see module factory)
  private cache: Record<string, { candidates: Candidate[]; fuse: Fuse<Candidate> }> = {}

  public resetCache() {
    this.cache = {}
  }

  private getEntry(loader: Loader, scopedKey: string | undefined) {
    const cacheKey = scopedKey ?? ''
    const cached = this.cache[cacheKey]
    if (cached) return cached

    const rules = Global.derivedKeyRules
    const normalizedKeys = new Set<string>()
    for (const cur of loader.keys) {
      let normalized = cur
      for (const r of rules) {
        const match = r.exec(cur)
        if (match && match[1]) {
          normalized = match[1]
          break
        }
      }
      normalizedKeys.add(normalized)
    }

    let keys = [...normalizedKeys]
    if (scopedKey) {
      keys = keys.filter(k => k.startsWith(`${scopedKey}.`)).map(k => k.slice(scopedKey.length + 1))
    }

    const candidates = keys.map(k => ({
      key: k,
      value: loader.getValueByKey(scopedKey ? `${scopedKey}.${k}` : k),
    }))

    const fuse = new Fuse(candidates, {
      includeScore: true,
      threshold: 0.4,
      keys: ['key', 'value'],
    })

    const entry = { candidates, fuse }
    this.cache[cacheKey] = entry
    return entry
  }

  public provideCompletionItems(document: TextDocument, position: Position) {
    if (!Global.enabled) return

    const loader: Loader = CurrentFile.loader
    // Pass false to dotEnding to allow fuzzy search on partial keys (e.g. "common.canc")
    const keyData = KeyDetector.getKeyAndRange(document, position, false)

    if (!keyData) return

    const { key, range } = keyData
    const scopedKey = KeyDetector.getScopedKey(document, position)

    const { candidates, fuse } = this.getEntry(loader, scopedKey)

    const toCompletionItem = (c: Candidate) => {
      const item = new CompletionItem(c.key, CompletionItemKind.Value)
      item.detail = c.value
      item.range = range
      // Ensure VS Code's own filtering can match typed text (including searching by value).
      item.filterText = `${c.key} ${String(c.value ?? '')}`
      // Always insert the key, even if user typed part of the value.
      item.insertText = c.key
      return item
    }

    if (!key) {
      return candidates.map(toCompletionItem)
    }

    const results = fuse.search(key)
    return results.map(r => toCompletionItem(r.item))
  }
}

const m: ExtensionModule = () => {
  const provider = new CompletionProvider()

  return [
    CurrentFile.loader.onDidChange(() => provider.resetCache()),
    languages.registerCompletionItemProvider(Global.getDocumentSelectors(), provider, '.', "'", '"', '`', ':'),
  ]
}

export default m
