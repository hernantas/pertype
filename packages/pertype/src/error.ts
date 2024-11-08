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

  /**
   * Path to the cause of violations
   */
  readonly path?: string | undefined
}

export class ViolationError extends Error {
  public override readonly name: string = 'ViolationError'

  public constructor(private readonly violation: Violation) {
    if (violation.path !== undefined) {
      super(`${violation.path}: ${violation.message}`)
    } else {
      super(violation.message)
    }
  }

  public toViolation(): Violation {
    return this.violation
  }
}

/** This error indicate parse is failed because input value type is not supported */
export class UnsupportedTypeError extends ViolationError {
  public override readonly name: string = 'UnsupportedTypeError'

  public constructor(
    public readonly value: unknown,
    public readonly path?: string | undefined,
  ) {
    super({
      type: 'unsupported.type',
      message: `Given value type of "${typeof value}" is not supported`,
      args: { value },
      path,
    })
  }
}

/**
 * This error indicate parse is failed because value is not supported or
 * invalid, but its type is supported
 */
export class UnsupportedValueError extends ViolationError {
  public override readonly name: string = 'UnsupportedValueError'

  public constructor(
    public readonly value: unknown,
    public readonly path?: string | undefined,
  ) {
    super({
      type: 'unsupported.value',
      message: `Given value of "${JSON.stringify(value)}" is not supported`,
      args: { value },
      path,
    })
  }
}
