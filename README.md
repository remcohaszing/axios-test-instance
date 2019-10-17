# Axios Test Instance

> Test NodeJS backends using Axios

## Installation

```sh
npm install axios-test-instance
```

## Usage

1. Create an Axios test instance by passing your app, which may be a Koa app, an Express app, or an
   HTTP request handler, to `createInstance` in a `beforeEach` block.
2. Write tests using this test instance.
3. Close the test instance in the `afterEach` block.

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
- [End to end example](__tests__/callback.ts)
