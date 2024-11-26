import { AnyRecord, Tuple } from './util/alias'

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

  public constructor(public readonly violations: Tuple<Violation>) {
    super(violations[0].message)
  }

  public is(error: unknown): error is ViolationError {
    return error instanceof ViolationError
  }
}

/** This error indicate parse is failed because input value type is not supported */
export class UnsupportedTypeError extends ViolationError {
  public override readonly name: string = 'UnsupportedTypeError'

  public constructor(
    public readonly value: unknown,
    public readonly path?: string | undefined,
  ) {
    super([
      {
        type: 'unsupported.type',
        message: `Unsupported value type of "${typeof value}"`,
        args: { value },
        path,
      },
    ])
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
    super([
      {
        type: 'unsupported.value',
        message: `Unsupported value of "${JSON.stringify(value)}"`,
        args: { value },
        path,
      },
    ])
  }
}
