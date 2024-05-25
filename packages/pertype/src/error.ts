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

export class ViolationError extends Error implements Violation {
  public override readonly name: string = 'ViolationError'
  public constructor(
    public readonly type: string,
    message?: string | undefined,
    public readonly args?: AnyRecord | undefined,
  ) {
    super(message)
  }

  public toViolation(): Violation {
    return {
      type: this.type,
      message: this.message,
      args: this.args,
    }
  }
}

/** This error indicate parse is failed because input value type is not supported */
export class UnsupportedTypeError extends ViolationError {
  public override readonly name: string = 'UnsupportedTypeError'

  public constructor(value: unknown) {
    super(
      'unsupported.type',
      `Given value type of "${typeof value}" is not supported`,
      { value },
    )
  }
}

/**
 * This error indicate parse is failed because value is not supported or
 * invalid, but its type is supported
 */
export class UnsupportedValueError extends ViolationError {
  public override readonly name: string = 'UnsupportedValueError'

  public constructor(public readonly value: unknown) {
    super(
      'unsupported.value',
      `Given value of "${JSON.stringify(value)}" is not supported`,
      { value },
    )
  }
}
