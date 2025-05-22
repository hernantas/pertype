/**
 * Ensure metadata target can be inherit its parent instance
 */
export interface MetaTarget {
  readonly parent?: MetaTarget | undefined
}

/**
 * Store metadata value for target object instead of the object itself to make
 * metadata more type-safe
 */
export class Metadata<T> {
  private readonly map: WeakMap<MetaTarget, T> = new WeakMap()

  public has(target: MetaTarget): boolean {
    return this.map.has(target)
  }

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

  public set(target: MetaTarget, value: T): this {
    this.map.set(target, value)
    return this
  }
}

/**
 * Create new instance of metadata store
 *
 * @returns A new instance of metadata store
 */
export function metadata<T>(): Metadata<T> {
  return new Metadata<T>()
}
