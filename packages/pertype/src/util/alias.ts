/**
 * Alias for constructor of `T` type with `Args` parameters
 */
export type Constructor<T, Args extends any[]> = new (...args: Args) => T

/**
 * Alias for valid object property key
 */
export type Key = string | number | symbol

/**
 * Alias for any object with properties
 */
export type AnyObject = {
  [key: Key]: unknown
}

/**
 * Alias for `tuple` object
 */
export type Tuple<T> = [T, ...T[]]

/**
 * Similar to {@link Tuple} but must have at least 2 types
 */
export type Member<T> = [T, T, ...T[]]
