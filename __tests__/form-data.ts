import { RequestListener } from 'http';

import { request, setTestApp } from 'axios-test-instance';
import * as Busboy from 'busboy';
import * as FormData from 'form-data';

const app: RequestListener = (req, res) => {
  const busboy = new Busboy(req);
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (!res.writableEnded) {
      res.setHeader('content-type', mimetype);
      file.pipe(res);
      file.on('end', () => {
        res.end();
      });
    }
  });
  busboy.on('end', () => {
    res.end();
  });
  req.pipe(busboy);
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
