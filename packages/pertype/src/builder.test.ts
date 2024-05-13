import { AnyRecord } from './util/alias'
import { ImmutableBuilder } from './builder'

describe('ImmutableBuilder', () => {
  class TestBuilder extends ImmutableBuilder<AnyRecord> {
    public static create(): TestBuilder {
      return new TestBuilder({})
    }
  }

  it('Should set the unknown value', () => {
    const builder = TestBuilder.create().set('key', 'value')
    expect(builder.get('key')).toBe('value')
  })

  it('Should overwrite the value with same key', () => {
    const builder = TestBuilder.create()
      .set('key', 'value')
      .set('key', 'overwrite')
    expect(builder.get('key')).toBe('overwrite')
  })

  it('Should create new instance each set', () => {
    const builder1 = TestBuilder.create()
    const builder2 = builder1.set('key', 'value')
    const builder3 = builder2.set('key', 'overwrite')
    expect(builder1).not.toBe(builder2)
    expect(builder1).not.toBe(builder3)
    expect(builder2).not.toBe(builder3)
  })
})
