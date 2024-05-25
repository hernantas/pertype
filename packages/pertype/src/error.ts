import { AnyRecord } from './util/alias'

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
  readonly args?: AnyRecord | undefined
}

/** This error indicate parse is failed because input value type is not supported */
export class UnsupportedTypeError extends Error {
  public override readonly name: string = 'UnsupportedTypeError'

  public constructor(value: unknown) {
    super(`Cannot parse given "${typeof value}" value type`)
  }

  public toViolation(): Violation {
    return {
      type: 'unsupported.type',
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
      type: 'unsupported.value',
      message: this.message,
      args: {
        error: this,
      },
    }
  }
}
