import {
  Schema,
  _null,
  _undefined,
  any,
  array,
  bool,
  boolean,
  nullable,
  number,
  optional,
  string,
  union,
  unknown,
} from './schema'

describe('Schema', () => {
  function expectType<T>(_: T): void {}

  describe('BooleanSchema', () => {
    it('Should be compatible with Schema', () => {
      expectType<Schema>(boolean())
      expectType<Schema>(bool())
    })

    it('Should narrow boolean as boolean', () => {
      expect(boolean().is(true)).toBe(true)
      expect(boolean().is(false)).toBe(true)
      expect(boolean().is(0)).toBe(false)
      expect(boolean().is(1)).toBe(false)
      expect(boolean().is('true')).toBe(false)
      expect(boolean().is('false')).toBe(false)
    })
  })

  describe('NumberSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(number()))

    it('Should narrow number as number', () => {
      expect(number().is(0)).toBe(true)
      expect(number().is(255)).toBe(true)
      expect(number().is(-255)).toBe(true)
      expect(number().is(255.0)).toBe(true)
      expect(number().is(0xff)).toBe(true)
      expect(number().is(0b11111111)).toBe(true)
      expect(number().is(0.255e3)).toBe(true)
      expect(number().is(NaN)).toBe(true)
      expect(number().is(Infinity)).toBe(true)
      expect(number().is(-Infinity)).toBe(true)
      expect(number().is('0')).toBe(false)
      expect(number().is('3')).toBe(false)
    })

    it('Min constraint should limit its minimum value using greater or equal operator', () => {
      const validator = number().min(0)
      expect(validator.test(0)).toBe(true)
      expect(validator.test(0)).toBe(true)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(validator.test(-1)).toBe(false)
      expect(validator.test(Number.MIN_SAFE_INTEGER)).toBe(false)
    })

    it('Max constraint should limit its maximum value using less or equal operator', () => {
      const validator = number().max(0)
      expect(validator.test(0)).toBe(true)
      expect(validator.test(-1)).toBe(true)
      expect(validator.test(Number.MIN_SAFE_INTEGER)).toBe(true)
      expect(validator.test(1)).toBe(false)
      expect(validator.test(Number.MAX_SAFE_INTEGER)).toBe(false)
    })

    it('Greater constraint should check value using greater operator', () => {
      const validator = number().greater(0)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(-1)).toBe(false)
      expect(validator.test(Number.MIN_SAFE_INTEGER)).toBe(false)
    })

    it('Less constraint should check value using less operator', () => {
      const validator = number().less(0)
      expect(validator.test(-1)).toBe(true)
      expect(validator.test(Number.MIN_SAFE_INTEGER)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(false)
      expect(validator.test(Number.MAX_SAFE_INTEGER)).toBe(false)
    })

    it('Positive constraint should check for positive number', () => {
      const validator = number().positive()
      expect(validator.test(1)).toBe(true)
      expect(validator.test(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(-1)).toBe(false)
      expect(validator.test(Number.MIN_SAFE_INTEGER)).toBe(false)
    })

    it('Negative constraint should check for negative number', () => {
      const validator = number().negative()
      expect(validator.test(-1)).toBe(true)
      expect(validator.test(Number.MIN_SAFE_INTEGER)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(false)
      expect(validator.test(Number.MAX_SAFE_INTEGER)).toBe(false)
    })
  })

  describe('StringSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(string()))

    it('Should narrow string as string', () => {
      expect(string().is('Hello World')).toBe(true)
      expect(string().is('0')).toBe(true)
      expect(string().is('false')).toBe(true)
      expect(string().is(0)).toBe(false)
      expect(string().is(false)).toBe(false)
    })

    it('Length constraint should check string length to be equal with limit', () => {
      const validator = string().length(3)
      expect(validator.test('username')).toBe(false)
      expect(validator.test('use')).toBe(true)
      expect(validator.test('u')).toBe(false)
      expect(validator.test('')).toBe(false)
    })

    it('Min constraint should check minimum string length', () => {
      const validator = string().min(3)
      expect(validator.test('username')).toBe(true)
      expect(validator.test('use')).toBe(true)
      expect(validator.test('u')).toBe(false)
      expect(validator.test('')).toBe(false)
    })

    it('Max constraint should check maximum string length', () => {
      const validator = string().max(3)
      expect(validator.test('username')).toBe(false)
      expect(validator.test('use')).toBe(true)
      expect(validator.test('u')).toBe(true)
      expect(validator.test('')).toBe(true)
    })

    it('Not empty constraint should check if string empty or not', () => {
      const validator = string().notEmpty()
      expect(validator.test('username')).toBe(true)
      expect(validator.test('use')).toBe(true)
      expect(validator.test('u')).toBe(true)
      expect(validator.test('')).toBe(false)
    })

    it('Pattern constraint should check if string match the pattern', () => {
      const validator = string().pattern(/^[a-zA-Z0-9]+$/)
      expect(validator.test('UserName98543')).toBe(true)
      expect(validator.test('65891238912')).toBe(true)
      expect(validator.test('')).toBe(false)
      expect(validator.test('email@email')).toBe(false)
      expect(validator.test('user_name')).toBe(false)
    })
  })

  describe('NullSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(_null()))
  })

  describe('UndefinedSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(_undefined()))
  })

  describe('ArraySchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(array(unknown())))

    it('Should narrow array as array', () => {
      expect(array(unknown()).is([])).toBe(true)
      expect(array(unknown()).is([1, 2])).toBe(true)
      expect(array(unknown()).is([null])).toBe(true)
      expect(array(unknown()).is([undefined])).toBe(true)
      expect(array(unknown()).is(1)).toBe(false)
      expect(array(unknown()).is(null)).toBe(false)
      expect(array(unknown()).is(undefined)).toBe(false)
    })

    it('Length constraint should check if array length is equal to limit', () => {
      const validator = array(unknown()).length(2)
      expect(validator.test([0, 1, 2])).toBe(false)
      expect(validator.test([0, 1])).toBe(true)
      expect(validator.test([0])).toBe(false)
    })

    it('Min constraint should check minimum array length', () => {
      const validator = array(unknown()).min(2)
      expect(validator.test([0, 1, 2])).toBe(true)
      expect(validator.test([0, 1])).toBe(true)
      expect(validator.test([0])).toBe(false)
    })

    it('Max constraint should check maximum array length', () => {
      const validator = array(unknown()).max(2)
      expect(validator.test([0, 1, 2])).toBe(false)
      expect(validator.test([0, 1])).toBe(true)
      expect(validator.test([0])).toBe(true)
    })

    it('Should checks its inner schema constraints', () => {
      const validator = array(number().max(1))
      expect(validator.test([0])).toBe(true)
      expect(validator.test([0, 1])).toBe(true)
      expect(validator.test([0, 1, 2])).toBe(false)
    })
  })

  describe('NullableSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(nullable(unknown())))

    it('Should narrow as nullable type', () => {
      expect(nullable(number()).is(undefined)).toBe(false)
      expect(nullable(number()).is(null)).toBe(true)
      expect(nullable(number()).is(1)).toBe(true)
    })

    it('Should check its constraints', () => {
      const validator = nullable(number()).rule({
        type: 'test.min',
        test: (value) => (number().is(value) ? value >= 1 : true),
      })
      expect(validator.test(null)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(2)).toBe(true)
    })

    it('Should checks its inner schema constraints', () => {
      const validator = nullable(number().min(1))
      expect(validator.test(null)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(2)).toBe(true)
    })
  })

  describe('OptionalSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(optional(unknown())))

    it('Should narrow as optional type', () => {
      expect(optional(number()).is(undefined)).toBe(true)
      expect(optional(number()).is(null)).toBe(false)
      expect(optional(number()).is(1)).toBe(true)
    })

    it('Should check its constraints', () => {
      const validator = optional(number()).rule({
        type: 'test.min',
        test: (value) => (number().is(value) ? value >= 1 : true),
      })
      expect(validator.test(undefined)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(2)).toBe(true)
    })

    it('Should checks its inner schema constraints', () => {
      const validator = optional(number().min(1))
      expect(validator.test(undefined)).toBe(true)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(2)).toBe(true)
    })
  })

  describe('AnySchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(any()))
  })

  describe('UnknownSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(unknown()))
  })

  describe('UnionSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(union(string(), number())))

    it('Should narrow as union type', () => {
      expect(union(string(), number()).is('0')).toBe(true)
      expect(union(string(), number()).is(0)).toBe(true)
      expect(union(string(), number()).is(null)).toBe(false)
      expect(union(string(), number()).is(undefined)).toBe(false)
    })

    it('Should check its constraints', () => {
      const validator = union(string(), number()).rule({
        type: 'test.size',
        test: (value) => (string().is(value) ? value.length === 1 : value >= 1),
      })
      expect(validator.test('')).toBe(false)
      expect(validator.test('1')).toBe(true)
      expect(validator.test('12')).toBe(false)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(2)).toBe(true)
    })

    it('Should checks its inner schema constraints', () => {
      const validator = union(string().length(1), number().min(1))
      expect(validator.test('')).toBe(false)
      expect(validator.test('1')).toBe(true)
      expect(validator.test('12')).toBe(false)
      expect(validator.test(0)).toBe(false)
      expect(validator.test(1)).toBe(true)
      expect(validator.test(2)).toBe(true)
    })
  })
})
