import { request, setTestApp } from 'axios-test-instance';
import { fastify } from 'fastify';

const app = fastify();
app.get('/', async (req, reply) => {
  await reply.send({ hello: 'world' });
});

beforeAll(async () => {
  await setTestApp(app);
});

it('should work with a fastify app', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
