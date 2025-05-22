import { metadata, MetaTarget } from './metadata'

describe('Metadata', () => {
  it('Should store metadata value for arbitrary object', () => {
    const store = metadata<string>()
    const instance = {}
    store.set(instance, 'value')
    expect(store.get(instance)).toBe('value')
  })

  it('Should overwrite previous metadata value', () => {
    const store = metadata<string>()
    const instance = {}
    store.set(instance, 'value')
    store.set(instance, 'overwrite')
    expect(store.get(instance)).toBe('overwrite')
  })

  it('Should store each metadata value if object is different instance', () => {
    const store = metadata<string>()
    const instance1 = {}
    const instance2 = {}
    store.set(instance1, 'value1')
    store.set(instance2, 'value2')
    expect(store.get(instance1)).toBe('value1')
    expect(store.get(instance2)).toBe('value2')
  })

  it('Should inherit metadata value from its parent', () => {
    const store = metadata<string>()
    const instance1 = {}
    store.set(instance1, 'value')
    const instance2: MetaTarget = { parent: instance1 }
    expect(store.get(instance1)).toBe('value')
    expect(store.get(instance2)).toBe('value')
  })

  it('Should overwrite metadata value from its parent without overwriting parent metadata', () => {
    const store = metadata<string>()
    const instance1 = {}
    store.set(instance1, 'value')
    const instance2: MetaTarget = { parent: instance1 }
    store.set(instance2, 'overwrite')
    expect(store.get(instance1)).toBe('value')
    expect(store.get(instance2)).toBe('overwrite')
  })
})
