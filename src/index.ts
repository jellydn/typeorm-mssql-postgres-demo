import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { AppDataSource } from './data-source';
import { User } from './entity/User';

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono + TypeORM!'));

app.get('/users', async (c) => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find();
  return c.json(users);
});

app.post('/users', async (c) => {
  const body = await c.json();
  const userRepo = AppDataSource.getRepository(User);
  const user = userRepo.create(body);
  await userRepo.save(user);
  return c.json(user);
});

AppDataSource.initialize().then(() => {
  console.log(`Connected to ${process.env.DB_TYPE || 'postgres'}`);
  serve({ fetch: app.fetch, port: 3000 });
  console.log('Server running on http://localhost:3000');
}).catch((err) => console.error(err));
