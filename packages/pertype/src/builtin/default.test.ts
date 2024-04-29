import { BooleanCodec } from './default'

describe('Default Builtin', () => {
  describe('BooleanCodec', () => {
    const codec = new BooleanCodec()

    it('Decode falsy value must return false', () => {
      expect(codec.decode(null)).toBe(false)
      expect(codec.decode(undefined)).toBe(false)
      expect(codec.decode(false)).toBe(false)
      expect(codec.decode(NaN)).toBe(false)
      expect(codec.decode(0)).toBe(false)
      expect(codec.decode(-0)).toBe(false)
      expect(codec.decode('')).toBe(false)
    })

    it('Encode must return boolean', () => {
      expect(codec.encode(true)).toBe(true)
      expect(codec.encode(false)).toBe(false)
    })
  })
})
