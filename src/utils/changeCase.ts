export type CaseStyles = 'default' | 'kebab-case' | 'snake_case' | 'camelCase' | 'PascalCase' | 'ALL_CAPS'

function splitWords(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
}

function camelCase(str: string) {
  return splitWords(str)
    .map((c, i) => (i === 0 ? c.toLowerCase() : c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()))
    .join('')
}

function pascalCase(str: string) {
  return splitWords(str)
    .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
    .join('')
}

function kebabCase(str: string) {
  return splitWords(str)
    .map(c => c.toLowerCase())
    .join('-')
}

function snakeCase(str: string) {
  return splitWords(str)
    .map(c => c.toLowerCase())
    .join('_')
}

function constantCase(str: string) {
  return splitWords(str)
    .map(c => c.toUpperCase())
    .join('_')
}

export function changeCase(str: string, style: CaseStyles) {
  if (!style || style === 'default') return str

  switch (style) {
    case 'ALL_CAPS':
      return constantCase(str)
    case 'kebab-case':
      return kebabCase(str)
    case 'camelCase':
      return camelCase(str)
    case 'PascalCase':
      return pascalCase(str)
    case 'snake_case':
      return snakeCase(str)
    default:
      return str
  }
}
