import { Schema, bool, boolean, number, string } from './schema'

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
      expect(validator.validate(0)).toHaveLength(0)
      expect(validator.validate(1)).toHaveLength(0)
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(-1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MIN_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Max constraint should limit its maximum value using less or equal operator', () => {
      const validator = schema.max(0)
      expect(validator.validate(0)).toHaveLength(0)
      expect(validator.validate(-1)).toHaveLength(0)
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MAX_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Greater constraint should check value using greater operator', () => {
      const validator = schema.greater(0)
      expect(validator.validate(1)).toHaveLength(0)
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(-1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MIN_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Less constraint should check value using less operator', () => {
      const validator = schema.less(0)
      expect(validator.validate(-1)).toHaveLength(0)
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MAX_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Positive constraint should check for positive number', () => {
      const validator = schema.positive()
      expect(validator.validate(1)).toHaveLength(0)
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(-1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MIN_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Negative constraint should check for negative number', () => {
      const validator = schema.negative()
      expect(validator.validate(-1)).toHaveLength(0)
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MAX_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
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
      expect(validator.validate('username').length).toBeGreaterThan(0)
      expect(validator.validate('use')).toHaveLength(0)
      expect(validator.validate('u').length).toBeGreaterThan(0)
      expect(validator.validate('').length).toBeGreaterThan(0)
    })

    it('Min constraint should check minimum string length', () => {
      const validator = schema.min(3)
      expect(validator.validate('username')).toHaveLength(0)
      expect(validator.validate('use')).toHaveLength(0)
      expect(validator.validate('u').length).toBeGreaterThan(0)
      expect(validator.validate('').length).toBeGreaterThan(0)
    })

    it('Max constraint should check maximum string length', () => {
      const validator = schema.max(3)
      expect(validator.validate('username').length).toBeGreaterThan(0)
      expect(validator.validate('use')).toHaveLength(0)
      expect(validator.validate('u')).toHaveLength(0)
      expect(validator.validate('')).toHaveLength(0)
    })

    it('Not empty constraint should check if string empty or not', () => {
      const validator = schema.notEmpty()
      expect(validator.validate('username')).toHaveLength(0)
      expect(validator.validate('use')).toHaveLength(0)
      expect(validator.validate('u')).toHaveLength(0)
      expect(validator.validate('').length).toBeGreaterThan(0)
    })

    it('Pattern constraint should check if string match the pattern', () => {
      const validator = schema.pattern(/^[a-zA-Z0-9]+$/)
      expect(validator.validate('UserName98543')).toHaveLength(0)
      expect(validator.validate('65891238912')).toHaveLength(0)
      expect(validator.validate('').length).toBeGreaterThan(0)
      expect(validator.validate('email@email').length).toBeGreaterThan(0)
      expect(validator.validate('user_name').length).toBeGreaterThan(0)
    })
  })
})
