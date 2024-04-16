import {
  Schema,
  _null,
  _undefined,
  any,
  array,
  bool,
  boolean,
  number,
  string,
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
      const schema = boolean()
      expect(schema.is(true)).toBe(true)
      expect(schema.is(false)).toBe(true)
      expect(schema.is(0)).toBe(false)
      expect(schema.is(1)).toBe(false)
      expect(schema.is('true')).toBe(false)
      expect(schema.is('false')).toBe(false)
    })
  })

  describe('NumberSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(number()))

    const schema = number()

    it('Should narrow number as number', () => {
      expect(schema.is(0)).toBe(true)
      expect(schema.is(255)).toBe(true)
      expect(schema.is(-255)).toBe(true)
      expect(schema.is(255.0)).toBe(true)
      expect(schema.is(0xff)).toBe(true)
      expect(schema.is(0b11111111)).toBe(true)
      expect(schema.is(0.255e3)).toBe(true)
      expect(schema.is(NaN)).toBe(true)
      expect(schema.is(Infinity)).toBe(true)
      expect(schema.is(-Infinity)).toBe(true)
      expect(schema.is('0')).toBe(false)
      expect(schema.is('3')).toBe(false)
    })

    it('Min constraint should limit its minimum value using greater or equal operator', () => {
      const validator = schema.min(0)
      expect(validator.validate(0).valid).toBe(true)
      expect(validator.validate(0).valid).toBe(true)
      expect(validator.validate(1).valid).toBe(true)
      expect(validator.validate(Number.MAX_SAFE_INTEGER).valid).toBe(true)
      expect(validator.validate(-1).valid).toBe(false)
      expect(validator.validate(Number.MIN_SAFE_INTEGER).valid).toBe(false)
    })

    it('Max constraint should limit its maximum value using less or equal operator', () => {
      const validator = schema.max(0)
      expect(validator.validate(0).valid).toBe(true)
      expect(validator.validate(-1).valid).toBe(true)
      expect(validator.validate(Number.MIN_SAFE_INTEGER).valid).toBe(true)
      expect(validator.validate(1).valid).toBe(false)
      expect(validator.validate(Number.MAX_SAFE_INTEGER).valid).toBe(false)
    })

    it('Greater constraint should check value using greater operator', () => {
      const validator = schema.greater(0)
      expect(validator.validate(1).valid).toBe(true)
      expect(validator.validate(Number.MAX_SAFE_INTEGER).valid).toBe(true)
      expect(validator.validate(0).valid).toBe(false)
      expect(validator.validate(-1).valid).toBe(false)
      expect(validator.validate(Number.MIN_SAFE_INTEGER).valid).toBe(false)
    })

    it('Less constraint should check value using less operator', () => {
      const validator = schema.less(0)
      expect(validator.validate(-1).valid).toBe(true)
      expect(validator.validate(Number.MIN_SAFE_INTEGER).valid).toBe(true)
      expect(validator.validate(0).valid).toBe(false)
      expect(validator.validate(1).valid).toBe(false)
      expect(validator.validate(Number.MAX_SAFE_INTEGER).valid).toBe(false)
    })

    it('Positive constraint should check for positive number', () => {
      const validator = schema.positive()
      expect(validator.validate(1).valid).toBe(true)
      expect(validator.validate(Number.MAX_SAFE_INTEGER).valid).toBe(true)
      expect(validator.validate(0).valid).toBe(false)
      expect(validator.validate(-1).valid).toBe(false)
      expect(validator.validate(Number.MIN_SAFE_INTEGER).valid).toBe(false)
    })

    it('Negative constraint should check for negative number', () => {
      const validator = schema.negative()
      expect(validator.validate(-1).valid).toBe(true)
      expect(validator.validate(Number.MIN_SAFE_INTEGER).valid).toBe(true)
      expect(validator.validate(0).valid).toBe(false)
      expect(validator.validate(1).valid).toBe(false)
      expect(validator.validate(Number.MAX_SAFE_INTEGER).valid).toBe(false)
    })
  })

  describe('StringSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(string()))

    const schema = string()

    it('Should narrow string as string', () => {
      expect(schema.is('Hello World')).toBe(true)
      expect(schema.is('0')).toBe(true)
      expect(schema.is('false')).toBe(true)
      expect(schema.is(0)).toBe(false)
      expect(schema.is(false)).toBe(false)
    })

    it('Length constraint should check string length to be equal with limit', () => {
      const validator = schema.length(3)
      expect(validator.validate('username').valid).toBe(false)
      expect(validator.validate('use').valid).toBe(true)
      expect(validator.validate('u').valid).toBe(false)
      expect(validator.validate('').valid).toBe(false)
    })

    it('Min constraint should check minimum string length', () => {
      const validator = schema.min(3)
      expect(validator.validate('username').valid).toBe(true)
      expect(validator.validate('use').valid).toBe(true)
      expect(validator.validate('u').valid).toBe(false)
      expect(validator.validate('').valid).toBe(false)
    })

    it('Max constraint should check maximum string length', () => {
      const validator = schema.max(3)
      expect(validator.validate('username').valid).toBe(false)
      expect(validator.validate('use').valid).toBe(true)
      expect(validator.validate('u').valid).toBe(true)
      expect(validator.validate('').valid).toBe(true)
    })

    it('Not empty constraint should check if string empty or not', () => {
      const validator = schema.notEmpty()
      expect(validator.validate('username').valid).toBe(true)
      expect(validator.validate('use').valid).toBe(true)
      expect(validator.validate('u').valid).toBe(true)
      expect(validator.validate('').valid).toBe(false)
    })

    it('Pattern constraint should check if string match the pattern', () => {
      const validator = schema.pattern(/^[a-zA-Z0-9]+$/)
      expect(validator.validate('UserName98543').valid).toBe(true)
      expect(validator.validate('65891238912').valid).toBe(true)
      expect(validator.validate('').valid).toBe(false)
      expect(validator.validate('email@email').valid).toBe(false)
      expect(validator.validate('user_name').valid).toBe(false)
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
      expectType<Schema>(array(number())))

    const schema = array(number())

    it('Length constraint should check if array length is equal to limit', () => {
      const validator = schema.length(2)
      expect(validator.validate([0, 1, 2]).valid).toBe(false)
      expect(validator.validate([0, 1]).valid).toBe(true)
      expect(validator.validate([0]).valid).toBe(false)
    })

    it('Min constraint should check minimum array length', () => {
      const validator = schema.min(2)
      expect(validator.validate([0, 1, 2]).valid).toBe(true)
      expect(validator.validate([0, 1]).valid).toBe(true)
      expect(validator.validate([0]).valid).toBe(false)
    })

    it('Max constraint should check maximum array length', () => {
      const validator = schema.max(2)
      expect(validator.validate([0, 1, 2]).valid).toBe(false)
      expect(validator.validate([0, 1]).valid).toBe(true)
      expect(validator.validate([0]).valid).toBe(true)
    })
  })

  describe('AnySchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(any()))
  })

  describe('UnknownSchema', () => {
    it('Should be compatible with Schema', () => expectType<Schema>(unknown()))
  })
})
