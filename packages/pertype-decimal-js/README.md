# @pertype/decimal.js

pertype - **_[/type]_** - add-on for [decimal.js](https://www.npmjs.com/package/decimal.js)

**`pertype` is still in alpha. Expect bugs and api changes!**

## Installation

```
npm install @pertype/decimal.js       # npm
yarn add @pertype/decimal.js          # yarn
bun add @pertype/decimal.js           # bun
pnpm add @pertype/decimal.js          # pnpm
```

## Basic Usage

```ts
import { decimal } from '@pertype/decimal.js'

// create decimal schema
const schema = decimal()

// type guard
if (schema.is(value)) {
  // ... value is inferred as `Decimal`
}

// decode value (coercion) to `Decimal`
schema.decode(value)

// encode value to Json compatible type
schema.encode(value)
```

## Schema

pertype come with built-in schema you can immediately use

| Name    | Typescript | Factory     |
| ------- | ---------- | ----------- |
| decimal | `Decimal`  | `decimal()` |
