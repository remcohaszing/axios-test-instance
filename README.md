# Axios Test Instance

> Test NodeJS backends using Axios

[![build status](https://github.com/remcohaszing/axios-test-instance/workflows/ci/badge.svg)](https://github.com/remcohaszing/axios-test-instance/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/remcohaszing/axios-test-instance/branch/main/graph/badge.svg)](https://codecov.io/gh/remcohaszing/axios-test-instance)
[![npm](https://img.shields.io/npm/v/axios-test-instance)](https://www.npmjs.com/package/axios-test-instance)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://jestjs.io)

## Installation

```sh
npm install axios-test-instance
```

## Usage

1. Create an Axios test instance by passing your app, which may be a Koa app, an Express app, or an
   HTTP request handler, to `setTestApp` in a `beforeAll` or `beforeEach` block.
2. Import `request` and use it in tests.

```js
import { request, setTestApp } from 'axios-test-instance'

import { app } from './app.js'

beforeAll(async () => {
  await setTestApp(app)
})
```

The method above works with Jest, but it might not work with your testing framework. For this use
case, a test instance can be created manually using `createInstance`.

```js
import { createInstance } from 'axios-test-instance'

import { app } from './app.js'

let instance

beforeAll(async () => {
  instance = await createInstance(app)
})

afterAll(async () => {
  await instance.close()
})
```

Chances are you’re already using an Axios instance in your frontend. In this case, `patchInstance`
can be used to patch this instance instead.

```js
import { patchInstance } from 'axios-test-instance'

import { app } from './app.js'
import { request } from './request.js'

let instance

beforeAll(async () => {
  instance = await patchInstance(request, app)
})

afterAll(async () => {
  await instance.close()
})
```

Now requests made using this instance, will be redirected to the app under test.

## Examples

For usages examples, have a look at our test cases:

- [Koa example](__tests__/koa.ts)
- [Express example](__tests__/express.ts)
- [Fastify example](__tests__/fastify.ts) (See
  [#2](https://github.com/remcohaszing/axios-test-instance/issues/2) for limitations)
- [HTTP callback example](__tests__/callback.ts)
- [End to end example](__tests__/e2e.ts)

## See also

- [jest-axios-snapshot](https://github.com/remcohaszing/jest-axios-snapshot) asserts axios responses
  using jest snapshots.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
