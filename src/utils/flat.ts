export const ROOT_KEY = '__i18n_ally_root__'

export function unflatten(data: any) {
  const output: any = {}

  Object.keys(data || {})
    .sort((a, b) => b.length - a.length)
    .forEach(key => {
      const original = key ? getValue(output, key) : output

      if (isObject(original)) setValue(output, key ? `${key}.${ROOT_KEY}` : ROOT_KEY, data[key])
      else if (original === undefined) setValue(output, key, data[key])
      else throw new Error(`Duplicated key ${key} found`)
    })

  return output
}

export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

export function getValue(obj: any, path: string | string[]) {
  const keys = Array.isArray(path) ? path : path.split('.')
  return keys.reduce((acc, key) => acc?.[key], obj)
}

export function setValue(obj: any, path: string | string[], value: any) {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) current[key] = {}
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}
