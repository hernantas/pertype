import { AnyRecord, Constructor } from './alias'

/**
 * Builder to build `T` object map (key-value store) that create new instance
 * every time its mutated
 */
export class ImmutableBuilder<T extends AnyRecord> {
  /**
   * NEVER OVERRIDE CONSTRUCTOR.
   *
   * This constructor is used each time the key-value store object is mutated.
   * Any changes to the parameter signature can cause unsafe parameters passed
   * wrong.
   * @param definition Key-value store object
   */
  public constructor(private readonly definition: T) {}

  /**
   * Get value of store object given by the key
   *
   * @param key Key used for map
   * @returns Value of given key stored on the store
   */
  public get<K extends keyof T>(key: K): T[K] {
    return this.definition[key]
  }

  /**
   * Store given value with given key to the object store. Always create a new
   * instance
   *
   * @param key Key of store object
   * @param value Value for given key that will be stored
   * @returns A new instance of current class
   */
  public set<K extends keyof T>(key: K, value: T[K]): this {
    const Ctor = this.constructor as Constructor<this, [T]>
    return new Ctor({
      ...this.definition,
      [key]: value,
    })
  }
}
