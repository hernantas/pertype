/**
 * Alias for constructor of `T` type with `Args` parameters
 */
export type Constructor<T, Args extends any[]> = new (...args: Args) => T
