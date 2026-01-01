import qs from 'qs'

import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Log } from '~/utils'
import { Config } from '~/core'

interface DeepLUsage {
  character_count: number
  character_limit: number
}

interface DeepLTranslate {
  detected_source_language: string
  text: string
}

interface DeepLTranslateRes {
  translations: DeepLTranslate[]
}

function log(inspector: boolean, ...args: any[]): void {
  if (Config.deeplLog) {
    // eslint-disable-next-line no-console
    if (inspector) console.log('[DeepL]\n', ...args)
    else Log.raw(...args)
  }
}

async function fetchDeepl<T>(url: string, options: RequestInit & { data?: any } = {}) {
  const baseURL = Config.deeplUseFreeApiEntry
    ? 'https://api-free.deepl.com/v2'
    : 'https://api.deepl.com/v2'

  const fullUrl = new URL(url.startsWith('/') ? url.slice(1) : url, `${baseURL}/`)

  if (Config.deeplApiKey)
    fullUrl.searchParams.append('auth_key', Config.deeplApiKey)

  const method = options.method || 'GET'
  const headers = new Headers(options.headers)

  let body: string | undefined

  if (method.toUpperCase() === 'POST') {
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    if (options.data)
      body = qs.stringify(options.data)
  }

  log(true, {
    url: fullUrl.toString(),
    method,
    headers: Object.fromEntries(headers.entries()),
    data: options.data,
    params: { auth_key: Config.deeplApiKey },
  })

  const response = await fetch(fullUrl.toString(), {
    method,
    headers,
    body,
  })

  const resData = await response.json() as T

  log(true, {
    status: response.status,
    statusText: response.statusText,
    data: resData,
  })

  if (!response.ok)
    throw new Error(`DeepL API Error: ${response.status} ${response.statusText}`)

  return resData
}

export async function usage(): Promise<DeepLUsage> {
  try {
    return fetchDeepl('/usage')
  }
  catch (err) {
    log(false, err)

    throw err
  }
}

function stripeLocaleCode(locale?: string): string | undefined {
  if (!locale)
    return locale
  const index = locale.indexOf('-')
  if (index === -1)
    return locale
  return locale.slice(0, index)
}

export class DeepLTranslateEngine extends TranslateEngine {
  async translate(options: TranslateOptions) {
    try {
      const res: DeepLTranslateRes = await fetchDeepl('/translate', {
        method: 'POST',
        data: {
          text: options.text,
          source_lang: stripeLocaleCode(options.from || undefined),
          target_lang: stripeLocaleCode(options.to),
        },
      })

      return this.transform(res.translations, options)
    }
    catch (err) {
      log(false, err)

      throw err
    }
  }

  transform(res: DeepLTranslate[], options: TranslateOptions): TranslateResult {
    const r: TranslateResult = {
      text: options.text,
      to: options.to || 'auto',
      from: options.from || 'auto',
      response: res,
      linkToResult: '',
    }

    try {
      const result: string[] = []

      res.forEach((tran: DeepLTranslate) => result.push(tran.text))

      r.result = result
    }
    catch (err) {}

    if (!r.detailed && !r.result) r.error = new Error('No result')

    log(false, `DEEPL TRANSLATE!! ${JSON.stringify(r.result)}, from ${options.from} to ${options.to}`)

    return r
  }
}
