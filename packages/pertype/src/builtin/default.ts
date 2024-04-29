import { Codec } from '../codec'
import { BooleanSchema } from '../schema'

export class BooleanCodec implements Codec<BooleanSchema> {
  public decode(value: unknown): boolean {
    return !!value
  }

  public encode(value: boolean): unknown {
    return value
  }
}
