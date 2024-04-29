import { Schema } from './schema'
import { TypeOf } from './util/type'

export interface Decoder<S extends Schema, I = unknown> {
  decode(value: I): TypeOf<S>
}

export interface Encoder<S extends Schema, O = unknown> {
  encode(value: TypeOf<S>): O
}

export interface Codec<S extends Schema, O = unknown, I = unknown>
  extends Decoder<S, I>,
    Encoder<S, O> {}
