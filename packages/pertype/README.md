# pertype

pertype - **_[/type]_** - is a typescript-first schema declaration, validation library and contextual transformation. Inspired from [io-ts](https://www.npmjs.com/package/io-ts) and [joi](https://www.npmjs.com/package/joi).

**`pertype` is still in alpha. Expect bugs and api changes!**

## Features

- Typescript-first library which support type inference and schema type properly.
- Support class-based or schema-based declaration
- Powerful schema declaration, can be used to type-guard and validation. Can also be reused for multiple use case such as json, bson, or other
- Type coercion, allow data transformation from/to different type for input/output.
- Fast and Extensible, build your own schema/codec/parser

## Installation

```
npm install pertype       # npm
yarn add pertype          # yarn
bun add pertype           # bun
pnpm add pertype          # pnpm
```

## Basic Usage

```ts
import { t } from 'pertype'

// create string
const schema = t.string()

// type guard
if (schema.is(value)) {
  // ... value is inferred as `string`
}

// decode value (coercion) to `string`
schema.decode(value)

// encode value to Json compatible type
schema.encode(value)
```

## Schema

pertype come with built-in schema you can immediately use

| Name      | Typescript       | Factory                                           |
| --------- | ---------------- | ------------------------------------------------- |
| string    | `string`         | `t.string()`                                      |
| number    | `number`         | `t.number()`                                      |
| boolean   | `boolean`        | `t.boolean()`                                     |
| literal   | `'A'`            | `t.literal('A')`                                  |
| unknown   | `unknown`        | `t.unknown()`                                     |
| any       | `any`            | `t.any()`                                         |
| null      | `null`           | `t.null()`                                        |
| nullable  | `A \| null`      | `t.nullable(t.type(A))` or `t.type(A).nullable()` |
| undefined | `undefined`      | `t.undefined()`                                   |
| optional  | `A \| undefined` | `t.optional(t.type(A))` or `t.type(A).optional()` |
| array     | `array`          | `t.array(T)` or `t.`                              |
| type      | `A`              | `t.type(A)`                                       |
| object    | `{a:A}`          | `t.object({a: t.type(A)})`                        |
| union     | `A \| B`         | `t.union(t.type(A), t.type(B))`                   |
| intersect | `A & B`          | `t.intersect(t.type(A), t.type(B))`               |
