import { ExtractionRule, ExtractionScore } from './base'

export class NonAsciiExtractionRule extends ExtractionRule {
  name = 'non-ascii-characters'

  shouldExtract(str: string) {
    // [^\u0000-\u007F] -- non Latin script,see https://unicode.org/reports/tr18/#General_Category_Property
    const words = str.match(/\p{Letter}*/gu) ?? []
    const containsWordWithNonAsciiChar = words.some(word => word.match(/[^\u0000-\u007F]/u))

    if (containsWordWithNonAsciiChar) return ExtractionScore.MustInclude
  }
}
