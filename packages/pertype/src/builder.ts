import { MetaTarget } from './metadata'
import { Constructor } from './util/alias'

/**
 * Builder to build `T` object map (key-value store) that create new instance
 * every time its mutated
 */
export class ImmutableBuilder<T extends {}> implements MetaTarget {
  /**
   * NEVER OVERRIDE CONSTRUCTOR.
   *
   * This constructor is used each time the key-value store object is mutated.
   * Any changes to the parameter signature can cause unsafe parameters passed
   * wrong.
   * @param definition Key-value store object
   */
  protected constructor(
    private readonly definition: T,
    public readonly parent?: MetaTarget | undefined,
  ) {}

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
    return this.clone({ ...this.definition, [key]: value })
  }

  /**
   * Create a new instance of current object. Copy current definition by default
   *
   * @param newDefinition Optional new definition that will be used for new instance
   * @returns A new instance of current object
   */
  public clone(newDefinition: T = this.definition): this {
    const Ctor = this.constructor as Constructor<
      this,
      [T, MetaTarget | undefined]
    >
    return new Ctor(newDefinition, this)
  }
}
