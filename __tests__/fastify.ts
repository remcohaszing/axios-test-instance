import { request, setTestApp } from 'axios-test-instance';
import Fastify from 'fastify';

const app = Fastify();
app.get('/', async (request, reply) => {
  await reply.send({ hello: 'world' });
});

beforeAll(async () => {
  await setTestApp(app);
});

test('fastify app', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
