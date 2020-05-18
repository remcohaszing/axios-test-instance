import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createServer, RequestListener } from 'http';
import { AddressInfo } from 'net';
import { URL } from 'url';

/**
 * An Axios instance that is bound to a test server.
 */
export interface AxiosTestInstance extends AxiosInstance {
  /**
   * Close the internal http server and restore the original baseURL.
   */
  close(): Promise<void>;
}

/**
 * An interface that matches the minimal functionality of a Koa app required to create a test instance.
 */
interface KoaLike {
  /**
   * Return a request handler callback for node’s native http server.
   */
  callback(): RequestListener;
}

/**
 * Patch an Axios instance so its requests are redirected to the test server.
 *
 * Note that this will modify the input instance.
 *
 * Don’t forget to close the test instance after the test!
 *
 * @example
 * import { patchInstance, AxiosTestInstance } from 'axios-test-instance';
 *
 * import { instance } from './request';
 * import app from './app';
 *
 * let testInstance: AxiosTestInstance;
 *
 * beforeEach(async () => {
 *   testInstance = await patchInstance(instance, app);
 * });
 *
 * afterEach(async () => {
 *   await testInstance.close();
 * });
 *
 * @param instance The instance to patch.
 * @param app The HTTP callback function or Koa app to which requests will be redirected.
 * @param serverOptions Options that are passed to the http server listen function.
 *
 * @returns the patched instance.
 */
export async function patchInstance(
  instance: AxiosInstance,
  app: RequestListener | KoaLike,
): Promise<AxiosTestInstance> {
  const server = createServer(app instanceof Function ? app : app.callback());
  await new Promise((resolve) => {
    server.listen(undefined, '127.0.0.1', resolve);
  });
  const { address, port } = server.address() as AddressInfo;
  const inst = instance as AxiosTestInstance;
  const { baseURL } = instance.defaults;
  inst.defaults.baseURL = `${new URL(baseURL || '', `http://${address}:${port}`)}`;
  inst.close = (): Promise<void> =>
    new Promise((resolve, reject) => {
      inst.defaults.baseURL = baseURL;
      inst.close = (): Promise<void> => Promise.resolve();
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  return inst;
}

/**
 * Create an axios instance for testing an app.
 *
 * Don’t forget to close the test instance after the test!
 *
 * @example
 * import { createInstance, AxiosTestInstance } from 'axios-test-instance';
 *
 * import app from './app';
 *
 * let instance: AxiosTestInstance;
 *
 * beforeEach(async () => {
 *   instance = await createInstance(app);
 * });
 *
 * afterEach(async () => {
 *   await instance.close();
 * });
 *
 * @param app An http callback function or a Koa app instance.
 * @param axiosConfig Configuration options to pass to the axios create call.
 * @param serverOptions Options that are passed to the http server listen function.
 *
 * @returns An axios instance that is bound to a test server.
 */
export async function createInstance(
  app: RequestListener | KoaLike,
  axiosConfig?: AxiosRequestConfig,
): Promise<AxiosTestInstance> {
  return patchInstance(
    axios.create({
      validateStatus: () => true,
      ...axiosConfig,
    }),
    app,
  );
}

/**
 * A default axios test instance.
 *
 * Don’t forget to close the test instance after the test!
 *
 * @example
 * import { closeTestApp, request, setTestApp } from 'axios-test-instance';
 *
 * import app from './app';
 *
 * beforeEach(async () => {
 *   await setTestApp(app);
 * });
 *
 * afterEach(closeTestApp);
 */
export const request: AxiosTestInstance = Object.assign(
  axios.create({ validateStatus: () => true }),
  { close: () => Promise.resolve() },
);

/**
 * Close the default axios test instance.
 *
 * This can be passed directly to the `afterEach()` function of the testing framework.
 *
 * @see request for more details
 */
export async function closeTestApp(): Promise<void> {
  return request.close();
}

/**
 * Set the test app for the default axios test instance.
 *
 * @see request for more details
 *
 * @param app An http callback function or a Koa app instance.
 */
export async function setTestApp(app: RequestListener | KoaLike): Promise<AxiosTestInstance> {
  await closeTestApp();
  return patchInstance(request, app);
}

if (typeof afterAll !== 'undefined') {
  afterAll(closeTestApp);
}
