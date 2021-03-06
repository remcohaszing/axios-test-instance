import * as http from 'http';

import axios from 'axios';
import { Application, closeTestApp, createInstance, patchInstance } from 'axios-test-instance';
import * as express from 'express';

const app = express();
app.get('/', (req, res) => {
  res.status(500);
  res.end();
});
app.get('/redirect', (req, res) => {
  res.redirect('/');
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('should not follow redirects', async () => {
  const instance = await createInstance(app);
  const { status } = await instance.get('/redirect');
  expect(status).toBe(302);
  await instance.close();
});

it('should not throw on an error response', async () => {
  const instance = await createInstance(app);
  const { status } = await instance.get('/');
  expect(status).toBe(500);
  await instance.close();
});

it('should be fine to call close twice', async () => {
  const instance = await createInstance(app);
  const result1 = await instance.close();
  const result2 = await instance.close();
  expect(result1).toBeUndefined();
  expect(result2).toBeUndefined();
  await instance.close();
});

it('should restore the patched baseURL', async () => {
  const originalInstance = axios.create({ baseURL: '/test' });
  const testInstance = await patchInstance(originalInstance, app);
  expect(testInstance).toBe(originalInstance);
  expect(testInstance.defaults.baseURL).toMatch(/^http:\/\/127.0.0.1:\d+\/test$/);
  await testInstance.close();
  expect(testInstance.defaults.baseURL).toBe('/test');
});

it('should reject close if startubg the fastify server fails', async () => {
  const error = new Error('stub');
  const fakeApp: Application = {
    listen: (port, cb) => cb(error, ''),
    server: null as unknown as http.Server,
    close: null as unknown as () => Promise<void>,
  };
  await expect(createInstance(fakeApp)).rejects.toThrow(error);
});

it('should reject close if closing the server fails', async () => {
  const error = new Error('stub');
  const server = {
    listen: (port: number, host: string, cb: () => void) => cb(),
    address: () => ({ port: 1337 }),
    close(cb: (err?: Error) => void) {
      cb(error);
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jest.spyOn(http, 'createServer').mockReturnValue(server as any);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const instance = await createInstance(() => {});
  await expect(instance.close()).rejects.toThrow(error);
});

it('should not crash when closing the default instance', async () => {
  const result1 = await closeTestApp();
  expect(result1).toBeUndefined();
  const result2 = await closeTestApp();
  expect(result2).toBeUndefined();
});

it('should not crash if afterAll is not defined', async () => {
  // @ts-expect-error This is deleted to fake a non-jest environment.
  delete global.afterAll;
  jest.resetModules();
  const result = await import('..');
  expect(result).toBeDefined();
});
