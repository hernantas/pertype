/**
 * Alias for constructor of `T` type with `Args` parameters
 */
export type Constructor<T, Args extends any[]> = new (...args: Args) => T

/**
 * Alias for valid object property key
 */
export type Key = string | number | symbol
