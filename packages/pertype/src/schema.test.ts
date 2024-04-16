import { number } from './schema'

describe('Schema', () => {
  function expectType<T>(_: T): void {}

  describe('NumberSchema', () => {
    it('Should be compatible with Schema', () => expectType(number()))

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
      expect(validator.validate(0)).toHaveLength(0)
      expect(validator.validate(1)).toHaveLength(0)
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(-1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MIN_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Max constraint should limit its maximum value using less or equal operator', () => {
      const validator = number().max(0)
      expect(validator.validate(0)).toHaveLength(0)
      expect(validator.validate(-1)).toHaveLength(0)
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MAX_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Greater constraint should check value using greater operator', () => {
      const validator = number().greater(0)
      expect(validator.validate(1)).toHaveLength(0)
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(-1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MIN_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Less constraint should check value using less operator', () => {
      const validator = number().less(0)
      expect(validator.validate(-1)).toHaveLength(0)
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MAX_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Positive constraint should check for positive number', () => {
      const validator = number().positive()
      expect(validator.validate(1)).toHaveLength(0)
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(-1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MIN_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })

    it('Negative constraint should check for negative number', () => {
      const validator = number().negative()
      expect(validator.validate(-1)).toHaveLength(0)
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toHaveLength(0)
      expect(validator.validate(0).length).toBeGreaterThan(0)
      expect(validator.validate(1).length).toBeGreaterThan(0)
      expect(
        validator.validate(Number.MAX_SAFE_INTEGER).length,
      ).toBeGreaterThan(0)
    })
  })
})
