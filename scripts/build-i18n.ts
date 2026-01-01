import path from 'path'
import { Glob, write, file } from 'bun'

const DEFAULT_LOCALE = 'en'

;(async() => {
  const fallbackMessages = await file(`./locales/${DEFAULT_LOCALE}.json`).json()

  const glob = new Glob('./locales/*.json')
  const files = await Array.fromAsync(glob.scan())
  for (const f of files) {
    const { name: locale } = path.parse(f)
    const messages = await file(f).json()

    Object.keys(fallbackMessages)
      .forEach((key) => {
        messages[key] = messages[key] || fallbackMessages[key]
      })

    const output = locale === DEFAULT_LOCALE
      ? './package.nls.json'
      : `./package.nls.${locale.toLowerCase()}.json`

    await write(output, JSON.stringify(messages, null, 2))
  }
})()
