import { AnyObject, Key } from './util/alias'
import { ImmutableBuilder } from './util/builder'

/**
 * Function to check if value is valid
 */
export type Validate<T> = (value: T) => boolean

/** Constraint to determine valid value */
export interface Constraint<T> {
  /**
   * The type of constraint to differentiate with other constraint
   */
  readonly type: string

  /**
   * Optional message string used to describe the constraint
   */
  readonly message?: string

  /**
   * Optional arguments used for this constraint
   */
  readonly args?: AnyObject

  /** Check if given value is valid */
  readonly validate: Validate<T>
}

/**
 * Violation information that describe the constraint that being violated
 */
export interface Violation {
  /**
   * The type of violation
   */
  readonly type: string

  /**
   * Optional message string used to describe the violation
   */
  readonly message?: string | undefined

  /**
   * Optional arguments used in the constraint
   */
  readonly args?: AnyObject | undefined
}

/**
 * Key value store used in schema
 */
export interface Definition<T> {
  /**
   * List of constraints of current schema
   */
  readonly constraints?: Constraint<T>[]

  /**
   * Other kind of key value pair stored on this definition
   */
  readonly [key: Key]: unknown
}

/**
 * Runtime type that represent some type and can be used to identify and
 * validate the value
 */
export abstract class Schema<T = any> extends ImmutableBuilder<Definition<T>> {
  /**
   * List of constraints of current schema
   */
  public get constraints(): Constraint<T>[] {
    return this.get('constraints') ?? []
  }

  /**
   * Add validation constraint to this schema
   *
   * @param rule Constraint to be added
   * @returns A new instance of this class
   */
  public check(rule: Constraint<T>): this {
    return this.set('constraints', this.constraints.concat(rule))
  }

  /**
   * Validated given value by the current active constraints on the schema
   *
   * @param value Value to be validated
   * @returns An array of info of constraint being violated
   */
  public validate(value: T): Violation[] {
    return this.constraints
      .filter((constraint) => !constraint.validate(value))
      .map((constraint) => ({
        type: constraint.type,
        message: constraint.message,
        args: constraint.args,
      }))
  }

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
