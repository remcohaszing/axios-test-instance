import { request, setTestApp } from 'axios-test-instance';
import * as Fastify from 'fastify';

const app = Fastify();
app.get('/', async (request, reply) => {
  reply.send({ hello: 'world' });
});

beforeEach(async () => {
  await setTestApp(app);
});

test('fastify app', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});

test('fastify app', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
