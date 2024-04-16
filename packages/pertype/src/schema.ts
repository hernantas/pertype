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

export type ValidationResult<T> =
  | {
      readonly valid: true
      readonly value: T
    }
  | {
      readonly valid: false
      readonly violations: Violation[]
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
export abstract class Schema<
  T = any,
  D extends Definition<T> = Definition<T>,
> extends ImmutableBuilder<D> {
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
   * Validate given value by the current active constraints on the schema
   *
   * @param value Value to be validated
   * @returns An array of info of constraint being violated
   */
  public validate(value: T): ValidationResult<T> {
    const violations = this.constraints
      .filter((constraint) => !constraint.validate(value))
      .map((constraint) => ({
        type: constraint.type,
        message: constraint.message,
        args: constraint.args,
      }))
    return violations.length === 0
      ? {
          valid: true,
          value,
        }
      : {
          valid: false,
          violations,
        }
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

// # Boolean

/**
 * {@link Schema} that represent `boolean`
 */
export class BooleanSchema extends Schema<boolean> {
  public override is(value: unknown): value is boolean {
    return typeof value === 'boolean'
  }
}

/**
 * Create new instance of {@link BooleanSchema}
 *
 * @returns A new instance
 */
export function boolean(): BooleanSchema {
  return booleanInstance
}

/**
 * Create new instance of {@link BooleanSchema}
 *
 * @returns A new instance
 */
export function bool(): BooleanSchema {
  return booleanInstance
}

const booleanInstance = new BooleanSchema({})

// # Number

/**
 * {@link Schema} that represent `number`
 */
export class NumberSchema extends Schema<number> {
  public override is(value: unknown): value is number {
    return typeof value === 'number'
  }

  /**
   * Add new validation constraint that check minimum number (`>=`)
   *
   * @param limit Minimum number
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public min(
    limit: number,
    message: string = `must greater than or equal to ${limit}`,
  ): this {
    return this.check({
      type: `number.min`,
      args: { limit },
      validate: (v) => v >= limit,
      message,
    })
  }

  /**
   * Add new validation constraint that check maximum number (`<=`)
   *
   * @param limit Maximum number
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public max(
    limit: number,
    message: string = `must be less than or equal to ${limit}`,
  ): this {
    return this.check({
      type: `number.max`,
      args: { limit },
      validate: (v) => v <= limit,
      message,
    })
  }

  /**
   * Add new validation constraint that check number to be greater than given
   * number (`>`)
   *
   * @param limit Limit number
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public greater(
    limit: number,
    message: string = `must be greater than ${limit}`,
  ): this {
    return this.check({
      type: `number.greater`,
      args: { limit },
      validate: (v) => v > limit,
      message,
    })
  }

  /**
   * Add new validation constraint that check number to be less than given
   * number (`<`)
   *
   * @param limit Limit number
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public less(
    limit: number,
    message: string = `must be less than ${limit}`,
  ): this {
    return this.check({
      type: `number.less`,
      args: { limit },
      validate: (v) => v < limit,
      message,
    })
  }

  /**
   * Add new validation constraint that number must be positive
   *
   * @param limit Limit number
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public positive(message: string = `must be positive number`): this {
    return this.check({
      type: `number.positive`,
      validate: (v) => v > 0,
      message,
    })
  }

  /**
   * Add new validation constraint that number must be negative
   *
   * @param limit Limit number
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public negative(message: string = `must be negative number`): this {
    return this.check({
      type: `number.negative`,
      validate: (v) => v < 0,
      message: message,
    })
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

// # String

/**
 * {@link Schema} that represent `string`
 */
export class StringSchema extends Schema<string> {
  public override is(value: unknown): value is string {
    return typeof value === 'string'
  }

  /**
   * Add new validation constraint that check character length
   *
   * @param limit Character length
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public length(
    limit: number,
    message: string = `must be at ${limit} characters`,
  ): this {
    return this.check({
      type: `string.length`,
      args: { limit },
      validate: (v) => v.length === limit,
      message,
    })
  }

  /**
   * Add new validation constraint that check minimum character length (`>=`)
   *
   * @param limit Minimum character length
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public min(
    limit: number,
    message: string = `must be more than ${limit} characters`,
  ): this {
    return this.check({
      type: `string.length.min`,
      args: { limit },
      validate: (v) => v.length >= limit,
      message,
    })
  }

  /**
   * Add new validation constraint that check maximum character length (`<=`)
   *
   * @param limit Maximum character length
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public max(
    limit: number,
    message: string = `must be less than ${limit} characters`,
  ): this {
    return this.check({
      type: `string.length.max`,
      args: { limit },
      validate: (v) => v.length <= limit,
      message,
    })
  }

  /**
   * Add new validation constraint that check if string is empty
   *
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public notEmpty(message: string = `must not empty`): this {
    return this.check({
      type: `string.not.empty`,
      validate: (v) => v.length > 0,
      message,
    })
  }

  /**
   * Add new validation constraint that check if string match given regex
   * pattern
   *
   * @param pattern Regex pattern for validation
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public pattern(
    pattern: RegExp,
    message: string = `must match "${pattern.source}" pattern`,
  ): this {
    return this.check({
      type: `string.pattern`,
      args: { pattern },
      validate: (v) => pattern.test(v),
      message,
    })
  }
}

/**
 * Create new instances of {@link StringSchema}
 *
 * @returns A new instances
 */
export function string(): StringSchema {
  return stringInstance
}
const stringInstance = new StringSchema({})

// # Array

export interface ArrayDefinition<S extends Schema>
  extends Definition<TypeOf<S>[]> {
  /**
   * Inner schema
   */
  readonly inner: S
}

/**
 * {@link Schema} that represent `Array` of type of inner schema
 */
export class ArraySchema<S extends Schema> extends Schema<
  TypeOf<S>[],
  ArrayDefinition<S>
> {
  public override is(value: unknown): value is TypeOf<S>[] {
    return (
      Array.isArray(value) &&
      value.find((v) => !this.innerSchema.is(v)) === false
    )
  }

  /**
   * Inner schema
   */
  public get innerSchema(): S {
    return this.get('inner')
  }

  /**
   * Add new validation constraint to check array length (`=`)
   *
   * @param limit Limit of array length
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public length(
    limit: number,
    message: string = `must be at ${limit} length`,
  ): this {
    return this.check({
      type: `array.length`,
      args: { limit },
      validate: (value) => value.length === limit,
      message,
    })
  }

  /**
   * Add new validation constraint to check minimum array length (`<=`)
   *
   * @param limit Minimum array length
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public min(
    limit: number,
    message: string = `must be at least ${limit} length`,
  ): this {
    return this.check({
      type: `array.length.min`,
      args: { limit },
      validate: (value) => value.length >= limit,
      message,
    })
  }

  /**
   * Add new validation constraint to check maximum array length (`>=`)
   *
   * @param limit Maximum array length
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public max(
    limit: number,
    message: string = `must be at most ${limit} length`,
  ): this {
    return this.check({
      type: `array.length.max`,
      args: { limit },
      validate: (value) => value.length <= limit,
      message,
    })
  }
}

/**
 * Create new instances of {@link ArraySchema}
 *
 * @returns A new instances
 */
export function array<S extends Schema>(schema: S): ArraySchema<S> {
  return new ArraySchema({ inner: schema })
}
