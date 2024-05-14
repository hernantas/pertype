import { Definition, Schema } from '../schema'
import { Member } from './alias'
import { TypeOf } from './type'

/**
 * Convert {@link Member} type into union
 */
export type UnionOf<T extends Member<any>> = T[number]

export interface UnionDefinition<S extends Member<Schema>>
  extends Definition<UnionOf<TypeOf<S>>> {
  readonly members: S
}
