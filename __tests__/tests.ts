import axios from 'axios';
import { closeTestApp, createInstance, patchInstance } from 'axios-test-instance';
import * as express from 'express';
import * as http from 'http';

const app = express();
app.get('/', (req, res) => {
  res.status(500);
  res.end();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('error response shouldn’t throw', async () => {
  const instance = await createInstance(app);
  const { status } = await instance.get('/');
  expect(status).toBe(500);
  await instance.close();
});

test('calling close twice should be fine', async () => {
  const instance = await createInstance(app);
  await expect(instance.close()).resolves.toBeUndefined();
  await expect(instance.close()).resolves.toBeUndefined();
  await instance.close();
});

test('patched baseURL should be restored', async () => {
  const originalInstance = axios.create({ baseURL: '/test' });
  const testInstance = await patchInstance(originalInstance, app);
  expect(testInstance).toBe(originalInstance);
  expect(testInstance.defaults.baseURL).toMatch(/^http:\/\/127.0.0.1:\d+\/test$/);
  await testInstance.close();
  expect(testInstance.defaults.baseURL).toBe('/test');
});

it('should reject close if closing the server fails', async () => {
  const error = new Error('stub');
  const server = {
    listen: (port: number, host: string, cb: () => void) => cb(),
    address: () => ({ port: 1337 }),
    close(cb: (error?: Error) => void) {
      cb(error);
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jest.spyOn(http, 'createServer').mockReturnValue(server as any);
  const instance = await createInstance(() => {});
  await expect(instance.close()).rejects.toThrowError(error);
});

test('closing default instance shouldn’t crash', async () => {
  await expect(closeTestApp()).resolves.toBeUndefined();
  await expect(closeTestApp()).resolves.toBeUndefined();
});

test('afterAll is not defined', async () => {
  delete global.afterAll;
  jest.resetModuleRegistry();
  await expect(import('..')).resolves.toBeDefined();
});
