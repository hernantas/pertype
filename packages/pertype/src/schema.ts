import { Key } from './util/alias'
import { ImmutableBuilder } from './util/builder'

/**
 * Key value store used in schema
 */
export interface Definition {
  /**
   * Other kind of key value pair stored on this definition
   */
  readonly [key: Key]: unknown
}

/**
 * Runtime type that represent some type and can be used to identify and
 * validate the value
 */
export abstract class Schema<T = any> extends ImmutableBuilder<Definition> {
  /**
   * Narrow generic type to specific type represented by this schema
   *
   * @param value Value to be narrowed
   */
  public abstract is(value: unknown): value is T
}

/**
 * Infer the represented type by the schema
 */
export type TypeOf<S extends Schema> = S extends Schema<infer R> ? R : never

// # Number

/**
 * {@link Schema} that represent `number`
 */
export class NumberSchema extends Schema<number> {
  public override is(value: unknown): value is number {
    return typeof value === 'number'
  }
}

/**
 * Create new instances of {@link NumberSchema}
 *
 * @returns A new instances
 */
export function number(): NumberSchema {
  return numberInstance
}
const numberInstance = new NumberSchema({})
