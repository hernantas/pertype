/**
 * Utility type to store type that can be inferred
 */
export interface Type<T = any> {
  readonly __type: T
}

/**
 * Infer the represented type by the schema
 */
export type TypeOf<T> = T extends Type
  ? T['__type']
  : {
      [K in keyof T]: TypeOf<T[K]>
    }
