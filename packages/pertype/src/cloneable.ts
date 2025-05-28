import { MetaTarget } from './metadata'
import { Constructor } from './util/alias'

/**
 * Cloneable is a base class for record object (key-value object) that can be cloned.
 * It provides a way to store and retrieve values using a key-value pair.
 * Each time a value is set, a new instance of the class is created.
 *
 * @template T The type of the record object
 */
export class Cloneable<T extends {}> implements MetaTarget {
  /**
   * NEVER OVERRIDE CONSTRUCTOR.
   *
   * This constructor is used each time the stored record object is mutated.
   * Any changes to the parameter signature can cause issues with the cloning process.
   *
   * @param definition A record object
   * @param parent Optional parent object that can be used to link to a parent object and can be used to inherit metadata
   */
  protected constructor(
    private readonly definition: T,
    public readonly parent?: MetaTarget | undefined,
  ) {}

  /**
   * Get value of given key stored on record object.
   *
   * @param key Key used for map
   * @returns Value of given key stored on the record object
   */
  public get<K extends keyof T>(key: K): T[K] {
    return this.definition[key]
  }

  /**
   * Set value for given key on record object. This method creates a new instance of the class with the updated value.
   *
   * @param key Key of record object
   * @param value Value to set for given key
   * @returns A new instance of the class with the updated value
   */
  public set<K extends keyof T>(key: K, value: T[K]): this {
    return this.clone({ ...this.definition, [key]: value })
  }

  /**
   * Clone the current instance of the class. This method creates a new instance
   * of the class with the same definition or a new definition if provided.
   *
   * @param newDefinition Optional new definition that will be used for new instance
   * @returns A new instance of the class
   */
  public clone(newDefinition: T = this.definition): this {
    const Ctor = this.constructor as Constructor<
      this,
      [T, MetaTarget | undefined]
    >
    return new Ctor(newDefinition, this)
  }
}
