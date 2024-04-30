import { Codec, CodecMap } from '../codec'
import { UnsupportedTypeError, UnsupportedValueError } from '../error'
import {
  ArraySchema,
  BooleanSchema,
  DateSchema,
  KeySchema,
  LiteralSchema,
  MapSchema,
  NullableSchema,
  NumberSchema,
  ObjectSchema,
  OptionalSchema,
  Schema,
  SetSchema,
  StringSchema,
  SymbolSchema,
  TupleSchema,
  UnionOf,
  UnionSchema,
} from '../schema'
import { AnyRecord, Literal, Member, Tuple } from '../util/alias'
import { TypeOf } from '../util/type'

export class BooleanCodec implements Codec<BooleanSchema> {
  public constructor(public readonly schema: BooleanSchema) {}

  public decode(value: unknown): boolean {
    return !!value
  }

  public encode(value: boolean): unknown {
    return value
  }
}

export class NumberCodec implements Codec<NumberSchema> {
  public constructor(public readonly schema: NumberSchema) {}

  public decode(value: unknown): number {
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

  public encode(value: number): unknown {
    return value
  }
}

export class StringCodec implements Codec<StringSchema> {
  public constructor(public readonly schema: StringSchema) {}

  public decode(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }

    if (value === null || value === undefined) {
      return ''
    }

    return String(value)
  }

  public encode(value: string): unknown {
    return value
  }
}

export class DateCodec implements Codec<DateSchema> {
  public constructor(public readonly schema: DateSchema) {}

  public decode(value: unknown): Date {
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

  public encode(value: Date): unknown {
    return value.toUTCString()
  }
}

export class SymbolCodec implements Codec<SymbolSchema> {
  public constructor(public readonly schema: SymbolSchema) {}

  public decode(value: unknown): symbol {
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

  public encode(value: symbol): unknown {
    return value.description
  }
}

export class LiteralCodec<T extends Literal>
  implements Codec<LiteralSchema<T>>
{
  public constructor(
    public readonly schema: LiteralSchema<T>,
    private readonly literal: T,
  ) {}

  public decode(value: unknown): T {
    if (this.literal === value) {
      return this.literal
    }
    throw new UnsupportedValueError(value)
  }

  public encode(value: T): unknown {
    return value
  }
}

export class ArrayCodec<S extends Schema> implements Codec<ArraySchema<S>> {
  public constructor(
    public readonly schema: ArraySchema<S>,
    private readonly codec: Codec<S>,
  ) {}

  public decode(value: unknown): TypeOf<S>[] {
    const values = Array.isArray(value)
      ? value
      : value !== undefined && value !== null
        ? [value]
        : []
    return values.map((value) => this.codec.decode(value))
  }

  public encode(value: TypeOf<S>[]): unknown {
    return value.map((value) => this.codec.encode(value))
  }
}

export class MapCodec<K extends KeySchema, V extends Schema>
  implements Codec<MapSchema<K, V>>
{
  public constructor(
    public readonly schema: MapSchema<K, V>,
    private readonly keyCodec: Codec<K>,
    private readonly valueCodec: Codec<V>,
  ) {}

  public decode(value: unknown): Map<TypeOf<K>, TypeOf<V>> {
    const entries = this.toEntries(value).map(
      ([key, value]) =>
        [this.keyCodec.decode(key), this.valueCodec.decode(value)] as const,
    )
    return new Map(entries)
  }

  public encode(value: Map<TypeOf<K>, TypeOf<V>>): unknown {
    const entries = Array.from(value.entries()).map(([key, value]) => [
      this.keyCodec.encode(key),
      this.valueCodec.encode(value),
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
}

export class SetCodec<V extends Schema> implements Codec<SetSchema<V>> {
  public constructor(
    public readonly schema: SetSchema<V>,
    private readonly valueCodec: Codec<V>,
  ) {}

  public decode(value: unknown): Set<TypeOf<V>> {
    if (Array.isArray(value)) {
      return new Set(value.map((item) => this.valueCodec.decode(item)))
    }

    throw new UnsupportedTypeError(value)
  }

  public encode(value: Set<TypeOf<V>>): unknown {
    return Array.from(value.values()).map((item) =>
      this.valueCodec.encode(item),
    )
  }
}

export class NullableCodec<S extends Schema>
  implements Codec<NullableSchema<S>>
{
  public constructor(
    public readonly schema: NullableSchema<S>,
    private readonly codec: Codec<S>,
  ) {}

  public decode(value: unknown): TypeOf<S> | null {
    return value === null ? null : this.codec.decode(value)
  }

  public encode(value: TypeOf<S> | null): unknown {
    return value === null ? null : this.codec.encode(value)
  }
}

export class OptionalCodec<S extends Schema>
  implements Codec<OptionalSchema<S>>
{
  public constructor(
    public readonly schema: OptionalSchema<S>,
    private readonly codec: Codec<S>,
  ) {}

  public decode(value: unknown): TypeOf<S> | undefined {
    return value === undefined ? undefined : this.codec.decode(value)
  }

  public encode(value: TypeOf<S> | undefined): unknown {
    return value === undefined ? undefined : this.codec.encode(value)
  }
}

export class TupleCodec<T extends Tuple<Schema>>
  implements Codec<TupleSchema<T>>
{
  public constructor(
    public readonly schema: TupleSchema<T>,
    private readonly codecs: CodecMap<T>,
  ) {}

  public decode(value: unknown): TypeOf<T> {
    if (Array.isArray(value)) {
      return this.codecs.map((codec, index) =>
        codec.decode(value[index]),
      ) as TypeOf<T>
    }
    throw new UnsupportedTypeError(value)
  }

  public encode(value: TypeOf<T>): unknown {
    return this.codecs.map((codec, index) => codec.encode(value[index]))
  }
}

export class UnionCodec<M extends Member<Schema>>
  implements Codec<UnionSchema<M>>
{
  public constructor(
    public readonly schema: UnionSchema<M>,
    private readonly codecs: CodecMap<M>,
  ) {}

  public decode(value: unknown): UnionOf<TypeOf<M>> {
    // decode using its schema
    for (const codec of this.codecs) {
      if (codec.schema.is(value)) {
        return codec.decode(value)
      }
    }

    // brute force decoding
    for (const codec of this.codecs) {
      try {
        return codec.decode(value)
      } catch (e) {}
    }
    throw new UnsupportedTypeError(value)
  }

  public encode(value: UnionOf<TypeOf<M>>): unknown {
    for (const codec of this.codecs) {
      if (codec.schema.is(value)) {
        return codec.encode(value)
      }
    }
    throw new UnsupportedTypeError(value)
  }
}

export class ObjectCodec<R extends AnyRecord<Schema>>
  implements Codec<ObjectSchema<R>>
{
  public constructor(
    public readonly schema: ObjectSchema<R>,
    private readonly codecs: CodecMap<R>,
  ) {}

  public decode(value: unknown): TypeOf<R> {
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries<Codec<Schema>>(this.codecs).map(
        ([key, codec]) => [key, codec.decode((value as AnyRecord)[key])],
      )
      return Object.fromEntries(entries)
    }
    throw new UnsupportedTypeError(value)
  }

  public encode(value: TypeOf<R>): unknown {
    const entries = Object.entries<Codec<Schema>>(this.codecs).map(
      ([key, codec]) => [key, codec.encode(value[key])],
    )
    return Object.fromEntries(entries)
  }
}
