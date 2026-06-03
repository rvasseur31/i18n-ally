import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { fetchWithTimeout } from './fetch'
import { Config } from '~/core'

export default class LibreTranslate extends TranslateEngine {
  apiRoot = 'http://localhost:5000'

  async translate(options: TranslateOptions) {
    const { from = 'auto', to = 'auto' } = options

    let apiRoot = this.apiRoot
    if (Config.libreTranslateApiRoot) apiRoot = Config.libreTranslateApiRoot

    const response = await fetchWithTimeout(
      `${apiRoot}/translate`,
      {
        method: 'POST',
        body: JSON.stringify({
          q: options.text,
          source: from,
          target: to,
          format: 'html',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      this.config.timeout,
    )

    const data = await response.json()

    return this.transform(data, options)
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const { text, to = 'auto' } = options

    const r: TranslateResult = {
      text,
      to,
      from: response.src,
      response,
      linkToResult: '',
    }

    if (response?.translatedText != null) r.result = [response.translatedText]
    else r.error = new Error(response?.error || 'No result')

    return r
  }
}
