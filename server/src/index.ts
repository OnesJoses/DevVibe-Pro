import express from 'express';
import cors from 'cors';
import authRoutes from './auth'; // Import the auth routes

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}));
app.use(express.json()); // for parsing application/json

// API routes
app.use('/api/auth', authRoutes); // Use the auth routes

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
