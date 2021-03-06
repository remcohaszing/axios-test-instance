import axios from 'axios';
import { AxiosTestInstance, patchInstance } from 'axios-test-instance';
import { json } from 'body-parser';
import * as express from 'express';

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
backend.use(json());
backend.post<never, TokenResponse, Credentials>('/api/token', (req, res) => {
  const { password, username } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
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

beforeAll(async () => {
  instance = await patchInstance(request, backend);
});

afterAll(async () => {
  await instance.close();
});

it('should be possible to login', async () => {
  await login({
    password: 'I love krabby patties!',
    username: 'spongebob',
  });
  expect(request.defaults.headers.Authorization).toBe('Bearer super.secret.token');
});
