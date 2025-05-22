import { Cloneable } from './cloneable'
import { AnyRecord } from './util/alias'

describe('ImmutableBuilder', () => {
  class TestClone extends Cloneable<AnyRecord> {
    public static create(): TestClone {
      return new TestClone({})
    }
  }

  it('Should set the unknown value', () => {
    const instance = TestClone.create().set('key', 'value')
    expect(instance.get('key')).toBe('value')
  })

  it('Should overwrite the value with same key', () => {
    const instance = TestClone.create()
      .set('key', 'value')
      .set('key', 'overwrite')
    expect(instance.get('key')).toBe('overwrite')
  })

  it('Should create new instance each set', () => {
    const instance1 = TestClone.create()
    const instance2 = instance1.set('key', 'value')
    const instance3 = instance2.set('key', 'overwrite')
    expect(instance1).not.toBe(instance2)
    expect(instance1).not.toBe(instance3)
    expect(instance2).not.toBe(instance3)
  })
})
