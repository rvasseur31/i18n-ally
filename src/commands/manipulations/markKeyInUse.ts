import { LocaleTreeItem } from '~/views'
import { Config } from '~/core'
import { uniq } from '~/utils'

export async function markKeyInUse(item?: LocaleTreeItem) {
  if (!item)
    return

  const keypath = item.node.keypath
  Config.keysInUse = uniq([...Config.keysInUse, keypath])
}
