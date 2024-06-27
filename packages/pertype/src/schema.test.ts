import { describe, expect, it } from 'bun:test'
import {
  Schema,
  _null,
  _undefined,
  any,
  array,
  bigint,
  bool,
  boolean,
  date,
  intersect,
  literal,
  map,
  nullable,
  number,
  object,
  optional,
  set,
  string,
  symbol,
  tuple,
  type,
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

    it('Should decode falsy value as false', () => {
      expect(boolean().decode(null)).toBe(false)
      expect(boolean().decode(undefined)).toBe(false)
      expect(boolean().decode(false)).toBe(false)
      expect(boolean().decode(NaN)).toBe(false)
      expect(boolean().decode(0)).toBe(false)
      expect(boolean().decode(-0)).toBe(false)
      expect(boolean().decode('')).toBe(false)
    })

    it('Should encode boolean as boolean', () => {
      expect(boolean().encode(true)).toBe(true)
      expect(boolean().encode(false)).toBe(false)
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

    it('Should decode number as number', () => {
      expect(number().decode(0)).toBe(0)
      expect(number().decode(-0)).toBe(-0)
      expect(number().decode(1)).toBe(1)
      expect(number().decode(-1)).toBe(-1)
      expect(number().decode(Infinity)).toBe(Infinity)
      expect(number().decode(-Infinity)).toBe(-Infinity)
      expect(number().decode(NaN)).toBeNaN()
      expect(number().decode(-NaN)).toBeNaN()
    })

    it('Should decode number string as number', () => {
      expect(number().decode('0')).toBe(0)
      expect(number().decode('-0')).toBe(-0)
      expect(number().decode('1')).toBe(1)
      expect(number().decode('-1')).toBe(-1)
      expect(number().decode('Infinity')).toBe(Infinity)
      expect(number().decode('-Infinity')).toBe(-Infinity)
      expect(number().decode('NaN')).toBeNaN()
      expect(number().decode('-NaN')).toBeNaN()
    })

    it('Should decode falsy non-number value as 0 number', () => {
      expect(number().decode('')).toBe(0)
      expect(number().decode(false)).toBe(0)
      expect(number().decode(null)).toBe(0)
      expect(number().decode(undefined)).toBe(0)
    })

    it('Should decode non-number string as NaN', () => {
      expect(number().decode('Hello')).toBeNaN()
    })

    it('Should encode number as number', () => {
      expect(number().encode(0)).toBe(0)
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

  describe('BigIntSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(bigint()))

    it('Should narrow bigint as bigint', () => {
      expect(bigint().is(0n)).toBe(true)
      expect(bigint().is(255n)).toBe(true)
      expect(bigint().is(-255n)).toBe(true)
      expect(bigint().is(0xffn)).toBe(true)
      expect(bigint().is(0b11111111n)).toBe(true)
      expect(bigint().is('0')).toBe(false)
      expect(bigint().is('3')).toBe(false)
    })

    it('Should decode number as bigint', () => {
      expect(bigint().decode(0)).toBe(0n)
      expect(bigint().decode(-0)).toBe(-0n)
      expect(bigint().decode(1)).toBe(1n)
      expect(bigint().decode(-1)).toBe(-1n)
    })

    it('Should decode bigint string as bigint', () => {
      expect(bigint().decode('0')).toBe(0n)
      expect(bigint().decode('-0')).toBe(-0n)
      expect(bigint().decode('1')).toBe(1n)
      expect(bigint().decode('-1')).toBe(-1n)
    })

    it('Should decode falsy non-bigint value as 0 bigint', () => {
      expect(bigint().decode(false)).toBe(0n)
      expect(bigint().decode(null)).toBe(0n)
      expect(bigint().decode(undefined)).toBe(0n)
      expect(bigint().decode(0)).toBe(0n)
      expect(bigint().decode(-0)).toBe(0n)
      expect(bigint().decode(0n)).toBe(0n)
      expect(bigint().decode(NaN)).toBe(0n)
      expect(bigint().decode('')).toBe(0n)
    })

    it('Should decode non-bigint string as throw', () => {
      expect(() => bigint().decode('Hello')).toThrow()
    })

    it('Should encode bigint as bigint', () => {
      expect(bigint().encode(0n)).toBe('0')
    })

    it('Min constraint should limit its minimum value using greater or equal operator', () => {
      const validator = bigint().min(0n)
      expect(validator.test(0n)).toBe(true)
      expect(validator.test(0n)).toBe(true)
      expect(validator.test(1n)).toBe(true)
      expect(validator.test(-1n)).toBe(false)
    })

    it('Max constraint should limit its maximum value using less or equal operator', () => {
      const validator = bigint().max(0n)
      expect(validator.test(0n)).toBe(true)
      expect(validator.test(-1n)).toBe(true)
      expect(validator.test(1n)).toBe(false)
    })

    it('Greater constraint should check value using greater operator', () => {
      const validator = bigint().greater(0n)
      expect(validator.test(1n)).toBe(true)
      expect(validator.test(0n)).toBe(false)
      expect(validator.test(-1n)).toBe(false)
    })

    it('Less constraint should check value using less operator', () => {
      const validator = bigint().less(0n)
      expect(validator.test(-1n)).toBe(true)
      expect(validator.test(0n)).toBe(false)
      expect(validator.test(1n)).toBe(false)
    })

    it('Positive constraint should check for positive number', () => {
      const validator = bigint().positive()
      expect(validator.test(1n)).toBe(true)
      expect(validator.test(0n)).toBe(false)
      expect(validator.test(-1n)).toBe(false)
    })

    it('Negative constraint should check for negative number', () => {
      const validator = bigint().negative()
      expect(validator.test(-1n)).toBe(true)
      expect(validator.test(0n)).toBe(false)
      expect(validator.test(1n)).toBe(false)
    })
  })

  describe('DateSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(date()))

    it('Should narrow date as date', () => {
      expect(date().is(new Date())).toBe(true)
    })

    it('Should decode date as date', () =>
      expect(date().decode(new Date())).toBeInstanceOf(Date))

    it('Should decode valid date string to date', () =>
      expect(date().decode('2023-05-23T23:59:59.999Z')).toBeInstanceOf(Date))

    it('Should encode date as ISO string date', () =>
      expect(typeof date().encode(new Date())).toBe('string'))

    it('Min constraint should limit its minimum value using greater or equal operator', () => {
      const validator = date().min(new Date(2024, 1, 5))
      expect(validator.test(new Date(2024, 1, 6))).toBe(true)
      expect(validator.test(new Date(2024, 1, 5))).toBe(true)
      expect(validator.test(new Date(2024, 1, 4))).toBe(false)
    })

    it('Max constraint should limit its maximum value using less or equal operator', () => {
      const validator = date().max(new Date(2024, 1, 5))
      expect(validator.test(new Date(2024, 1, 4))).toBe(true)
      expect(validator.test(new Date(2024, 1, 5))).toBe(true)
      expect(validator.test(new Date(2024, 1, 6))).toBe(false)
    })

    it('Greater constraint should check value using greater operator', () => {
      const validator = date().greater(new Date(2024, 1, 5))
      expect(validator.test(new Date(2024, 1, 6))).toBe(true)
      expect(validator.test(new Date(2024, 1, 5))).toBe(false)
      expect(validator.test(new Date(2024, 1, 4))).toBe(false)
    })

    it('Less constraint should check value using less operator', () => {
      const validator = date().less(new Date(2024, 1, 5))
      expect(validator.test(new Date(2024, 1, 4))).toBe(true)
      expect(validator.test(new Date(2024, 1, 5))).toBe(false)
      expect(validator.test(new Date(2024, 1, 6))).toBe(false)
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

    it('Should decode string as string', () =>
      expect(string().decode('string')).toBe('string'))

    it('Should decode number as string', () => {
      expect(string().decode(0)).toBe('0')
      expect(string().decode(-0)).toBe('0')
      expect(string().decode(Infinity)).toBe('Infinity')
      expect(string().decode(-Infinity)).toBe('-Infinity')
    })

    it('Should decode null as empty string', () =>
      expect(string().decode(null)).toBe(''))

    it('Should decode undefined as empty string', () =>
      expect(string().decode(undefined)).toBe(''))

    it('Should encode string as string', () =>
      expect(string().encode('string')).toBe('string'))

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

    it('Should decode string as symbol', () =>
      expect(typeof symbol().decode('hello')).toBe('symbol'))

    it('Should decode number as symbol', () =>
      expect(typeof symbol().decode(1)).toBe('symbol'))

    it('Should decode undefined as symbol', () =>
      expect(typeof symbol().decode(undefined)).toBe('symbol'))

    it('Should encode symbol as its description', () =>
      expect(symbol().encode(Symbol('for'))).toBe('for'))

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

    describe('String literal', () => {
      const schema = literal('string')

      it('Should decode string literal as string literal', () =>
        expect(schema.decode('string')).toBe('string'))

      it('Should encode string literal as string literal', () =>
        expect(schema.encode('string')).toBe('string'))
    })

    describe('Number literal', () => {
      const schema = literal(0)

      it('Should decode string literal as string literal', () =>
        expect(schema.decode(0)).toBe(0))

      it('Should encode string literal as string literal', () =>
        expect(schema.encode(0)).toBe(0))
    })

    describe('Boolean literal', () => {
      const schema = literal(true)

      it('Should decode string literal as string literal', () =>
        expect(schema.decode(true)).toBe(true))

      it('Should encode string literal as string literal', () =>
        expect(schema.encode(true)).toBe(true))
    })
  })

  describe('ArraySchema', () => {
    it('Should be compatible with Schema', () => {
      expectType<Schema>(array(unknown()))
      expectType<Schema>(unknown().array())
    })

    it('Should narrow array as array', () => {
      expect(array(unknown()).is([])).toBe(true)
      expect(array(unknown()).is([1, 2])).toBe(true)
      expect(array(unknown()).is([null])).toBe(true)
      expect(array(unknown()).is([undefined])).toBe(true)
      expect(array(unknown()).is(1)).toBe(false)
      expect(array(unknown()).is(null)).toBe(false)
      expect(array(unknown()).is(undefined)).toBe(false)
    })

    it('Should decode an array as array with its element decoded', () =>
      expect(string().array().decode([1, 2, 3])).toStrictEqual(['1', '2', '3']))

    it('Should decode non-array as array that have one decoded value', () =>
      expect(string().array().decode(1)).toStrictEqual(['1']))

    it('Should decode null as empty array', () =>
      expect(string().array().decode(null)).toStrictEqual([]))

    it('Should decode undefined as empty array', () =>
      expect(string().array().decode(undefined)).toStrictEqual([]))

    it('Should encode array as an array with its element encoded', () =>
      expect(string().array().encode(['0', '1', '2', '3', '4'])).toStrictEqual([
        '0',
        '1',
        '2',
        '3',
        '4',
      ]))

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

    it('Should decode an array of elements as map with decoded value as key', () => {
      const result = map(string(), number()).decode([1, 2, 3])
      expect(result.size).toBe(3)
      expect(result.has('1')).toBe(true)
      expect(result.has('2')).toBe(true)
      expect(result.has('3')).toBe(true)
    })

    it('Should decode an array of key-value pairs as map with its key and value decoded', () => {
      const result = map(string(), number()).decode([
        [1, 11],
        [2, 22],
        [3, 33],
      ])
      expect(result.size).toBe(3)
      expect(result.has('1')).toBe(true)
      expect(result.has('2')).toBe(true)
      expect(result.has('3')).toBe(true)
      expect(result.get('1')).toBe(11)
      expect(result.get('2')).toBe(22)
      expect(result.get('3')).toBe(33)
    })

    it('Should decode object as map with its key and value decoded', () => {
      const result = map(string(), number()).decode({
        '1': 11,
        '2': 22,
        '3': 33,
      })
      expect(result.size).toBe(3)
      expect(result.has('1')).toBe(true)
      expect(result.has('2')).toBe(true)
      expect(result.has('3')).toBe(true)
      expect(result.get('1')).toBe(11)
      expect(result.get('2')).toBe(22)
      expect(result.get('3')).toBe(33)
    })

    it('Should decode map as map with its key and value decoded', () => {
      const result = map(string(), number()).decode(
        new Map([
          [1, 11],
          [2, 22],
          [3, 33],
        ]),
      )
      expect(result.size).toBe(3)
      expect(result.has('1')).toBe(true)
      expect(result.has('2')).toBe(true)
      expect(result.has('3')).toBe(true)
      expect(result.get('1')).toBe(11)
      expect(result.get('2')).toBe(22)
      expect(result.get('3')).toBe(33)
    })

    it('Should encode map as object with its key and value encoded', () => {
      const result = map(string(), number()).encode(
        new Map([
          ['1', 11],
          ['2', 22],
          ['3', 33],
        ]),
      )
      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('1', 11)
      expect(result).toHaveProperty('2', 22)
      expect(result).toHaveProperty('3', 33)
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

  describe('SetSchema', () => {
    it('Should be compatible with Schema', () => {
      expectType<Schema>(set(unknown()))
    })

    it('Should narrow map as map type', () => {
      expect(set(number()).is(new Set([0, 1, 2]))).toBe(true)
    })

    it('Should decode array as set with its elements decoded', () => {
      const result = set(number()).decode([1, 2, 3, 1])
      expect(result.size).toBe(3)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('Should encode set as array with its elements encoded', () => {
      const result = set(number()).encode(new Set([1, 2, 3]))
      expect(Array.isArray(result)).toBe(true)
      if (Array.isArray(result)) {
        expect(result.length).toBe(3)
        expect(result[0]).toBe(1)
        expect(result[1]).toBe(2)
        expect(result[2]).toBe(3)
      }
    })

    it('Size constraint should check if map size is equal to limit', () => {
      const validator = set(number()).size(2)
      expect(validator.test(new Set([0]))).toBe(false)
      expect(validator.test(new Set([0, 1]))).toBe(true)
      expect(validator.test(new Set([0, 1, 2]))).toBe(false)
    })

    it('Should check its inner schema constraints', () => {
      const validator = set(number().min(1))
      expect(validator.test(new Set([2]))).toBe(true)
      expect(validator.test(new Set([1, 2]))).toBe(true)
      expect(validator.test(new Set([0, 1, 2]))).toBe(false)
    })
  })

  describe('NullableSchema', () => {
    it('Should be compatible with Schema', () => {
      expectType<Schema>(nullable(unknown()))
      expectType<Schema>(unknown().nullable())
    })

    it('Should narrow as nullable type', () => {
      expect(nullable(number()).is(undefined)).toBe(false)
      expect(nullable(number()).is(null)).toBe(true)
      expect(nullable(number()).is(1)).toBe(true)
    })

    it('Should decode null as null', () =>
      expect(string().nullable().decode(null)).toBe(null))

    it('Should decode non-null as non-null', () =>
      expect(string().nullable().decode(1)).toBe('1'))

    it('Should encode null as null', () =>
      expect(string().nullable().encode(null)).toBe(null))

    it('Should encode non-null as non-null', () =>
      expect(string().nullable().encode('1')).toBe('1'))

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
    it('Should be compatible with Schema', () => {
      expectType<Schema>(optional(unknown()))
      expectType<Schema>(unknown().optional())
    })

    it('Should narrow as optional type', () => {
      expect(optional(number()).is(undefined)).toBe(true)
      expect(optional(number()).is(null)).toBe(false)
      expect(optional(number()).is(1)).toBe(true)
    })

    it('Should decode undefined as undefined', () =>
      expect(string().optional().decode(undefined)).toBeUndefined())

    it('Should decode non-undefined as defined', () =>
      expect(string().optional().decode(1)).toBe('1'))

    it('Should encode undefined as undefined', () =>
      expect(string().optional().encode(undefined)).toBeUndefined())

    it('Should encode non-undefined as defined', () =>
      expect(string().optional().encode('1')).toBe('1'))

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

    it('Should decode array as tuple with each item decoded', () =>
      expect(tuple(string(), number()).decode([1, 2])).toStrictEqual(['1', 2]))

    it('Should decode excess array as tuple by removing excess items', () =>
      expect(tuple(string(), number()).decode([1, 2, 3, 4])).toStrictEqual([
        '1',
        2,
      ]))

    it('Should encode tuple as array', () =>
      expect(tuple(string(), number()).encode(['1', 2])).toStrictEqual([
        '1',
        2,
      ]))

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

    it('Should decode the elements based on the order schema declaration', () => {
      expect(union(number(), string()).decode(1)).toBe(1)
      expect(union(number(), string()).decode('hello')).toBe('hello')
    })

    it('Should encode the elements based on the order of schema declaration', () => {
      expect(union(number(), string()).encode(1)).toBe(1)
      expect(union(number(), string()).encode('hello')).toBe('hello')
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

    it('Should decode an intersect as intersect', () =>
      expect(
        intersect(object({ id: number() }), object({ name: string() })).decode({
          id: '1',
          name: 'Adam',
        }),
      ).toStrictEqual({
        id: 1,
        name: 'Adam',
      }))

    it('Should encode an intersect as intersect', () =>
      expect(
        intersect(object({ id: number() }), object({ name: string() })).encode({
          id: 1,
          name: 'Adam',
        }),
      ).toStrictEqual({
        id: 1,
        name: 'Adam',
      }))

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

    it('Should decode object as object', () =>
      expect(
        object({
          id: number(),
          name: string(),
        }).decode({ id: '1', name: 'Adam' }),
      ).toStrictEqual({
        id: 1,
        name: 'Adam',
      }))

    it('Should encode object as object', () =>
      expect(
        object({
          id: number(),
          name: string(),
        }).encode({ id: 1, name: 'Adam' }),
      ).toStrictEqual({
        id: 1,
        name: 'Adam',
      }))

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

  describe('TypeSchema', () => {
    class User {
      public constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly active: boolean,
      ) {}
    }

    it('Should be compatible with Schema', () => expectType<Schema>(type(User)))

    it('Should narrow object class as object class', () => {
      const schema = type(User)
      expect(schema.is(new User(1, 'Adam', true))).toBe(true)
      expect(schema.is({ id: 1, name: 'Adam', active: true })).toBe(false)
    })
  })
})
