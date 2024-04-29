import {
  BooleanCodec,
  DateCodec,
  LiteralCodec,
  NumberCodec,
  StringCodec,
  SymbolCodec,
} from './default'

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

  describe('NumberCodec', () => {
    const codec = new NumberCodec()

    it('Decode number must return number', () => {
      expect(codec.decode(0)).toBe(0)
      expect(codec.decode(-0)).toBe(-0)
      expect(codec.decode(1)).toBe(1)
      expect(codec.decode(-1)).toBe(-1)
      expect(codec.decode(Infinity)).toBe(Infinity)
      expect(codec.decode(-Infinity)).toBe(-Infinity)
      expect(codec.decode(NaN)).toBeNaN()
      expect(codec.decode(-NaN)).toBeNaN()
    })

    it('Decode string with valid number value must return number', () => {
      expect(codec.decode('0')).toBe(0)
      expect(codec.decode('-0')).toBe(-0)
      expect(codec.decode('1')).toBe(1)
      expect(codec.decode('-1')).toBe(-1)
      expect(codec.decode('Infinity')).toBe(Infinity)
      expect(codec.decode('-Infinity')).toBe(-Infinity)
      expect(codec.decode('NaN')).toBeNaN()
      expect(codec.decode('-NaN')).toBeNaN()
    })

    it('Decode falsy value must return 0 number', () => {
      expect(codec.decode('')).toBe(0)
      expect(codec.decode(false)).toBe(0)
      expect(codec.decode(null)).toBe(0)
      expect(codec.decode(undefined)).toBe(0)
    })

    it('Decode non-number must return NaN', () => {
      expect(codec.decode('Hello')).toBeNaN()
    })
  })

  describe('StringCodec', () => {
    const codec = new StringCodec()

    it('Decode must return string', () => {
      expect(typeof codec.decode('HELLO')).toBe('string')
      expect(typeof codec.decode(0)).toBe('string')
      expect(typeof codec.decode(false)).toBe('string')
      expect(typeof codec.decode(null)).toBe('string')
      expect(typeof codec.decode(undefined)).toBe('string')
    })

    it('Decode null or undefined must be empty string', () => {
      expect(codec.decode(null)).toBe('')
      expect(codec.decode(undefined)).toBe('')
    })

    it('Encode must return string', () => {
      expect(typeof codec.encode('HELLO')).toBe('string')
    })
  })

  describe('DateCodec', () => {
    const codec = new DateCodec()

    it('Decoding a date should return date', () => {
      expect(codec.decode(new Date())).toBeInstanceOf(Date)
    })

    it('Decoding a string should return a date if valid or throw', () => {
      expect(codec.decode('2023-05-23T23:59:59.999Z')).toBeInstanceOf(Date)
      expect(() => codec.decode('Hello')).toThrow()
    })

    it('Decoding an unknown value should throw', () => {
      expect(() => codec.decode(90)).toThrow()
    })

    it('Encoding should return ISO string date', () => {
      expect(typeof codec.encode(new Date())).toBe('string')
    })
  })

  describe('SymbolCodec', () => {
    const codec = new SymbolCodec()

    it('Decoding a string should return symbol', () => {
      expect(typeof codec.decode('hello')).toBe('symbol')
    })

    it('Decoding a number should return symbol', () => {
      expect(typeof codec.decode(1)).toBe('symbol')
    })

    it('Decoding an undefined should return symbol', () => {
      expect(typeof codec.decode(undefined)).toBe('symbol')
    })

    it('Encoding should return its description', () => {
      expect(codec.encode(Symbol('for'))).toBe('for')
    })
  })

  describe('LiteralCodec', () => {
    describe('String literal', () => {
      const codec = new LiteralCodec('Hello')
      it('Decoding string literal should return the literal or throw otherwise', () => {
        expect(codec.decode('Hello')).toBe('Hello')
        expect(() => codec.decode(0)).toThrow()
      })
      it('Encoding string literal should return the literal', () => {
        expect(codec.encode('Hello')).toBe('Hello')
      })
    })

    describe('Number literal', () => {
      const codec = new LiteralCodec(0)
      it('Decoding number literal should return the literal or throw otherwise', () => {
        expect(codec.decode(0)).toBe(0)
        expect(() => codec.decode('Hello')).toThrow()
      })
      it('Encoding number literal should return the literal', () => {
        expect(codec.encode(0)).toBe(0)
      })
    })

    describe('Boolean literal', () => {
      const codec = new LiteralCodec(true)
      it('Decoding boolean literal should return the literal or throw otherwise', () => {
        expect(codec.decode(true)).toBe(true)
        expect(() => codec.decode(0)).toThrow()
      })
      it('Encoding boolean literal should return the literal', () => {
        expect(codec.encode(true)).toBe(true)
      })
    })
  })
})
