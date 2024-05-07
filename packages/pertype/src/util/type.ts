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

export interface Output<T = any> {
  readonly __output: T
}

export type OutputOf<T> = T extends Output
  ? T['__output']
  : {
      [K in keyof T]: OutputOf<T[K]>
    }

export interface Input<T = any> {
  readonly __input: T
}

export type InputOf<T> = T extends Input
  ? T['__input']
  : {
      [K in keyof T]: InputOf<T[K]>
    }
