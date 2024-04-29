import { Violation } from './schema'

/** This error indicate parse is failed because input value type is not supported */
export class UnsupportedTypeError extends Error {
  public override readonly name: string = 'UnsupportedTypeError'

  public constructor(value: unknown) {
    super(`Cannot parse given "${typeof value}" value type`)
  }

  public toViolation(): Violation {
    return {
      type: this.name,
      message: this.message,
      args: {
        error: this,
      },
    }
  }
}

/**
 * This error indicate parse is failed because value is not supported or
 * invalid, but its type is supported
 */
export class UnsupportedValueError extends Error {
  public override readonly name: string = 'UnsupportedValueError'

  public constructor(public readonly value: unknown) {
    super(`Cannot parse given value`)
  }

  public toViolation(): Violation {
    return {
      type: this.name,
      message: this.message,
      args: {
        error: this,
      },
    }
  }
}
