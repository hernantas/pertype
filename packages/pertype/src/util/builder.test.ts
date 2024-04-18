import { AnyRecord } from './alias'
import { ImmutableBuilder } from './builder'

describe('ImmutableBuilder', () => {
  it('Should set the unknown value', () => {
    const builder = new ImmutableBuilder({} as AnyRecord).set('key', 'value')
    expect(builder.get('key')).toBe('value')
  })

  it('Should overwrite the value with same key', () => {
    const builder = new ImmutableBuilder({} as AnyRecord)
      .set('key', 'value')
      .set('key', 'overwrite')
    expect(builder.get('key')).toBe('overwrite')
  })

  it('Should create new instance each set', () => {
    const builder1 = new ImmutableBuilder({} as AnyRecord)
    const builder2 = builder1.set('key', 'value')
    const builder3 = builder2.set('key', 'overwrite')
    expect(builder1).not.toBe(builder2)
    expect(builder1).not.toBe(builder3)
    expect(builder2).not.toBe(builder3)
  })
})
