import fs from 'fs'
import path from 'path'
import { Parser } from 'htmlparser2'
import { load, dump } from 'js-yaml'
import JSON5 from 'json5'

export interface SFCI18nBlock {
  locale?: string
  src?: string
  lang?: string
  messages: Record<string, any>
  content: string
  start: number
  end: number
}

export interface MetaLocaleMessage {
  components: Record<string, SFCI18nBlock[]>
}

export function parseVueSfc(content: string, filepath: string): SFCI18nBlock[] {
  const blocks: SFCI18nBlock[] = []
  let currentBlock: Partial<SFCI18nBlock> | null = null
  let currentContent = ''

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        if (name === 'i18n') {
          currentBlock = {
            locale: attribs.locale,
            src: attribs.src,
            lang: attribs.lang,
            start: parser.startIndex,
          }
          currentContent = ''
        }
      },
      ontext(text) {
        if (currentBlock) currentContent += text
      },
      onclosetag(name) {
        if (name === 'i18n' && currentBlock) {
          currentBlock.content = currentContent
          currentBlock.end = parser.endIndex === null ? parser.startIndex : undefined

          // Parse messages
          let messages = {}
          if (currentBlock.src) {
            try {
              const srcPath = path.resolve(path.dirname(filepath), currentBlock.src)
              const fileContent = fs.readFileSync(srcPath, 'utf-8')
              const ext = path.extname(srcPath).slice(1)
              const lang = currentBlock.lang || ext

              if (lang === 'yaml' || lang === 'yml') messages = load(fileContent) || {}
              else if (lang === 'json5') messages = JSON5.parse(fileContent)
              else messages = JSON.parse(fileContent)
            } catch (e) {
              console.error(`Failed to load external i18n block from ${currentBlock.src}`, e)
            }
          } else {
            try {
              const content = currentBlock.content || ''
              if (currentBlock.lang === 'yaml' || currentBlock.lang === 'yml') messages = load(content) || {}
              else if (currentBlock.lang === 'json5') messages = JSON5.parse(content)
              else messages = JSON.parse(content)
            } catch (e) {
              console.error('Failed to parse i18n block', e)
            }
          }

          currentBlock.messages = messages
          blocks.push(currentBlock as SFCI18nBlock)
          currentBlock = null
        }
      },
    },
    {
      xmlMode: true,
      lowerCaseTags: true,
    },
  )

  parser.write(content)
  parser.end()

  return blocks
}

export function writeVueSfc(content: string, filepath: string, blocks: SFCI18nBlock[]): string {
  // Sort blocks by start index descending to avoid index shifting
  const sortedBlocks = [...blocks].sort((a, b) => b.start - a.start)

  let newContent = content

  for (const block of sortedBlocks) {
    if (block.src) {
      // Write to external file
      try {
        const srcPath = path.resolve(path.dirname(filepath), block.src)
        const ext = path.extname(srcPath).slice(1)
        const lang = block.lang || ext
        let serialized = ''
        if (lang === 'yaml' || lang === 'yml') serialized = dump(block.messages, { indent: 2 })
        else if (lang === 'json5') serialized = JSON5.stringify(block.messages, null, 2)
        else serialized = JSON.stringify(block.messages, null, 2)

        fs.writeFileSync(srcPath, serialized)
      } catch (e) {
        console.error(`Failed to write external i18n block to ${block.src}`, e)
      }
    } else {
      // Write to SFC
      let serialized = ''
      if (block.lang === 'yaml' || block.lang === 'yml') serialized = dump(block.messages, { indent: 2 })
      else if (block.lang === 'json5') serialized = JSON5.stringify(block.messages, null, 2)
      else serialized = JSON.stringify(block.messages, null, 2)

      const attrs = []
      if (block.locale) attrs.push(`locale="${block.locale}"`)
      if (block.lang) attrs.push(`lang="${block.lang}"`)

      const attrStr = attrs.length ? ` ${attrs.join(' ')}` : ''
      const newBlockStr = `<i18n${attrStr}>\n${serialized}\n</i18n>`

      newContent = newContent.slice(0, block.start) + newBlockStr + newContent.slice(block.end + 1)
    }
  }

  return newContent
}
