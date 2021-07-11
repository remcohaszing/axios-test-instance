import { createServer, RequestListener, Server } from 'http';
import { AddressInfo } from 'net';
import { URL } from 'url';

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * An Axios instance that is bound to a test server.
 */
export interface AxiosTestInstance extends AxiosInstance {
  /**
   * Close the internal http server and restore the original baseURL.
   */
  close: () => Promise<void>;
}

interface RunningServer {
  /**
   * The URI to set as a base URI.
   */
  uri: string;

  /**
   * A function to close the running server.
   */
  close: () => Promise<void>;
}

/**
 * An interface that matches the minimal functionality of a Koa app required to create a test
 * instance.
 */
interface KoaLike {
  /**
   * Return a request handler callback for node’s native http server.
   */
  callback: () => RequestListener;
}

/**
 * An interface that mimics a Fastify instance.
 */
interface FastifyLike {
  /**
   * Close the Fastify instance.
   */
  close: () => PromiseLike<void>;

  /**
   * Start the fastify instance.
   */
  listen: (port: number, callback: (err: Error, address: string) => void) => void;

  /**
   * The HTTP server instance.
   */
  server: Server;
}

/**
 * A web server application that represents either an HTTP callback function or a Koa or Fastify
 * instance.
 */
export type Application = FastifyLike | KoaLike | RequestListener;

/**
 * Assign form-data headers to the axios request config.
 *
 * @param config - The incoming axios request config.
 * @returns The patched axios request config.
 */
function formDataInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
  if (typeof config.data?.getHeaders === 'function') {
    Object.assign(config.headers, config.data.getHeaders());
  }
  return config;
}

/**
 * Start a server for the given application.
 *
 * @param app - The application to start a server for.
 * @returns An internal server configuration.
 */
async function startServer(app: Application): Promise<RunningServer> {
  if ('server' in app && 'listen' in app && 'close' in app) {
    return new Promise((resolve, reject) => {
      app.listen(0, (error, uri) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            uri,
            async close() {
              await app.close();
            },
          });
        }
      });
    });
  }
  const server = createServer(app instanceof Function ? app : app.callback());
  await new Promise<void>((resolve) => {
    server.listen(undefined, '127.0.0.1', resolve);
  });
  const { address, port } = server.address() as AddressInfo;
  return {
    uri: `http://${address}:${port}`,
    close: (): Promise<void> =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
  };
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
 * beforeAll(async () => {
 *   testInstance = await patchInstance(instance, app);
 * });
 *
 * afterAll(async () => {
 *   await testInstance.close();
 * });
 * @param instance - The instance to patch.
 * @param app - The HTTP callback function or Koa app to which requests will be redirected.
 * @returns the patched instance.
 */
export async function patchInstance(
  instance: AxiosInstance,
  app: Application,
): Promise<AxiosTestInstance> {
  const { close, uri } = await startServer(app);
  const inst = instance as AxiosTestInstance;
  const { baseURL } = instance.defaults;
  inst.defaults.baseURL = String(new URL(baseURL || '', uri));
  inst.close = async (): Promise<void> => {
    inst.defaults.baseURL = baseURL;
    await close();
    inst.close = (): Promise<void> => Promise.resolve();
  };
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
 * beforeAll(async () => {
 *   instance = await createInstance(app);
 * });
 *
 * afterAll(async () => {
 *   await instance.close();
 * });
 * @param app - An http callback function or a Koa app instance.
 * @param axiosConfig - Configuration options to pass to the axios create call.
 * @returns An axios instance that is bound to a test server.
 */
export async function createInstance(
  app: Application,
  axiosConfig?: AxiosRequestConfig,
): Promise<AxiosTestInstance> {
  const instance = await patchInstance(
    axios.create({
      maxRedirects: 0,
      validateStatus: () => true,
      ...axiosConfig,
    }),
    app,
  );
  instance.interceptors.request.use(formDataInterceptor);
  return instance;
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
 * beforeAll(async () => {
 *   await setTestApp(app);
 * });
 *
 * afterAll(closeTestApp);
 */
export const request: AxiosTestInstance = Object.assign(
  axios.create({ maxRedirects: 0, validateStatus: () => true }),
  { close: () => Promise.resolve() },
);
request.interceptors.request.use(formDataInterceptor);

/**
 * Close the default axios test instance.
 *
 * This can be passed directly to the `afterEach()` or `afterAll() function of the testing
 * framework.
 *
 * @see request for more details
 */
export async function closeTestApp(): Promise<void> {
  await request.close();
}

/**
 * Set the test app for the default axios test instance.
 *
 * @see request for more details
 * @param app - An http callback function or a Koa app instance.
 * @returns The default axios test instance
 */
export async function setTestApp(app: Application): Promise<AxiosTestInstance> {
  await closeTestApp();
  return patchInstance(request, app);
}

if (typeof afterAll !== 'undefined') {
  afterAll(closeTestApp);
}
