import * as express from 'express';
import { createInstance, AxiosTestInstance } from '..';

const app = express();
app.get('/', async (req, res) => {
  res.json({ hello: 'world' });
});

let instance: AxiosTestInstance;

beforeEach(async () => {
  instance = await createInstance(app);
});

afterEach(async () => {
  await instance.close();
});

test('express app', async () => {
  const { data, headers, status } = await instance.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
