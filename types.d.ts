import { type RequestListener } from 'node:http';

// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import { type FastifyInstance } from 'fastify';
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import type * as Koa from 'koa';

type FastifyLike = unknown extends FastifyInstance ? never : FastifyInstance;
type KoaLike = unknown extends Koa ? never : Koa;

/**
 * A web server application that represents either an HTTP callback function or a Koa or Fastify
 * instance.
 */
export type Application = FastifyLike | KoaLike | RequestListener;
