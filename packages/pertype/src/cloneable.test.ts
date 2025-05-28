import { Cloneable } from './cloneable'
import { Key } from './util/alias'

interface TestDefinition {
  _number: number
  _string: string
  [key: Key]: unknown
}

class TestCloneable extends Cloneable<TestDefinition> {
  public static create(): TestCloneable {
    return new TestCloneable({ _number: 0, _string: '' })
  }
}

describe('Cloneable', () => {
  it('Initialized property should have its initialized value initially', () => {
    const c = TestCloneable.create()
    expect(c.get('_string')).toBe('')
    expect(c.get('_number')).toBe(0)
  })

  it('Non-initialized property should be undefined initially', () => {
    const c = TestCloneable.create()
    expect(c.get('unknown_key')).toBe(undefined)
  })

  describe('Changing value definition', () => {
    const c1 = TestCloneable.create()
    const c2 = c1.set('_string', 'override_value')

    it('Should create a new instance', () => {
      expect(c2).not.toBe(c1)
    })

    it('Should change the value of new instance', () => {
      expect(c2.get('_string')).toBe('override_value')
    })

    it('Should not change the original instance', () => {
      expect(c1.get('_string')).toBe('')
    })

    it('Should not change the other properties', () => {
      expect(c1.get('_number')).toBe(0)
      expect(c2.get('_number')).toBe(0)
    })

    it('Should keep parent reference', () => {
      expect(c2.parent).toBe(c1)
    })
  })

  describe('Cloning', () => {
    describe('Without arguments', () => {
      const c1 = TestCloneable.create()
        .set('_number', 99)
        .set('_string', 'test')
      const c2 = c1.clone()

      it('Should create a new instance', () => {
        expect(c2).not.toBe(c1)
      })

      it('Should clone with the same property value as its origin', () => {
        expect(c1.get('_number')).toBe(99)
        expect(c1.get('_string')).toBe('test')
        expect(c2.get('_number')).toBe(99)
        expect(c2.get('_string')).toBe('test')
      })

      it('Should keep parent reference', () => {
        expect(c2.parent).toBe(c1)
      })
    })

    describe('With arguments', () => {
      const c1 = TestCloneable.create()
      const c2 = c1.clone({ _number: 99, _string: 'test' })

      it('Should create a new instance', () => {
        expect(c2).not.toBe(c1)
      })

      it('Should not change the original instance', () => {
        expect(c1.get('_number')).toBe(0)
        expect(c1.get('_string')).toBe('')
      })

      it('Should clone with new property value from its origin', () => {
        expect(c2.get('_number')).toBe(99)
        expect(c2.get('_string')).toBe('test')
      })

      it('Should keep parent reference', () => {
        expect(c2.parent).toBe(c1)
      })
    })
  })
})
