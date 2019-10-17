import * as Koa from 'koa';
import { createInstance, AxiosTestInstance } from '..';

const app = new Koa();
app.use(async ctx => {
  ctx.body = { hello: 'world' };
});

let instance: AxiosTestInstance;

beforeEach(async () => {
  instance = await createInstance(app);
});

afterEach(async () => {
  await instance.close();
});

test('koa app', async () => {
  const { data, headers, status } = await instance.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
