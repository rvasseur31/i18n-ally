const QUOTE_PLACEHOLDER = '\uE000'

/**
 * 'foo' + bar() + ' is cool' -> `foo${bar()} is cool`
 */
export function stringConcatenationToTemplate(text: string) {
  let result = text.trim()
  // Ensure the string starts and ends with quotes for consistent processing
  if (!result.match(/^['"`]/))
    result = `''+${result}`
  if (!result.match(/['"`]$/))
    result = `${result}+''`

  // Replace all unescaped quotes with a placeholder
  // We run this twice to handle consecutive quotes (e.g. '') where the first pass consumes the preceding character
  result = result
    .replace(/([^\\])(['"`])/g, `$1${QUOTE_PLACEHOLDER}`)
    .replace(/([^\\])(['"`])/g, `$1${QUOTE_PLACEHOLDER}`)
    .replace(/^(['"`])/g, QUOTE_PLACEHOLDER)

  // Convert concatenation to template interpolation
  // Matches: PLACEHOLDER ... + ... + PLACEHOLDER
  const concatenationRegex = new RegExp(`${QUOTE_PLACEHOLDER}\\s*\\+\\s*(.*?)\\s*\\+\\s*${QUOTE_PLACEHOLDER}`, 'g')
  result = result.replace(concatenationRegex, (_, content) => `$\{${content.trim()}}`)

  // Revert placeholders to backticks
  result = result.replace(new RegExp(QUOTE_PLACEHOLDER, 'g'), '`')
  return result
}

export function parseHardString(text = '', languageId?: string, isDynamic = false) {
  const trimmed = text.trim().replace(/\s*\r?\n\s*/g, ' ')
  let processed = trimmed
  const args: string[] = []
  if (!trimmed) return null

  if (isDynamic && ['vue', 'js'].includes(languageId || ''))
    processed = stringConcatenationToTemplate(processed).slice(1, -1)

  processed = processed.replace(/(?:\{\{(.*?)\}\}|\$\{(.*?)\})/g, (full, content, content2) => {
    args.push((content ?? content2 ?? '').trim())
    return `{${args.length - 1}}`
  })

  return {
    trimmed,
    text: processed,
    args,
  }
}
