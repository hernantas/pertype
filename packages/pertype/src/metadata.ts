/**
 * An object that can inherit its parent metadata
 */
export interface MetaTarget {
  readonly parent?: MetaTarget | undefined
}

/**
 * A metadata store that can hold metadata value for arbitrary object in place
 * of the object itself (without modifying the object) to make it easier to
 * create custom type-safe metadata
 */
export class Metadata<T> {
  private readonly map: WeakMap<MetaTarget, T> = new WeakMap()

  /**
   * Check if given object has metadata stored on this store
   *
   * @param target An object to be checked
   * @returns True if has metadata, false otherwise
   */
  public has(target: MetaTarget): boolean {
    return this.map.has(target)
  }

  /**
   * Get metadata value from given object. Also inherit the metadata value from
   * parent object if conforming to {@link MetaTarget} interface
   *
   * @param target An object to be checked
   * @returns Value of metadata
   */
  public get(target: MetaTarget): T | undefined {
    const value = this.map.get(target)
    if (value !== undefined) {
      return value
    }

    if (target.parent !== undefined) {
      return this.get(target.parent)
    }

    return undefined
  }

  /**
   * Set metadata value to given object.
   *
   * @param target An object to be checked
   * @param value New metadata value
   * @returns This store instance
   */
  public set(target: MetaTarget, value: T): this {
    this.map.set(target, value)
    return this
  }
}

/**
 * Create new instance of {@link Metadata} store
 *
 * @returns A new instance of metadata store
 */
export function metadata<T>(): Metadata<T> {
  return new Metadata<T>()
}
