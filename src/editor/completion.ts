import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind, languages, Range } from 'vscode'
import Fuse from 'fuse.js'
import { ExtensionModule } from '~/modules'
import { Global, KeyDetector, Loader, CurrentFile } from '~/core'

class CompletionProvider implements CompletionItemProvider {
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
  ) {
    if (!Global.enabled)
      return

    const loader: Loader = CurrentFile.loader
    // Pass false to dotEnding to allow fuzzy search on partial keys (e.g. "common.canc")
    const keyData = KeyDetector.getKeyAndRange(document, position, false)

    if (!keyData) return

    const { key, range } = keyData
    const scopedKey = KeyDetector.getScopedKey(document, position)

    let keys = loader.keys

    if (scopedKey) {
      keys = keys
        .filter(k => k.startsWith(`${scopedKey}.`))
        .map(k => k.slice(scopedKey.length + 1))
    }

    if (!key) {
      return keys.map((k) => {
        const item = new CompletionItem(k, CompletionItemKind.Value)
        item.detail = loader.getValueByKey(scopedKey ? `${scopedKey}.${k}` : k)
        item.range = range
        return item
      })
    }

    const fuse = new Fuse(keys, {
      includeScore: true,
      threshold: 0.4,
    })

    const results = fuse.search(key)

    return results.map((result) => {
      const k = result.item
      const item = new CompletionItem(k, CompletionItemKind.Value)
      item.detail = loader.getValueByKey(scopedKey ? `${scopedKey}.${k}` : k)
      item.range = range
      return item
    })
  }
}

const m: ExtensionModule = () => {
  return languages.registerCompletionItemProvider(
    Global.getDocumentSelectors(),
    new CompletionProvider(),
    '.', '\'', '"', '`', ':',
  )
}

export default m
