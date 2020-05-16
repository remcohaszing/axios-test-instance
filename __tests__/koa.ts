import * as Koa from 'koa';
import { request, setTestApp, closeTestApp } from '..';

const app = new Koa();
app.use(async (ctx) => {
  ctx.body = { hello: 'world' };
});

beforeEach(async () => {
  await setTestApp(app);
});

afterEach(closeTestApp);

test('koa app', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
