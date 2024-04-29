import { Codec } from '../codec'
import { UnsupportedTypeError, UnsupportedValueError } from '../error'
import {
  ArraySchema,
  BooleanSchema,
  DateSchema,
  LiteralSchema,
  NumberSchema,
  Schema,
  StringSchema,
  SymbolSchema,
} from '../schema'
import { Literal } from '../util/alias'
import { TypeOf } from '../util/type'

export class BooleanCodec implements Codec<BooleanSchema> {
  public decode(value: unknown): boolean {
    return !!value
  }

  public encode(value: boolean): unknown {
    return value
  }
}

export class NumberCodec implements Codec<NumberSchema> {
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
  public constructor(private readonly literal: T) {}

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
  public constructor(private readonly codec: Codec<S>) {}

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
