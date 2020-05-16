# Axios Test Instance

> Test NodeJS backends using Axios

[![build status](https://github.com/remcohaszing/axios-test-instance/workflows/NodeJS/badge.svg)](https://github.com/remcohaszing/axios-test-instance/actions)
[![codecov](https://codecov.io/gh/remcohaszing/axios-test-instance/branch/master/graph/badge.svg)](https://codecov.io/gh/remcohaszing/axios-test-instance)
[![npm](https://img.shields.io/npm/v/axios-test-instance)](https://www.npmjs.com/package/axios-test-instance)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://jestjs.io)

## Installation

```sh
npm install axios-test-instance
```

## Usage

1. Create an Axios test instance by passing your app, which may be a Koa app, an Express app, or an
   HTTP request handler, to `setTestApp` in a `beforeEach` block.
2. Import `request` and use it in tests.
3. Close the test instance in the `afterEach` block.

```js
import { request, setTestApp } from 'axios-test-instance';

import app from './app';

beforeEach(async () => {
  await setTestApp(app);
});
```

The method above works with Jest, but it might not work with your testing framework. For this use
case, a test instance can be created manually using `createInstance`.

```js
import { createInstance } from 'axios-test-instance';

import app from './app';

let instance;

beforeEach(async () => {
  instance = await createInstance(app);
});

afterEach(async () => {
  await instance.close();
});
```

Chances are you’re already using an Axios instance in your frontend. In this case, `patchInstance`
can be used to to patch this instance instead.

```js
import { patchInstance } from 'axios-test-instance';

import request from './request';
import app from './app';

let instance;

beforeEach(async () => {
  instance = await patchInstance(request, app);
});

afterEach(async () => {
  await instance.close();
});
```

Now requests made using this instance, will be redirected to the app under test.

## Examples

For usages examples, have a look at our test cases:

- [Koa example](__tests__/koa.ts)
- [Express example](__tests__/express.ts)
- [HTTP callback example](__tests__/callback.ts)
- [End to end example](__tests__/e2e.ts)
