import { ImmutableBuilder } from './builder'
import { UnsupportedTypeError, UnsupportedValueError, Violation } from './error'
import {
  AnyRecord,
  Constructor,
  Key,
  Literal,
  Member,
  Tuple,
} from './util/alias'
import { UnionOf, UnionDefinition, IntersectOf } from './util/helpers'
import { Input, Output, OutputOf, Type, TypeOf } from './util/type'

/**
 * Function to test if value is within constraint
 */
export type TestConstraint<T> = (value: T) => boolean

/** Constraint to determine valid value */
export interface Constraint<T> extends Violation {
  /** Check if given value is not violating the constraint */
  readonly test: TestConstraint<T>
}

export interface ValidationSuccess<T> {
  readonly valid: true
  readonly value: T
}

export interface ValidationFailed {
  readonly valid: false
  readonly violations: Violation[]
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailed

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
    O = T,
    I = unknown,
    D extends Definition<T> = Definition<T>,
  >
  extends ImmutableBuilder<D>
  implements Type<T>, Output<O>, Input<I>
{
  /** Ignore */
  public readonly __type!: T
  /** Ignore */
  public readonly __output!: O
  /** Ignore */
  public readonly __input!: I

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

  /**
   * Coerced given input value of `I` type to `T` type
   *
   * @param value Input to be coerced
   */
  public abstract decode(value: I): T

  /**
   * Coerced given value of `T` type to `O` output type
   *
   * @param value Value to be coerced
   */
  public abstract encode(value: T): O

  /**
   * Wrap this {@link Schema} instance with {@link ArraySchema}
   *
   * @returns A new instance of {@link ArraySchema}
   */
  public array(): ArraySchema<this> {
    return array(this)
  }

  /**
   * Wrap this {@link Schema} instance with {@link OptionalSchema}
   *
   * @returns A new instance of {@link OptionalSchema}
   */
  public optional(): OptionalSchema<this> {
    return optional(this)
  }

  /**
   * Wrap this {@link Schema} instance with {@link NullableSchema}
   *
   * @returns A new instance of {@link NullableSchema}
   */
  public nullable(): NullableSchema<this> {
    return nullable(this)
  }
}

// # Boolean

/**
 * {@link Schema} that represent `boolean`
 */
export class BooleanSchema extends Schema<boolean> {
  private static readonly instance = new BooleanSchema({})

  public static create(): BooleanSchema {
    return this.instance
  }

  public override is(value: unknown): value is boolean {
    return typeof value === 'boolean'
  }

  public override decode(value: unknown): boolean {
    return !!value
  }

  public override encode(value: boolean): boolean {
    return value
  }
}

/**
 * Create new instance of {@link BooleanSchema}
 *
 * @returns A new instance
 */
export function boolean(): BooleanSchema {
  return BooleanSchema.create()
}

/**
 * Create new instance of {@link BooleanSchema}
 *
 * @returns A new instance
 */
export function bool(): BooleanSchema {
  return BooleanSchema.create()
}

// # Number

/**
 * {@link Schema} that represent `number`
 */
export class NumberSchema extends Schema<number> {
  private static readonly instance = new NumberSchema({})

  public static create(): NumberSchema {
    return this.instance
  }

  public override is(value: unknown): value is number {
    return typeof value === 'number'
  }

  public override decode(value: unknown): number {
    if (typeof value === 'number') {
      return value
    }

    if (value === undefined) {
      return 0
    }

    if (value === 'NaN') {
      return NaN
    } else if (value === '-NaN') {
      return -NaN
    }

    // try automatic conversion
    return Number(value)
  }

  public override encode(value: number): number {
    return value
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
  return NumberSchema.create()
}

// # String

const pattern = {
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  email:
    /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
}

/**
 * {@link Schema} that represent `string`
 */
export class StringSchema extends Schema<string> {
  private static readonly instance = new StringSchema({})

  public static create(): StringSchema {
    return this.instance
  }

  public override is(value: unknown): value is string {
    return typeof value === 'string'
  }

  public override decode(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }

    if (value === null || value === undefined) {
      return ''
    }

    return String(value)
  }

