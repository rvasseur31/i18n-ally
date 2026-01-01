import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind, languages } from 'vscode'
import Fuse from 'fuse.js'
import { ExtensionModule } from '~/modules'
import { Global, KeyDetector, Loader, CurrentFile } from '~/core'

class CompletionProvider implements CompletionItemProvider {
  public provideCompletionItems(document: TextDocument, position: Position) {
    if (!Global.enabled) return

    const loader: Loader = CurrentFile.loader
    // Pass false to dotEnding to allow fuzzy search on partial keys (e.g. "common.canc")
    const keyData = KeyDetector.getKeyAndRange(document, position, false)

    if (!keyData) return

    const { key, range } = keyData
    const scopedKey = KeyDetector.getScopedKey(document, position)

    const rules = Global.derivedKeyRules
    let keys = loader.keys.reduce((acc, cur) => {
      let normalized = cur
      for (const r of rules) {
        const match = r.exec(cur)
        if (match && match[1]) {
          normalized = match[1]
          break
        }
      }

      if (!acc.includes(normalized)) acc.push(normalized)
      return acc
    }, [] as string[])

    if (scopedKey) {
      keys = keys.filter(k => k.startsWith(`${scopedKey}.`)).map(k => k.slice(scopedKey.length + 1))
    }

    const candidates = keys.map(k => {
      const value = loader.getValueByKey(scopedKey ? `${scopedKey}.${k}` : k)
      return {
        key: k,
        value,
      }
    })

    const toCompletionItem = (c: { key: string; value: any }) => {
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

    const fuse = new Fuse(candidates, {
      includeScore: true,
      threshold: 0.4,
      keys: ['key', 'value'],
    })

    


    const results = fuse.search(key)
    return results.map(r => toCompletionItem(r.item))
  }
}

const m: ExtensionModule = () => {
  return languages.registerCompletionItemProvider(
    Global.getDocumentSelectors(),
    new CompletionProvider(),
    '.',
    "'",
    '"',
    '`',
    ':',
  )
}

export default m
