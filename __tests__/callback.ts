import { RequestListener } from 'http';
import { request, setTestApp, closeTestApp } from '..';

const app: RequestListener = (req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ hello: 'world' }));
};

beforeEach(async () => {
  await setTestApp(app);
});

afterEach(closeTestApp);

test('http request listener', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
