import { request, setTestApp } from 'axios-test-instance';
import * as express from 'express';

const app = express();
app.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

beforeEach(async () => {
  await setTestApp(app);
});

test('express app', async () => {
  const { data, headers, status } = await request.get('/');
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' });
  expect(data).toStrictEqual({ hello: 'world' });
});
