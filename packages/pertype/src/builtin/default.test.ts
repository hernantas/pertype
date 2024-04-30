import {
  boolean,
  date,
  literal,
  map,
  number,
  object,
  set,
  string,
  symbol,
  tuple,
  union,
} from '../schema'
import {
  ArrayCodec,
  BooleanCodec,
  DateCodec,
  LiteralCodec,
  MapCodec,
  NullableCodec,
  NumberCodec,
  ObjectCodec,
  OptionalCodec,
  SetCodec,
  StringCodec,
  SymbolCodec,
  TupleCodec,
  UnionCodec,
} from './default'

describe('Default Builtin', () => {
  describe('BooleanCodec', () => {
    const codec = new BooleanCodec(boolean())

    it('Should decode falsy value as false', () => {
      expect(codec.decode(null)).toBe(false)
      expect(codec.decode(undefined)).toBe(false)
      expect(codec.decode(false)).toBe(false)
      expect(codec.decode(NaN)).toBe(false)
      expect(codec.decode(0)).toBe(false)
      expect(codec.decode(-0)).toBe(false)
      expect(codec.decode('')).toBe(false)
    })

    it('Should encode boolean as boolean', () => {
      expect(codec.encode(true)).toBe(true)
      expect(codec.encode(false)).toBe(false)
    })
  })

  describe('NumberCodec', () => {
    const codec = new NumberCodec(number())

    it('Should decode number as number', () => {
      expect(codec.decode(0)).toBe(0)
      expect(codec.decode(-0)).toBe(-0)
      expect(codec.decode(1)).toBe(1)
      expect(codec.decode(-1)).toBe(-1)
      expect(codec.decode(Infinity)).toBe(Infinity)
      expect(codec.decode(-Infinity)).toBe(-Infinity)
      expect(codec.decode(NaN)).toBeNaN()
      expect(codec.decode(-NaN)).toBeNaN()
    })

    it('Should decode number string as number', () => {
      expect(codec.decode('0')).toBe(0)
      expect(codec.decode('-0')).toBe(-0)
      expect(codec.decode('1')).toBe(1)
      expect(codec.decode('-1')).toBe(-1)
      expect(codec.decode('Infinity')).toBe(Infinity)
      expect(codec.decode('-Infinity')).toBe(-Infinity)
      expect(codec.decode('NaN')).toBeNaN()
      expect(codec.decode('-NaN')).toBeNaN()
    })

    it('Should decode falsy non-number value as 0 number', () => {
      expect(codec.decode('')).toBe(0)
      expect(codec.decode(false)).toBe(0)
      expect(codec.decode(null)).toBe(0)
      expect(codec.decode(undefined)).toBe(0)
    })

    it('Should decode non-number string as NaN', () => {
      expect(codec.decode('Hello')).toBeNaN()
    })

    it('Should encode number as number', () => {
      expect(codec.encode(0)).toBe(0)
    })
  })

  describe('StringCodec', () => {
    const codec = new StringCodec(string())

    it('Should decode string as string', () =>
      expect(codec.decode('string')).toBe('string'))

    it('Should decode number as string', () => {
      expect(codec.decode(0)).toBe('0')
      expect(codec.decode(-0)).toBe('0')
      expect(codec.decode(Infinity)).toBe('Infinity')
      expect(codec.decode(-Infinity)).toBe('-Infinity')
    })

    it('Should decode null as empty string', () =>
      expect(codec.decode(null)).toBe(''))

    it('Should decode undefined as empty string', () =>
      expect(codec.decode(undefined)).toBe(''))

    it('Should encode string as string', () =>
      expect(codec.encode('string')).toBe('string'))
  })

  describe('DateCodec', () => {
    const codec = new DateCodec(date())

    it('Should decode date as date', () =>
      expect(codec.decode(new Date())).toBeInstanceOf(Date))

    it('Should decode valid date string to date', () =>
      expect(codec.decode('2023-05-23T23:59:59.999Z')).toBeInstanceOf(Date))

    it('Should encode date as ISO string date', () => {
      expect(typeof codec.encode(new Date())).toBe('string')
    })
  })

  describe('SymbolCodec', () => {
    const codec = new SymbolCodec(symbol())

    it('Should decode string as symbol', () =>
      expect(typeof codec.decode('hello')).toBe('symbol'))

    it('Should decode number as symbol', () =>
      expect(typeof codec.decode(1)).toBe('symbol'))

    it('Should decode undefined as symbol', () =>
      expect(typeof codec.decode(undefined)).toBe('symbol'))

    it('Should encode symbol as its description', () => {
      expect(codec.encode(Symbol('for'))).toBe('for')
    })
  })

  describe('LiteralCodec', () => {
    describe('String literal', () => {
      const codec = new LiteralCodec(literal('string'), 'string')

      it('Should decode string literal as string literal', () =>
        expect(codec.decode('string')).toBe('string'))

      it('Should encode string literal as string literal', () =>
        expect(codec.encode('string')).toBe('string'))
    })

    describe('Number literal', () => {
      const codec = new LiteralCodec(literal(0), 0)

      it('Should decode string literal as string literal', () =>
        expect(codec.decode(0)).toBe(0))

      it('Should encode string literal as string literal', () =>
        expect(codec.encode(0)).toBe(0))
    })

    describe('Boolean literal', () => {
      const codec = new LiteralCodec(literal(true), true)

      it('Should decode string literal as string literal', () =>
        expect(codec.decode(true)).toBe(true))

      it('Should encode string literal as string literal', () =>
        expect(codec.encode(true)).toBe(true))
    })
  })

  describe('ArrayCodec', () => {
    const codec = new ArrayCodec(string().array(), new StringCodec(string()))

    it('Should decode an array as array with its element decoded', () =>
      expect(codec.decode([1, 2, 3])).toStrictEqual(['1', '2', '3']))

    it('Should decode non-array as array that have one decoded value', () =>
      expect(codec.decode(1)).toStrictEqual(['1']))

    it('Should decode null as empty array', () =>
      expect(codec.decode(null)).toStrictEqual([]))

    it('Should decode undefined as empty array', () =>
      expect(codec.decode(undefined)).toStrictEqual([]))

    it('Should encode array as an array with its element encoded', () =>
      expect(codec.encode(['0', '1', '2', '3', '4'])).toStrictEqual([
        '0',
        '1',
        '2',
        '3',
        '4',
      ]))
  })

  describe('MapCodec', () => {
    const codec = new MapCodec(
      map(string(), number()),
      new StringCodec(string()),
      new NumberCodec(number()),
    )

    it('Should decode an array of elements as map with decoded value as key', () => {
      const result = codec.decode([1, 2, 3])
      expect(result.size).toBe(3)
      expect(result.has('1')).toBe(true)
      expect(result.has('2')).toBe(true)
      expect(result.has('3')).toBe(true)
    })

    it('Should decode an array of key-value pairs as map with its key and value decoded', () => {
      const result = codec.decode([
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
      const result = codec.decode({
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
      const result = codec.decode(
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
      const result = codec.encode(
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
  })

  describe('SetCodec', () => {
    const codec = new SetCodec(set(number()), new NumberCodec(number()))

    it('Should decode array as set with its elements decoded', () => {
      const result = codec.decode([1, 2, 3, 1])
      expect(result.size).toBe(3)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('Should encode set as array with its elements encoded', () => {
      const result = codec.encode(new Set([1, 2, 3]))
      expect(Array.isArray(result)).toBe(true)
      if (Array.isArray(result)) {
        expect(result.length).toBe(3)
        expect(result[0]).toBe(1)
        expect(result[1]).toBe(2)
        expect(result[2]).toBe(3)
      }
    })
  })

  describe('NullableCodec', () => {
    const codec = new NullableCodec(
      string().nullable(),
      new StringCodec(string()),
    )

    it('Should decode null as null', () =>
      expect(codec.decode(null)).toBe(null))

    it('Should decode non-null as non-null', () =>
      expect(codec.decode(1)).toBe('1'))

    it('Should encode null as null', () =>
      expect(codec.encode(null)).toBe(null))

    it('Should encode non-null as non-null', () =>
      expect(codec.encode('1')).toBe('1'))
  })

  describe('OptionalCodec', () => {
    const codec = new OptionalCodec(
      string().optional(),
      new StringCodec(string()),
    )

    it('Should decode undefined as undefined', () =>
      expect(codec.decode(undefined)).toBe(undefined))

    it('Should decode non-undefined as defined', () =>
      expect(codec.decode(1)).toBe('1'))

    it('Should encode undefined as undefined', () =>
      expect(codec.encode(undefined)).toBe(undefined))

    it('Should encode non-undefined as defined', () =>
      expect(codec.encode('1')).toBe('1'))
  })

  describe('TupleCodec', () => {
    const codec = new TupleCodec(tuple(string(), number()), [
      new StringCodec(string()),
      new NumberCodec(number()),
    ])

    it('Should decode array as tuple with each item decoded', () =>
      expect(codec.decode([1, 2])).toStrictEqual(['1', 2]))

    it('Should decode excess array as tuple by removing excess items', () =>
      expect(codec.decode([1, 2, 3, 4])).toStrictEqual(['1', 2]))

    it('Should encode tuple as array', () =>
      expect(codec.encode(['1', 2])).toStrictEqual(['1', 2]))
  })

  describe('UnionCodec', () => {
    const codec = new UnionCodec(union(number(), string()), [
      new NumberCodec(number()),
      new StringCodec(string()),
    ])

    it('Should decode the elements based on the order schema declaration', () => {
      expect(codec.decode(1)).toBe(1)
      expect(codec.decode('hello')).toBe('hello')
    })

    it('Should encode the elements based on the order of schema declaration', () => {
      expect(codec.encode(1)).toBe(1)
      expect(codec.encode('hello')).toBe('hello')
    })
  })

  describe('ObjectCodec', () => {
    const codec = new ObjectCodec(
      object({
        id: number(),
        name: string(),
      }),
      {
        id: new NumberCodec(number()),
        name: new StringCodec(string()),
      },
    )

    it('Should decode object as object', () =>
      expect(codec.decode({ id: '1', name: 'Adam' })).toStrictEqual({
        id: 1,
        name: 'Adam',
      }))

    it('Should encode object as object', () =>
      expect(codec.encode({ id: 1, name: 'Adam' })).toStrictEqual({
        id: 1,
        name: 'Adam',
      }))
  })
})
