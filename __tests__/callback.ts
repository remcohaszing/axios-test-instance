import { RequestListener } from 'http';
import { createInstance, AxiosTestInstance } from '..';

const app: RequestListener = (req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ hello: 'world' }));
};

let instance: AxiosTestInstance;

beforeEach(async () => {
  instance = await createInstance(app);
});

afterEach(async () => {
  await instance.close();
});

test('http request listener', async () => {
  const { data, headers, status } = await instance.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
