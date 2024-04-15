import { AnyObject, Constructor } from './alias'

export class ImmutableBuilder<T extends AnyObject> {
  public constructor(private readonly definition: T) {}

  public get<K extends keyof T>(key: K): T[K] {
    return this.definition[key]
  }

  public set<K extends keyof T>(key: K, value: T[K]): this {
    const Ctor = this.constructor as Constructor<this, [T]>
    return new Ctor({
      ...this.definition,
      [key]: value,
    })
  }
}
