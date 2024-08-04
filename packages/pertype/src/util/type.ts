/**
 * Utility type to store type that can be inferred
 */
export interface Type<T = any> {
  /**
   * Type that can be inferred
   */
  readonly __type: T
}

/**
 * Recursively infer type from {@link Type}
 */
export type TypeOf<T> = T extends Type
  ? T['__type']
  : {
      [K in keyof T]: TypeOf<T[K]>
    }

/**
 * Infer stored type from {@link Type}
 */
export type Infer<T> = TypeOf<T>

/**
 * Utility type to store output type
 */
export interface Output<T = any> {
  readonly __output: T
}

/**
 * Recursively infer output type from {@link Output}
 */
export type OutputOf<T> = T extends Output
  ? T['__output']
  : {
      [K in keyof T]: OutputOf<T[K]>
    }

/**
 * Utility type to store input type
 */
export interface Input<T = any> {
  readonly __input: T
}

/**
 * Recursively infer input type from {@link Input}
 */
export type InputOf<T> = T extends Input
  ? T['__input']
  : {
      [K in keyof T]: InputOf<T[K]>
    }
