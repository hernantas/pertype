import { Schema } from './schema'
import { TypeOf } from './util/type'

export interface Decoder<S extends Schema = Schema, I = unknown> {
  decode(value: I): TypeOf<S>
}

export interface Encoder<S extends Schema = Schema, O = unknown> {
  encode(value: TypeOf<S>): O
}

export interface Codec<S extends Schema = Schema, O = unknown, I = unknown>
  extends Decoder<S, I>,
    Encoder<S, O> {
  get schema(): S
}

export type CodecOf<T> = {
  [K in keyof T]: T[K] extends Schema ? Codec<T[K]> : never
}
