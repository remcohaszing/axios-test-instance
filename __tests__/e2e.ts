import * as express from 'express';
import * as bodyParser from 'body-parser';
import axios from 'axios';
import { patchInstance, AxiosTestInstance } from '..';

// ——— Shared types ———

interface Credentials {
  password: string;
  username: string;
}

interface TokenResponse {
  access_token: string;
}

// ——— Backend ———

const users: Credentials[] = [
  {
    password: 'I love krabby patties!',
    username: 'spongebob',
  },
];

const backend = express();
backend.use(bodyParser.json());
backend.post('/api/token', (req, res) => {
  const { password, username } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    res.json({ access_token: 'super.secret.token' });
  } else {
    res.status(401);
  }
});

// ——— Frontend ———

const request = axios.create({ baseURL: '/api' });

async function login(credentials: Credentials): Promise<void> {
  const { data } = await request.post<TokenResponse>('/token', credentials);
  request.defaults.headers.Authorization = `Bearer ${data.access_token}`;
}

// ——— Test ———

let instance: AxiosTestInstance;

beforeEach(async () => {
  instance = await patchInstance(request, backend);
});

afterEach(async () => {
  await instance.close();
});

test('login', async () => {
  await login({
    password: 'I love krabby patties!',
    username: 'spongebob',
  });
  expect(request.defaults.headers.Authorization).toBe('Bearer super.secret.token');
});
