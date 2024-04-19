import {
  Schema,
  _null,
  _undefined,
  any,
  array,
  bool,
  boolean,
  intersect,
  literal,
  map,
  nullable,
  number,
  object,
  optional,
  string,
  symbol,
  tuple,
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

  describe('SymbolSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(symbol()))

    it('Should narrow symbol as symbol', () => {
      expect(symbol().is(Symbol.for('for'))).toBe(true)
      expect(symbol().is(Symbol('for'))).toBe(true)
    })

    it('Instance Of constraint should check its symbol equality', () => {
      expect(
        symbol().instanceOf(Symbol.for('for')).test(Symbol.for('for')),
      ).toBe(true)
      expect(symbol().instanceOf(Symbol.for('for')).test(Symbol('for'))).toBe(
        false,
      )
      expect(symbol().instanceOf(Symbol('for')).test(Symbol.for('for'))).toBe(
        false,
      )
      expect(symbol().instanceOf(Symbol('for')).test(Symbol('for'))).toBe(false)
    })
  })

  describe('NullSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(_null()))
  })

  describe('UndefinedSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(_undefined()))
  })

  describe('ObjectSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(
        object({
          _string: string(),
          _number: number(),
        }),
      ))

    it('Should narrow object as object', () => {
      const schema = object({
        _string: string(),
        _number: number(),
      })
      expect(schema.is({ _string: '', _number: 0 })).toBe(true)
      expect(schema.is({ _string: '' })).toBe(false)
      expect(schema.is({ _number: 0 })).toBe(false)
      expect(schema.is({})).toBe(false)
      expect(schema.is(null)).toBe(false)
      expect(schema.is(undefined)).toBe(false)
    })

    it('Should check its constraint', () => {
      const schema = object({
        _string: string(),
        _number: number(),
      }).rule({
        type: 'property.length',
        test: (value) => value._string.length === 1 && value._number >= 1,
      })
      expect(schema.test({ _string: '', _number: 0 })).toBe(false)
      expect(schema.test({ _string: '', _number: 1 })).toBe(false)
      expect(schema.test({ _string: '', _number: 2 })).toBe(false)
      expect(schema.test({ _string: '1', _number: 0 })).toBe(false)
      expect(schema.test({ _string: '1', _number: 1 })).toBe(true)
      expect(schema.test({ _string: '1', _number: 2 })).toBe(true)
      expect(schema.test({ _string: '12', _number: 0 })).toBe(false)
      expect(schema.test({ _string: '12', _number: 1 })).toBe(false)
      expect(schema.test({ _string: '12', _number: 2 })).toBe(false)
    })

    it('Should checks its inner schema constraints', () => {
      const schema = object({
        _string: string().length(1),
        _number: number().min(1),
      })
      expect(schema.test({ _string: '', _number: 0 })).toBe(false)
      expect(schema.test({ _string: '', _number: 1 })).toBe(false)
      expect(schema.test({ _string: '', _number: 2 })).toBe(false)
      expect(schema.test({ _string: '1', _number: 0 })).toBe(false)
      expect(schema.test({ _string: '1', _number: 1 })).toBe(true)
      expect(schema.test({ _string: '1', _number: 2 })).toBe(true)
      expect(schema.test({ _string: '12', _number: 0 })).toBe(false)
      expect(schema.test({ _string: '12', _number: 1 })).toBe(false)
      expect(schema.test({ _string: '12', _number: 2 })).toBe(false)
    })
  })

  describe('AnySchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(any()))
  })

  describe('UnknownSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(unknown()))
  })

  describe('LiteralSchema', () => {
    it('Should be compatible with Schema', () => {
      expectType<Schema>(literal('value'))
      expectType<Schema>(literal(1))
      expectType<Schema>(literal(true))
    })

    it('Should narrow literal as literal', () => {
      expect(literal('value').is('value')).toBe(true)
      expect(literal('value').is(1)).toBe(false)
      expect(literal('value').is(true)).toBe(false)
      expect(literal(1).is('value')).toBe(false)
      expect(literal(1).is(1)).toBe(true)
      expect(literal(1).is(true)).toBe(false)
      expect(literal(true).is('value')).toBe(false)
      expect(literal(true).is(1)).toBe(false)
      expect(literal(true).is(true)).toBe(true)
    })
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

  describe('MapSchema', () => {
    it('Should be compatible with Schema', () => {
      expectType<Schema>(map(string(), unknown()))
      expectType<Schema>(map(number(), unknown()))
      expectType<Schema>(map(symbol(), unknown()))
    })

    it('Should narrow map as map type', () => {
      expect(map(string(), string()).is(new Map([['key', 'value']]))).toBe(true)
      expect(map(string(), string()).is(new Map([[0, 'value']]))).toBe(false)
      expect(
        map(string(), string()).is(new Map([[Symbol.for('for'), 'value']])),
      ).toBe(false)
      expect(map(number(), string()).is(new Map([['key', 'value']]))).toBe(
        false,
      )
      expect(map(number(), string()).is(new Map([[0, 'value']]))).toBe(true)
      expect(
        map(number(), string()).is(new Map([[Symbol.for('for'), 'value']])),
      ).toBe(false)
      expect(map(symbol(), string()).is(new Map([['key', 'value']]))).toBe(
        false,
      )
      expect(map(symbol(), string()).is(new Map([[0, 'value']]))).toBe(false)
      expect(
        map(symbol(), string()).is(new Map([[Symbol.for('for'), 'value']])),
      ).toBe(true)
    })

    it('Size constraint should check if map size is equal to limit', () => {
      const validator = map(string(), number()).size(1)
      expect(validator.test(new Map())).toBe(false)
      expect(validator.test(new Map([['1', 1]]))).toBe(true)
      expect(
        validator.test(
          new Map([
            ['1', 1],
            ['0', 0],
          ]),
        ),
      ).toBe(false)
    })

    it('Should check its inner schema constraints', () => {
      const validator = map(string().length(1), number().min(1))
      expect(validator.test(new Map([['12', 1]]))).toBe(false)
      expect(validator.test(new Map([['12', 0]]))).toBe(false)
      expect(validator.test(new Map([['1', 1]]))).toBe(true)
      expect(validator.test(new Map([['1', 0]]))).toBe(false)
      expect(validator.test(new Map([['', 1]]))).toBe(false)
      expect(validator.test(new Map([['', 0]]))).toBe(false)
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

  describe('TupleSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(tuple(string(), number(), boolean())))

    it('Should narrow as tuple type', () => {
      expect(tuple(string(), number(), boolean()).is(['', 0, false])).toBe(true)
      expect(tuple(string(), number(), boolean()).is(['', 0])).toBe(false)
      expect(tuple(string(), number(), boolean()).is([''])).toBe(false)
      expect(tuple(string(), number(), boolean()).is('')).toBe(false)
      expect(tuple(string(), number(), boolean()).is(null)).toBe(false)
      expect(tuple(string(), number(), boolean()).is(undefined)).toBe(false)
    })

    it('Should check its constraint', () => {
      const validator = tuple(string(), number()).rule({
        type: 'test.size',
        test: (value) => value[0].length === 1 && value[1] >= 1,
      })
      expect(validator.test(['', 0])).toBe(false)
      expect(validator.test(['', 1])).toBe(false)
      expect(validator.test(['', 2])).toBe(false)
      expect(validator.test(['1', 0])).toBe(false)
      expect(validator.test(['1', 1])).toBe(true)
      expect(validator.test(['1', 2])).toBe(true)
      expect(validator.test(['12', 0])).toBe(false)
      expect(validator.test(['12', 1])).toBe(false)
      expect(validator.test(['12', 2])).toBe(false)
    })

    it('Should checks its inner schema constraints', () => {
      const validator = tuple(string().length(1), number().min(1))
      expect(validator.test(['', 0])).toBe(false)
      expect(validator.test(['', 1])).toBe(false)
      expect(validator.test(['', 2])).toBe(false)
      expect(validator.test(['1', 0])).toBe(false)
      expect(validator.test(['1', 1])).toBe(true)
      expect(validator.test(['1', 2])).toBe(true)
      expect(validator.test(['12', 0])).toBe(false)
      expect(validator.test(['12', 1])).toBe(false)
      expect(validator.test(['12', 2])).toBe(false)
    })
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

  describe('IntersectSchema', () => {
    it('Should be compatible with Schema', () =>
      expectType<Schema>(
        intersect(object({ _string: string() }), object({ _number: number() })),
      ))

    it('Should be compatible with Schema', () => {
      const schema = intersect(
        object({ _string: string() }),
        object({ _number: number() }),
      )
      expect(schema.is({ _string: 'string', _number: 1 })).toBe(true)
      expect(schema.is({ value: 1 })).toBe(false)
      expect(schema.is({ _string: 'string' })).toBe(false)
    })

    it('Should checks its constraints', () => {
      const validator = intersect(
        object({ _string: string() }),
        object({ _number: number() }),
      ).rule({
        type: 'test.min',
        test: (value) => value._string.length === 1 && value._number >= 1,
      })
      expect(validator.test({ _string: '1', _number: 1 })).toBe(true)
      expect(validator.test({ _string: '1', _number: 0 })).toBe(false)
      expect(validator.test({ _string: '', _number: 1 })).toBe(false)
      expect(validator.test({ _string: '', _number: 0 })).toBe(false)
    })

    it('Should checks its inner schema constraints', () => {
      const validator = intersect(
        object({ _string: string().length(1) }),
        object({ _number: number().min(1) }),
      )
      expect(validator.test({ _string: '1', _number: 1 })).toBe(true)
      expect(validator.test({ _string: '1', _number: 0 })).toBe(false)
      expect(validator.test({ _string: '', _number: 1 })).toBe(false)
      expect(validator.test({ _string: '', _number: 0 })).toBe(false)
    })
  })
})
