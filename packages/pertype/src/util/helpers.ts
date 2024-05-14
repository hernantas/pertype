import { Definition, Schema } from '../schema'
import { AnyRecord, Key, Member } from './alias'
import { TypeOf } from './type'

/**
 * Convert {@link Member} type into union
 */
export type UnionOf<T extends Member<any>> = T[number]

export interface UnionDefinition<S extends Member<Schema>>
  extends Definition<UnionOf<TypeOf<S>>> {
  readonly members: S
}

// Inspired by https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersect<T> = (T extends any ? (t: T) => void : never) extends (
  p: infer P,
) => void
  ? P
  : never

/**
 * Convert {@link Member} type into intersect
 */
export type IntersectOf<T extends Member<any>> = UnionToIntersect<UnionOf<T>>

/**
 * Utility type to get keys that is not undefined
 */
export type RequiredKeys<T extends AnyRecord> = {
  [K in keyof T]: undefined extends T[K] ? never : K
}[keyof T]

/**
 * Utility type to get keys that have undefined
 */
export type OptionalKeys<T extends AnyRecord> = {
  [K in keyof T]: undefined extends T[K] ? K : never
}[keyof T]

/**
 * Utility type to get `T` object property by `K` key. If key do not exists,
 * return `R`
 */
export type At<
  T extends AnyRecord,
  K extends Key,
  R = never,
> = K extends keyof T ? T[K] : R

/** Merge both object into simple object */
export type Merge<T1 extends AnyRecord, T2 extends AnyRecord> = {
  [K in keyof (T1 & T2)]: At<T1, K> | At<T2, K>
}
