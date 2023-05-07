import { request, setTestApp } from 'axios-test-instance'
import * as Koa from 'koa'

const app = new Koa()
app.use((ctx) => {
  ctx.body = { hello: 'world' }
})

beforeAll(async () => {
  await setTestApp(app)
})

it('should work with a koa app', async () => {
  const { data, headers, status } = await request.get('/')
  expect(status).toBe(200)
  expect(headers).toMatchObject({ 'content-type': 'application/json; charset=utf-8' })
  expect(data).toStrictEqual({ hello: 'world' })
})
