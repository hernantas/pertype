import { Schema, UnsupportedTypeError, UnsupportedValueError } from 'pertype'
import { Decimal } from 'decimal.js'

export class DecimalSchema extends Schema<Decimal, string> {
  private static readonly instance = new DecimalSchema({})

  public static create(): DecimalSchema {
    return this.instance
  }

  public override is(value: unknown): value is Decimal {
    return value instanceof Decimal
  }

  public override decode(value: unknown): Decimal {
    if (this.is(value)) {
      return value
    }

    if (value === undefined || value === null) {
      return new Decimal('0')
    }

    if (typeof value === 'string' || typeof value === 'number') {
      try {
        return new Decimal(value)
      } catch {
        throw new UnsupportedValueError(value)
      }
    }
    throw new UnsupportedTypeError(value)
  }

  public override encode(value: Decimal): string {
    return value.toString()
  }
}

export function decimal(): DecimalSchema {
  return DecimalSchema.create()
}
