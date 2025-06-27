import { Hono } from 'hono';
import auth from './authRoutes';

const app = new Hono();

app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
  c.header('Access-Control-Expose-Headers', 'Mcp-Session-Id, WWW-Authenticate');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  await next();
});

app.route('/auth', auth)

app.post('/mcp', async (c) => {
  try {
    const body = await c.req.json();
    return c.json({ success: true, message: 'Received!', body });
  } catch (e: unknown) {
    return c.json({ success: false, error: e });
  }
});


export default app;
