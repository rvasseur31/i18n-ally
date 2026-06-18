import { basename } from 'path'
import { promises as fs } from 'fs'
import { globSync } from '../../../../src/utils/glob'
import { expect } from 'chai'
import { extractionsParsers } from '../../../../src/extraction'

const babel = extractionsParsers.babel

describe('detections - babel', () => {
  before(async() => {
    await babel.load()
  })

  const files = globSync('../../../fixtures/vue/scripts/*.*', {
    cwd: __dirname,
    absolute: true,
  })

  for (const file of files) {
    const name = basename(file)

    it(name, async() => {
      const content = await fs.readFile(file, 'utf-8')
      const result = babel.detect(content)
      expect(result.map(i => i.text)).to.matchSnapshot()
    })
  }
})
