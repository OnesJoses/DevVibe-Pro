import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Register a new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  console.log(`[AUTH] Registration attempt for email: ${email}`);

  if (!email || !password) {
    console.error('[AUTH] Registration failed: Email or password missing.');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log(`[AUTH] User created successfully: ${user.email} (ID: ${user.id})`);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(400).json({ message: 'User already exists or invalid data' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for email: ${email}`);

  if (!email || !password) {
    console.error('[AUTH] Login failed: Email or password missing.');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[AUTH] Login failed: No user found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`[AUTH] Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[AUTH] Login successful for: ${user.email} (ID: ${user.id})`);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('[AUTH] Login server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
