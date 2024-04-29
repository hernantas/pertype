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
