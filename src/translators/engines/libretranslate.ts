import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Config } from '~/core'

export default class LibreTranslate extends TranslateEngine {
  apiRoot = 'http://localhost:5000'

  async translate(options: TranslateOptions) {
    const {
      from = 'auto',
      to = 'auto',
    } = options

    let apiRoot = this.apiRoot
    if (Config.libreTranslateApiRoot)
      apiRoot = Config.libreTranslateApiRoot

    const response = await fetch(`${apiRoot}/translate`, {
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
    })

    const data = await response.json()

    return this.transform(data, options)
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const {
      text,
      to = 'auto',
    } = options

    const r: TranslateResult = {
      text,
      to,
      from: response.src,
      response,
      result: [response.translatedText],
      linkToResult: '',
    }

    return r
  }
}
