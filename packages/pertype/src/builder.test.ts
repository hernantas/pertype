import { describe, expect, it } from 'bun:test'
import { ImmutableBuilder } from './builder'
import { AnyRecord } from './util/alias'

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

  it('Should decorate with given attribute', () => {
    const builder = TestBuilder.create().decorate(
      { key1: 'value1', key2: 'value2', key3: 'value3' },
      { key4: 'value4', key5: 'value5' },
    )
    expect(builder.get('key1')).toBe('value1')
    expect(builder.get('key2')).toBe('value2')
    expect(builder.get('key3')).toBe('value3')
    expect(builder.get('key4')).toBe('value4')
    expect(builder.get('key5')).toBe('value5')
  })
})
