import { AnyObject, Key, Tuple } from './util/alias'
import { ImmutableBuilder } from './util/builder'

/**
 * Function to test if value is within constraint
 */
export type TestConstraint<T> = (value: T) => boolean

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

  /** Check if given value is not violating the constraint */
  readonly test: TestConstraint<T>
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
   * @param constraint Constraint to be added
   * @returns A new instance of this class
   */
  public rule(constraint: Constraint<T>): this {
    return this.set('constraints', this.constraints.concat(constraint))
  }

  /**
   * Check given value by the current active constraints on the schema
   *
   * @param value Value to be validated
   * @returns An array of info of constraint being violated
   */
  public check(value: T): Violation[] {
    return this.constraints
      .filter((constraint) => !constraint.test(value))
      .map((constraint) => ({
        type: constraint.type,
        message: constraint.message,
        args: constraint.args,
      }))
  }

  /**
   * Check given value by the current active constraints on the schema
   *
   * @param value Value to be validated
   * @returns True if not breaking any constraints, false otherwise
   */
  public test(value: T): boolean {
    return this.check(value).length === 0
  }

  /**
   * Validate given value by the current active constraints on the schema
   *
   * @param value Value to be validated
   * @returns Result of validation
   */
  public validate(value: T): ValidationResult<T> {
    const violations = this.check(value)
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
export type TypeOf<S> =
  S extends Schema<infer R>
    ? R
    : {
        [K in keyof S]: TypeOf<S[K]>
      }

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
    return this.rule({
      type: `number.min`,
      args: { limit },
      test: (v) => v >= limit,
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
    return this.rule({
      type: `number.max`,
      args: { limit },
      test: (v) => v <= limit,
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
    return this.rule({
      type: `number.greater`,
      args: { limit },
      test: (v) => v > limit,
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
    return this.rule({
      type: `number.less`,
      args: { limit },
      test: (v) => v < limit,
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
    return this.rule({
      type: `number.positive`,
      test: (v) => v > 0,
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
    return this.rule({
      type: `number.negative`,
      test: (v) => v < 0,
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
    return this.rule({
      type: `string.length`,
      args: { limit },
      test: (v) => v.length === limit,
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
    return this.rule({
      type: `string.length.min`,
      args: { limit },
      test: (v) => v.length >= limit,
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
    return this.rule({
      type: `string.length.max`,
      args: { limit },
      test: (v) => v.length <= limit,
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
    return this.rule({
      type: `string.not.empty`,
      test: (v) => v.length > 0,
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
    return this.rule({
      type: `string.pattern`,
      args: { pattern },
      test: (v) => pattern.test(v),
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

// # Null

/**
 * {@link Schema} that represent `null`
 */
export class NullSchema extends Schema<null> {
  public override is(value: unknown): value is null {
    return value === null
  }
}

/**
 * Create new instances of {@link NullSchema}
 *
 * @returns A new instances
 */
export function _null(): NullSchema {
  return nullInstance
}
const nullInstance = new NullSchema({})

// # Undefined

/**
 * {@link Schema} that represent `null`
 */
export class UndefinedSchema extends Schema<undefined> {
  public override is(value: unknown): value is undefined {
    return value === undefined
  }
}

/**
 * Create new instances of {@link UndefinedSchema}
 *
 * @returns A new instances
 */
export function _undefined(): UndefinedSchema {
  return undefinedInstance
}
const undefinedInstance = new UndefinedSchema({})

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
      value.find((v) => !this.innerSchema.is(v)) === undefined
    )
  }

  public override check(value: TypeOf<S>[]): Violation[] {
    return super
      .check(value)
      .concat(...value.map((v) => this.innerSchema.check(v)))
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
    return this.rule({
      type: `array.length`,
      args: { limit },
      test: (value) => value.length === limit,
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
    return this.rule({
      type: `array.length.min`,
      args: { limit },
      test: (value) => value.length >= limit,
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
    return this.rule({
      type: `array.length.max`,
      args: { limit },
      test: (value) => value.length <= limit,
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

// # Nullable

export interface NullableDefinition<S extends Schema>
  extends Definition<TypeOf<S> | null> {
  readonly inner: S
}

/**
 * {@link Schema} that wrap any schema as `nullable`
 */
export class NullableSchema<S extends Schema> extends Schema<
  TypeOf<S> | null,
  NullableDefinition<S>
> {
  public override is(value: unknown): value is TypeOf<S> | null {
    return value === null || this.innerSchema.is(value)
  }

  public override check(value: TypeOf<S> | null): Violation[] {
    return super
      .check(value)
      .concat(
        ...(this.innerSchema.is(value) ? this.innerSchema.check(value) : []),
      )
  }

  public get innerSchema(): S {
    return this.get('inner')
  }
}

/**
 * Create new instances of {@link NullableSchema}
 *
 * @param schema Schema to be wrapped
 * @returns A new instances
 */
export function nullable<S extends Schema>(schema: S): NullableSchema<S> {
  return new NullableSchema({ inner: schema })
}

// # Optional

export interface OptionalDefinition<S extends Schema>
  extends Definition<TypeOf<S> | undefined> {
  readonly inner: S
}

/**
 * {@link Schema} that wrap any schema as `optional`
 */
export class OptionalSchema<S extends Schema> extends Schema<
  TypeOf<S> | undefined,
  OptionalDefinition<S>
> {
  public override is(value: unknown): value is TypeOf<S> | undefined {
    return value === undefined || this.innerSchema.is(value)
  }

  public override check(value: TypeOf<S> | undefined): Violation[] {
    return super
      .check(value)
      .concat(
        ...(this.innerSchema.is(value) ? this.innerSchema.check(value) : []),
      )
  }

  public get innerSchema(): S {
    return this.get('inner')
  }
}

/**
 * Create new instances of {@link OptionalSchema}
 *
 * @param schema Schema to be wrapped
 * @returns A new instances
 */
export function optional<S extends Schema>(schema: S): OptionalSchema<S> {
  return new OptionalSchema({ inner: schema })
}

// # Any

/**
 * {@link Schema} that represent `any`
 */
export class AnySchema extends Schema<any> {
  public override is(_: unknown): _ is any {
    return true
  }
}

/**
 * Create new instances of {@link AnySchema}
 *
 * @returns A new instances
 */
export function any(): AnySchema {
  return anyInstance
}
const anyInstance = new AnySchema({})

// # Unknown

/**
 * {@link Schema} that represent `unknown`
 */
export class UnknownSchema extends Schema<unknown> {
  public override is(_: unknown): _ is unknown {
    return true
  }
}

/**
 * Create new instances of {@link UnknownSchema}
 *
 * @returns A new instances
 */
export function unknown(): UnknownSchema {
  return unknownInstance
}
const unknownInstance = new UnknownSchema({})

// # Tuple

/**
 * {@link Schema} that represent `tuple`
 */
export interface TupleDefinition<S extends Tuple<Schema>>
  extends Definition<TypeOf<S>> {
  readonly items: S
}

export class TupleSchema<S extends Tuple<Schema>> extends Schema<
  TypeOf<S>,
  TupleDefinition<S>
> {
  public override is(value: unknown): value is TypeOf<S> {
    return (
      Array.isArray(value) &&
      this.items.find((member, index) => !member.is(value[index])) === undefined
    )
  }

  public override check(value: TypeOf<S>): Violation[] {
    return super
      .check(value)
      .concat(
        ...this.items.flatMap((member, index) => member.check(value[index])),
      )
  }

  public get items(): S {
    return this.get('items')
  }
}

/**
 * Create new instances of {@link TupleSchema}
 *
 * @param members inner {@link Schema} members
 * @returns A new instances
 */
export function tuple<S extends Tuple<Schema>>(...members: S): TupleSchema<S> {
  return new TupleSchema({ items: members })
}

// # Member

export type MemberSchema = [Schema, Schema, ...Schema[]]

// ## Union

export interface UnionDefinition<S extends MemberSchema>
  extends Definition<TypeOf<S>[number]> {
  readonly members: S
}

/**
 * {@link Schema} that represent `union`
 */
export class UnionSchema<S extends MemberSchema> extends Schema<
  TypeOf<S>[number],
  UnionDefinition<S>
> {
  public override is(value: unknown): value is TypeOf<S>[number] {
    return this.members.find((member) => member.is(value)) !== undefined
  }

  public override check(value: TypeOf<S>[number]): Violation[] {
    return super
      .check(value)
      .concat(
        ...this.members.flatMap((member) =>
          member.is(value) ? member.check(value) : [],
        ),
      )
  }

  public get members(): S {
    return this.get('members')
  }
}

/**
 * Create new instances of {@link UnionSchema}
 *
 * @param members inner schema members of this union
 * @returns A new instances
 */
export function union<S extends MemberSchema>(...members: S): UnionSchema<S> {
  return new UnionSchema({ members })
}
