import express from 'express';
import cors from 'cors';
import authRoutes from './auth'; // Import the auth routes
import { ensureRedis, redis } from './redisClient';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}));
app.use(express.json()); // for parsing application/json

// API routes
app.use('/api/auth', authRoutes); // Use the auth routes

// Redis test routes
app.get('/api/cache/ping', async (_req, res) => {
  try {
    await ensureRedis();
    const pong = await redis.ping();
    res.json({ ok: true, pong })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'redis error' })
  }
})

app.post('/api/cache/set', async (req, res) => {
  const { key, value, ttl } = req.body || {}
  if (!key) return res.status(400).json({ message: 'key required' })
  try {
    await ensureRedis();
    if (ttl) {
      await redis.set(key, JSON.stringify(value), { EX: Number(ttl) })
    } else {
      await redis.set(key, JSON.stringify(value))
    }
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'redis error' })
  }
})

app.get('/api/cache/get', async (req, res) => {
  const key = (req.query.key as string) || ''
  if (!key) return res.status(400).json({ message: 'key required' })
  try {
    await ensureRedis();
    const raw = await redis.get(key)
    res.json({ ok: true, value: raw ? JSON.parse(raw) : null })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'redis error' })
  }
})

// Root status route
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'DevVibe Pro API',
    version: '1.0.0',
    endpoints: [
      'GET /',
      'GET /api/hello',
      'POST /api/auth/register',
      'POST /api/auth/login',
    ],
  });
});

// A simple API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: `Hello from the backend! The time is ${new Date().toLocaleTimeString()}` });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