  public override encode(value: string): string {
    return value
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

  public base64(message: string = `must be valid base64 string`): this {
    return this.rule({
      type: 'string.pattern.base64',
      test: (v) => pattern.base64.test(v),
      message,
    })
  }

  public email(message: string = `must be valid email`): this {
    return this.rule({
      type: 'string.pattern.email',
      test: (v) => pattern.email.test(v),
      message,
    })
  }

  public url(message: string = 'must be valid url string'): this {
    return this.rule({
      type: 'string.pattern.url',
      test: (v) => {
        try {
          new URL(v)
          return true
        } catch (_) {
          return false
        }
      },
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
  return StringSchema.create()
}

// # Date

/**
 * {@link Schema} that represent `date`
 */
export class DateSchema extends Schema<Date, string> {
  private static readonly instance = new DateSchema({})

  public static create(): DateSchema {
    return this.instance
  }

  public override is(value: unknown): value is Date {
    return value instanceof Date
  }

  public override decode(value: unknown): Date {
    if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        throw new UnsupportedValueError(value)
      }
      return date
    }

    if (value instanceof Date) {
      return value
    }

    throw new UnsupportedTypeError(value)
  }

  public override encode(value: Date): string {
    return value.toUTCString()
  }

  /**
   * Add new validation constraint that check minimum date (`>=`)
   *
   * @param limit Minimum date
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public min(
    limit: Date,
    message: string = `must greater than or equal to ${limit}`,
  ): this {
    return this.rule({
      type: `date.min`,
      args: { limit },
      test: (v) => v.getTime() >= limit.getTime(),
      message,
    })
  }

  /**
   * Add new validation constraint that check maximum date (`<=`)
   *
   * @param limit Maximum date
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public max(
    limit: Date,
    message: string = `must be less than or equal to ${limit}`,
  ): this {
    return this.rule({
      type: `date.max`,
      args: { limit },
      test: (v) => v.getTime() <= limit.getTime(),
      message,
    })
  }

  /**
   * Add new validation constraint that check date to be greater than given
   * date (`>`)
   *
   * @param limit Limit date
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public greater(
    limit: Date,
    message: string = `must be greater than ${limit}`,
  ): this {
    return this.rule({
      type: `date.greater`,
      args: { limit },
      test: (v) => v.getTime() > limit.getTime(),
      message,
    })
  }

  /**
   * Add new validation constraint that check date to be less than given
   * date (`<`)
   *
   * @param limit Limit date
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public less(
    limit: Date,
    message: string = `must be less than ${limit}`,
  ): this {
    return this.rule({
      type: `date.less`,
      args: { limit },
      test: (v) => v.getTime() < limit.getTime(),
      message,
    })
  }
}

/**
 * Create new instances of {@link DateSchema}
 *
 * @returns A new instances
 */
export function date(): DateSchema {
  return DateSchema.create()
}

// # Symbol

/**
 * {@link Schema} that represent `symbol`
 */
export class SymbolSchema extends Schema<symbol, string> {
  private static readonly instance = new SymbolSchema({})

  public static create(): SymbolSchema {
    return this.instance
  }

  public override is(value: unknown): value is symbol {
    return typeof value === 'symbol'
  }

  public override decode(value: unknown): symbol {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value === undefined
    ) {
      return Symbol(value)
    }

    if (typeof value === 'symbol') {
      return value
    }

    throw new UnsupportedTypeError(value)
  }

  public override encode(value: symbol): string {
    return value.description ?? ''
  }

  /**
   * Add new validation constraint that check if symbol instance is equal.
   * Please note that symbol has unique reference check which define its
   * equality rules
   *
   * @param symbol Symbol instance for validation
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public instanceOf(
    symbol: symbol,
    message: string = `must be instance of passed "${symbol.description}" symbol`,
  ): this {
    return this.rule({
      type: 'symbol.instance',
      args: { symbol },
      test: (value) => symbol === value,
      message,
    })
  }
}

/**
 * Create new instances of {@link SymbolSchema}
 *
 * @returns A new instances
 */
export function symbol(): SymbolSchema {
  return SymbolSchema.create()
}

// # Null

/**
 * {@link Schema} that represent `null`
 */
export class NullSchema extends Schema<null> {
  private static readonly instance = new NullSchema({})

  public static create(): NullSchema {
    return this.instance
  }

  public override is(value: unknown): value is null {
    return value === null
  }

  public override decode(value: unknown): null {
    if (this.is(value)) {
      return value
    }
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: null): null {
    return value
  }
}

/**
 * Create new instances of {@link NullSchema}
 *
 * @returns A new instances
 */
export function _null(): NullSchema {
  return NullSchema.create()
}

// # Undefined

/**
 * {@link Schema} that represent `null`
 */
export class UndefinedSchema extends Schema<undefined> {
  private static readonly instance = new UndefinedSchema({})

  public static create(): UndefinedSchema {
    return this.instance
  }

  public override is(value: unknown): value is undefined {
    return value === undefined
  }

  public override decode(value: unknown): undefined {
    if (this.is(value)) {
      return value
    }
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: undefined): undefined {
    return value
  }
}

/**
 * Create new instances of {@link UndefinedSchema}
 *
 * @returns A new instances
 */
export function _undefined(): UndefinedSchema {
  return UndefinedSchema.create()
}

// # Any

/**
 * {@link Schema} that represent `any`
 */
export class AnySchema extends Schema<any> {
  private static readonly instance = new AnySchema({})

  public static create(): AnySchema {
    return this.instance
  }

  public override is(_: unknown): _ is any {
    return true
  }

  public override decode(value: unknown): any {
    return value
  }

  public override encode(value: any): any {
    return value
  }
}

/**
 * Create new instances of {@link AnySchema}
 *
 * @returns A new instances
 */
export function any(): AnySchema {
  return AnySchema.create()
}

// # Unknown

/**
 * {@link Schema} that represent `unknown`
 */
export class UnknownSchema extends Schema<unknown> {
  private static readonly instance = new UnknownSchema({})

  public static create(): UnknownSchema {
    return this.instance
  }

  public override is(_: unknown): _ is unknown {
    return true
  }

  public override decode(value: unknown): unknown {
    return value
  }

  public override encode(value: unknown): unknown {
    return value
  }
}

/**
 * Create new instances of {@link UnknownSchema}
 *
 * @returns A new instances
 */
export function unknown(): UnknownSchema {
  return UnknownSchema.create()
}

// # Literal

export interface LiteralDefinition<T extends Literal> extends Definition<T> {
  readonly value: T
}

export class LiteralSchema<T extends Literal> extends Schema<
  T,
  T,
  unknown,
  LiteralDefinition<T>
> {
  public static create<T extends Literal>(value: T): LiteralSchema<T> {
    return new LiteralSchema({ value })
  }

  public override is(value: unknown): value is T {
    return this.value === value
  }

  public override decode(value: unknown): T {
    if (this.value === value) {
      return this.value
    }
    throw new UnsupportedValueError(value)
  }

  public override encode(value: T): T {
    return value
  }

  public get value(): T {
    return this.get('value')
  }
}

export function literal<T extends Literal>(value: T): LiteralSchema<T> {
  return LiteralSchema.create(value)
}

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
  OutputOf<S>[],
  unknown,
  ArrayDefinition<S>
> {
  public static create<S extends Schema>(schema: S): ArraySchema<S> {
    return new ArraySchema({ inner: schema })
  }

  public override is(value: unknown): value is TypeOf<S>[] {
    return (
      Array.isArray(value) && value.find((v) => !this.inner.is(v)) === undefined
    )
  }

  public override check(value: TypeOf<S>[]): Violation[] {
    return super.check(value).concat(...value.map((v) => this.inner.check(v)))
  }

  public override decode(value: unknown): TypeOf<S>[] {
    const values = Array.isArray(value)
      ? value
      : value !== undefined && value !== null
        ? [value]
        : []
    return values.map((value) => this.inner.decode(value))
  }

  public override encode(value: TypeOf<S>[]): OutputOf<S>[] {
    return value.map((value) => this.inner.encode(value))
  }

  /**
   * Inner schema
   */
  public get inner(): S {
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
  return ArraySchema.create(schema)
}

// # Map

export type KeySchema = StringSchema | NumberSchema | SymbolSchema

export interface MapDefinition<K extends KeySchema, V extends Schema>
  extends Definition<Map<TypeOf<K>, TypeOf<V>>> {
  readonly key: K
  readonly value: V
}

export class MapSchema<K extends KeySchema, V extends Schema> extends Schema<
  Map<TypeOf<K>, TypeOf<V>>,
  Record<OutputOf<K>, OutputOf<V>>,
  unknown,
  MapDefinition<K, V>
> {
  public static create<K extends KeySchema, V extends Schema>(
    key: K,
    value: V,
  ): MapSchema<K, V> {
    return new MapSchema({ key, value })
  }

  public override is(value: unknown): value is Map<TypeOf<K>, TypeOf<V>> {
    return (
      value instanceof Map &&
      Array.from(value.entries()).find(
        ([key, value]) => !(this.key.is(key) && this.value.is(value)),
      ) === undefined
    )
  }

  public override check(value: Map<TypeOf<K>, TypeOf<V>>): Violation[] {
    return super
      .check(value)
      .concat(
        ...Array.from(value.entries()).flatMap(([key, value]) =>
          this.key.check(key as never).concat(this.value.check(value)),
        ),
      )
  }

  public override decode(value: unknown): Map<TypeOf<K>, TypeOf<V>> {
    const entries = this.toEntries(value).map(
      ([key, value]) =>
        [this.key.decode(key), this.value.decode(value)] as const,
    )
    return new Map(entries) as Map<TypeOf<K>, TypeOf<V>>
  }

  public override encode(
    value: Map<TypeOf<K>, TypeOf<V>>,
  ): Record<OutputOf<K>, OutputOf<V>> {
    const entries = Array.from(value.entries()).map(([key, value]) => [
      this.key.encode(key as never),
      this.value.encode(value),
    ])
    return Object.fromEntries(entries)
  }

  private toEntries(value: unknown): [any, any][] {
    if (Array.isArray(value)) {
      return value.map((item) =>
        Array.isArray(item) ? [item[0], item[1]] : [item, undefined],
      )
    }

    if (value instanceof Map) {
      return Array.from(value.entries())
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
    }

    throw new UnsupportedTypeError(value)
  }

  public get key(): K {
    return this.get('key')
  }

  public get value(): V {
    return this.get('value')
  }

  /**
   * Add new validation constraint to check map size (`=`)
   *
   * @param limit Limit of map size
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public size(
    limit: number,
    message: string = `must be at ${limit} size`,
  ): this {
    return this.rule({
      type: 'map.size',
      args: { limit },
      test: (value) => value.size === limit,
      message,
    })
  }
}

/**
 * Create new instances of {@link MapSchema}
 *
 * @param key Schema used for the key
 * @param value Schema used for the value
 * @returns A new instances
 */
export function map<K extends KeySchema, V extends Schema>(
  key: K,
  value: V,
): MapSchema<K, V> {
  return MapSchema.create(key, value)
}

// # Set

export interface SetDefinition<V extends Schema>
  extends Definition<Set<TypeOf<V>>> {
  readonly value: V
}

export class SetSchema<V extends Schema> extends Schema<
  Set<TypeOf<V>>,
  OutputOf<V>[],
  unknown,
  SetDefinition<V>
> {
  public static create<V extends Schema>(value: V): SetSchema<V> {
    return new SetSchema({ value })
  }

  public override is(value: unknown): value is Set<TypeOf<V>> {
    return (
      value instanceof Set &&
      Array.from(value.values()).find((value) => !this.value.is(value)) ===
        undefined
    )
  }

  public override check(value: Set<TypeOf<V>>): Violation[] {
    return super
      .check(value)
      .concat(
        ...Array.from(value.values()).flatMap((value) =>
          this.value.check(value),
        ),
      )
  }

  public override decode(value: unknown): Set<TypeOf<V>> {
    if (Array.isArray(value)) {
      return new Set(value.map((item) => this.value.decode(item)))
    }

    throw new UnsupportedTypeError(value)
  }

  public override encode(value: Set<TypeOf<V>>): OutputOf<V>[] {
    return Array.from(value.values()).map((item) => this.value.encode(item))
  }

  public get value(): V {
    return this.get('value')
  }

  /**
   * Add new validation constraint to check set size (`=`)
   *
   * @param limit Limit of set size
   * @param message Optional message when rule is violated
   * @returns A new instance with new rules added
   */
  public size(
    limit: number,
    message: string = `must be at ${limit} size`,
  ): this {
    return this.rule({
      type: 'set.size',
      args: { limit },
      test: (value) => value.size === limit,
      message,
    })
  }
}

/**
 * Create new instances of {@link Set}
 *
 * @param value Schema used for the value
 * @returns A new instances
 */
export function set<V extends Schema>(value: V): SetSchema<V> {
  return SetSchema.create(value)
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
  OutputOf<S> | null,
  unknown,
  NullableDefinition<S>
> {
  public static create<S extends Schema>(schema: S): NullableSchema<S> {
    return new NullableSchema({ inner: schema })
  }

  public override is(value: unknown): value is TypeOf<S> | null {
    return value === null || this.inner.is(value)
  }

  public override check(value: TypeOf<S> | null): Violation[] {
    return super
      .check(value)
      .concat(...(this.inner.is(value) ? this.inner.check(value) : []))
  }

  public override decode(value: unknown): TypeOf<S> | null {
    return value === null ? null : this.inner.decode(value)
  }

  public override encode(value: TypeOf<S> | null): OutputOf<S> | null {
    return value === null ? null : this.inner.encode(value)
  }

  public get inner(): S {
    return this.get('inner')
  }

  /**
   * Make this schema non nullable
   *
   * @returns inner schema
   */
  public nonNullable(): S {
    return this.inner
  }
}

/**
 * Create new instances of {@link NullableSchema}
 *
 * @param schema Schema to be wrapped
 * @returns A new instances
 */
export function nullable<S extends Schema>(schema: S): NullableSchema<S> {
  return NullableSchema.create(schema)
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
  OutputOf<S> | undefined,
  unknown,
  OptionalDefinition<S>
> {
  public static create<S extends Schema>(schema: S): OptionalSchema<S> {
    return new OptionalSchema({ inner: schema })
  }

  public override is(value: unknown): value is TypeOf<S> | undefined {
    return value === undefined || this.inner.is(value)
  }

  public override check(value: TypeOf<S> | undefined): Violation[] {
    return super
      .check(value)
      .concat(...(this.inner.is(value) ? this.inner.check(value) : []))
  }

  public override decode(value: unknown): TypeOf<S> | undefined {
    return value === undefined ? undefined : this.inner.decode(value)
  }

  public override encode(
    value: TypeOf<S> | undefined,
  ): OutputOf<S> | undefined {
    return value === undefined ? undefined : this.inner.encode(value)
  }

  public get inner(): S {
    return this.get('inner')
  }

  /**
   * Make this schema required
   *
   * @returns Inner schema
   */
  public required(): S {
    return this.inner
  }
}

/**
 * Create new instances of {@link OptionalSchema}
 *
 * @param schema Schema to be wrapped
 * @returns A new instances
 */
export function optional<S extends Schema>(schema: S): OptionalSchema<S> {
  return OptionalSchema.create(schema)
}

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
  OutputOf<S>,
  unknown,
  TupleDefinition<S>
> {
  public static create<S extends Tuple<Schema>>(...members: S): TupleSchema<S> {
    return new TupleSchema({ items: members })
  }

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

  public override decode(value: unknown): TypeOf<S> {
    if (Array.isArray(value)) {
      return this.items.map((schema, index) =>
        schema.decode(value[index]),
      ) as TypeOf<S>
    }
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: TypeOf<S>): OutputOf<S> {
    return this.items.map((schema, index) =>
      schema.encode(value[index]),
    ) as OutputOf<S>
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
  return TupleSchema.create(...members)
}

// # Union

/**
 * {@link Schema} that represent `union`
 */
export class UnionSchema<S extends Member<Schema>> extends Schema<
  UnionOf<TypeOf<S>>,
  UnionOf<OutputOf<S>>,
  unknown,
  UnionDefinition<S>
> {
  public static create<S extends Member<Schema>>(
    ...members: S
  ): UnionSchema<S> {
    return new UnionSchema({ members })
  }

  public override is(value: unknown): value is UnionOf<TypeOf<S>> {
    return this.members.find((member) => member.is(value)) !== undefined
  }

  public override check(value: UnionOf<TypeOf<S>>): Violation[] {
    return super
      .check(value)
      .concat(
        ...this.members.flatMap((member) =>
          member.is(value) ? member.check(value) : [],
        ),
      )
  }

  public override decode(value: unknown): UnionOf<TypeOf<S>> {
    // decode using its schema
    for (const member of this.members) {
      if (member.is(value)) {
        return member.decode(value)
      }
    }

    // brute force decoding
    for (const member of this.members) {
      try {
        return member.decode(value)
      } catch (e) {}
    }
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: UnionOf<TypeOf<S>>): UnionOf<OutputOf<S>> {
    for (const member of this.members) {
      if (member.is(value)) {
        return member.encode(value)
      }
    }
    throw new UnsupportedTypeError(value)
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
export function union<S extends Member<Schema>>(...members: S): UnionSchema<S> {
  return UnionSchema.create(...members)
}

// # Intersect

export interface IntersectDefinition<S extends Member<Schema>>
  extends Definition<IntersectOf<TypeOf<S>>> {
  readonly members: S
}

/**
 * {@link Schema} that represent `intersection`
 */
export class IntersectSchema<S extends Member<Schema>> extends Schema<
  IntersectOf<TypeOf<S>>,
  IntersectOf<OutputOf<S>>,
  unknown,
  IntersectDefinition<S>
> {
  public static create<S extends Member<Schema>>(
    ...members: S
  ): IntersectSchema<S> {
    return new IntersectSchema({ members })
  }

  public override is(value: unknown): value is IntersectOf<TypeOf<S>> {
    return this.members.find((member) => !member.is(value)) === undefined
  }

  public override check(value: IntersectOf<TypeOf<S>>): Violation[] {
    return super
      .check(value)
      .concat(...this.members.flatMap((member) => member.check(value)))
  }

  public override decode(value: unknown): IntersectOf<TypeOf<S>> {
    return this.members
      .map((member) => member.decode(value))
      .filter((v) => typeof v === 'object')
      .reduce((result, v) => merge(result, v), {})
  }

  public override encode(
    value: IntersectOf<TypeOf<S>>,
  ): IntersectOf<OutputOf<S>> {
    return this.members
      .map((member) => member.encode(value))
      .filter((v) => typeof v === 'object')
      .reduce((result, v) => merge(result, v), {})
  }

  public get members(): S {
    return this.get('members')
  }
}

/**
 * Merge 2 given object
 *
 * @param base Base to be merged
 * @param target Target to be merged
 * @returns A new object from the merger
 */
function merge<T, U>(base: T, target: U): T & U {
  return {
    ...target,
    ...base,
  }
}

/**
 * Create new instances of {@link IntersectSchema}
 *
 * @returns A new instances
 */
export function intersect<S extends Member<Schema>>(
  ...members: S
): IntersectSchema<S> {
  return IntersectSchema.create(...members)
}

// # Object

export interface ObjectDefinition<S extends AnyRecord<Schema>>
  extends Definition<TypeOf<S>> {
  readonly properties: S
}

/**
 * {@link Schema} that represent `object` with properties
 */
export class ObjectSchema<S extends AnyRecord<Schema>> extends Schema<
  TypeOf<S>,
  OutputOf<S>,
  unknown,
  ObjectDefinition<S>
> {
  public static create<S extends AnyRecord<Schema>>(
    properties: S,
  ): ObjectSchema<S> {
    return new ObjectSchema({ properties })
  }

  public override is(value: unknown): value is TypeOf<S> {
    return (
      typeof value === 'object' &&
      value !== null &&
      this.entries.find(
        ([key, prop]) => !prop.is((value as TypeOf<S>)[key]),
      ) === undefined
    )
  }

  public override check(value: TypeOf<S>): Violation[] {
    return super
      .check(value)
      .concat(
        ...this.entries.flatMap(([key, prop]) =>
          prop.check((value as TypeOf<S>)[key]),
        ),
      )
  }

  public override decode(value: unknown): TypeOf<S> {
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(this.properties).map(([key, schema]) => [
        key,
        schema.decode((value as AnyRecord)[key]),
      ])
      return Object.fromEntries(entries)
    }
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: TypeOf<S>): OutputOf<S> {
    const entries = Object.entries(this.properties).map(([key, schema]) => [
      key,
      schema.encode(value[key]),
    ])
    return Object.fromEntries(entries)
  }

  public get properties(): S {
    return this.get('properties')
  }

  public get props(): S {
    return this.get('properties')
  }

  public get keys(): string[] {
    return Object.keys(this.props)
  }

  public get values(): Schema[] {
    return Object.values(this.props)
  }

  public get entries(): [string, Schema][] {
    return Object.entries(this.properties)
  }

  public extends<P extends AnyRecord<Schema>>(
    extension: P,
  ): ObjectSchema<S & P> {
    type Def = Omit<ObjectDefinition<S>, 'properties'>
    return new ObjectSchema({
      ...(this.definition as Def),
      properties: Object.fromEntries([
        ...Object.entries(this.properties),
        ...Object.entries(extension),
      ]) as S & P,
    })
  }

  public pick<K extends keyof S>(...keys: K[]): ObjectSchema<Pick<S, K>> {
    type Def = Omit<ObjectDefinition<S>, 'properties'>
    return new ObjectSchema({
      ...(this.definition as Def),
      properties: Object.fromEntries(
        Object.entries(this.properties)
          .filter(([key]) => keys.includes(key as K))
          .map(([key, schema]) => [key, schema]),
      ) as Pick<S, K>,
    })
  }

  public omit<K extends keyof S>(...keys: K[]): ObjectSchema<Omit<S, K>> {
    type Def = Omit<ObjectDefinition<S>, 'properties'>
    return new ObjectSchema({
      ...(this.definition as Def),
      properties: Object.fromEntries(
        Object.entries(this.properties)
          .filter(([key]) => !keys.includes(key as K))
          .map(([key, schema]) => [key, schema]),
      ) as Omit<S, K>,
    })
  }
}

export type AnyObjectSchema = ObjectSchema<AnyRecord<Schema>>

/**
 * Create new instances of {@link ObjectSchema}
 *
 * @returns A new instances
 */
export function object<S extends AnyRecord<Schema>>(
  properties: S,
): ObjectSchema<S> {
  return ObjectSchema.create(properties)
}

// # Type

export interface TypeDefinition<T, Args extends any[]> extends Definition<T> {
  readonly ctor: Constructor<T, Args>
}

/**
 * {@link Schema} that represent `class` object
 */
export class TypeSchema<T, Args extends any[]> extends Schema<
  T,
  T,
  unknown,
  TypeDefinition<T, Args>
> {
  public static create<T, Args extends any[]>(
    ctor: Constructor<T, Args>,
  ): TypeSchema<T, Args> {
    return new TypeSchema({ ctor })
  }

  public override is(value: unknown): value is T {
    return value instanceof this.ctor
  }

  public override decode(value: unknown): T {
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: T): T {
    throw new UnsupportedTypeError(value)
  }

  /**
   * Get constructor of the type
   */
  public get ctor(): Constructor<T, Args> {
    return this.get('ctor')
  }
}

/**
 * Create new instances of {@link TypeSchema}
 *
 * @returns A new instances
 */
export function type<T, Args extends any[]>(
  ctor: Constructor<T, Args>,
): TypeSchema<T, Args> {
  return TypeSchema.create(ctor)
}

export const t = {
  boolean,
  bool,
  number,
  string,
  date,
  symbol,
  null: _null,
  undefined: _undefined,
  any,
  unknown,
  literal,
  array,
  map,
  set,
  nullable,
  optional,
  tuple,
  union,
  intersect,
  object,
  type,
}
