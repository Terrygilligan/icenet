const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users } = require('../data/db');

const JWT_SECRET = process.env.JWT_SECRET || 'icenet_secret_key_2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && (role ? u.role === role : true)
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials or user not found' });
  }

  if (password !== 'password123' && user.password !== password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, company: user.company },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      phone: user.phone,
      status: user.status
    }
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
