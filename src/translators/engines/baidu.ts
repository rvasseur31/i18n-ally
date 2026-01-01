import { createHash } from 'crypto'
import qs from 'qs'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Config } from '~/core'

interface BaiduSignOptions {
  appid: string | null | undefined
  salt: string
  secret: string | null | undefined
  query: string
}

export default class BaiduTranslate extends TranslateEngine {
  apiLink = 'https://fanyi.baidu.com'
  apiRoot = 'https://fanyi-api.baidu.com'

  async translate(options: TranslateOptions) {
    let { from = 'auto', to = 'auto' } = options

    from = this.convertToSupportedLocalesForGoogleCloud(from)
    to = this.convertToSupportedLocalesForGoogleCloud(to)

    const appid = Config.baiduAppid
    const secret = Config.baiduApiSecret
    const salt = Date.now().toString()
    const sign = this.getSign({ appid, secret, query: options.text, salt })

    const form = {
      q: options.text,
      appid,
      salt,
      from,
      to,
      sign,
    }

    const response = await fetch(`${this.apiRoot}/api/trans/vip/translate?${qs.stringify(form)}`, {
      method: 'GET',
    })

    const data = await response.json()

    return this.transform(data, options)
  }

  convertToSupportedLocalesForGoogleCloud(locale: string): string {
    return locale.replace(/-/g, '_').split('_')[0]
  }

  getSign({ appid, salt, query, secret }: BaiduSignOptions): string {
    if (appid && salt) {
      const string = appid + query + salt + secret
      return createHash('md5').update(string).digest('hex')
    }
    return ''
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const { text } = options

    const r: TranslateResult = {
      text,
      to: response.to,
      from: response.from,
      response,
      linkToResult: `${this.apiLink}/#${response.from}/${response.to}/${text}`,
    }

    try {
      const result: string[] = []
      response.trans_result.forEach((v: any) => {
        result.push(v.dst)
      })
      r.result = result
    }
    catch (e) {}

    if (!r.result) r.error = new Error((`[${response.error_code}] ${response.error_msg}`) || 'No result')

    return r
  }
}
