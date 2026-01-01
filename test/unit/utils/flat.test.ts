/* eslint-disable no-dupe-keys */
import { expect } from 'chai'
import { ROOT_KEY, unflatten } from '../../../src/utils/flat'

describe('utils', () => {
  describe('unflatten', () => {
    it('basic', () => {
      expect(unflatten({
        'a.b.c': 1,
        'a.b.d': 2,
      })).to.eql({
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      })
    })

    it('root', () => {
      expect(unflatten({
        '': 2,
        'a.b': 3,
        'a.b.c': 1,
      })).to.eql({
        [ROOT_KEY]: 2,
        a: { b: { c: 1, [ROOT_KEY]: 3 } },
      })
    })
  })
})
