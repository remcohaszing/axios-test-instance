import { type RequestListener } from 'node:http';

import { request, setTestApp } from 'axios-test-instance';
import * as busboy from 'busboy';
import * as FormData from 'form-data';

const app: RequestListener = (req, res) => {
  const bb = busboy(req);
  bb.on('file', (fieldname, file, { mimeType }) => {
    if (!res.writableEnded) {
      res.setHeader('content-type', mimeType);
      file.pipe(res);
      file.on('end', () => {
        res.end();
      });
    }
  });
  bb.on('end', () => {
    res.end();
  });
  req.pipe(bb);
};

beforeAll(async () => {
  await setTestApp(app);
});

it('should accept form data in the body', async () => {
  const form = new FormData();
  form.append('image', Buffer.from('PNG'), { contentType: 'image/png', filename: 'image.png' });
  const { data, headers, status } = await request.post('/', form, { responseType: 'arraybuffer' });
  expect(status).toBe(200);
  expect(headers).toMatchObject({ 'content-type': 'image/png' });
  expect(data).toStrictEqual(Buffer.from('PNG'));
});
