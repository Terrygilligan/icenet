const express = require('express');
const router = express.Router();
const { users } = require('../data/db');

// GET /api/users - List all accounts
router.get('/', (req, res) => {
  const { role, status } = req.query;
  let filtered = users;
  if (role) {
    filtered = filtered.filter(u => u.role === role);
  }
  if (status) {
    filtered = filtered.filter(u => u.status === status);
  }
  res.json(filtered.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    company: u.company,
    phone: u.phone,
    status: u.status,
    fleetCount: u.fleetCount,
    baseCity: u.baseCity,
    createdAt: u.createdAt
  })));
});

// PATCH /api/users/:id/status - Approve, Reject, or Suspend user account
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved', 'pending', 'rejected', 'suspended'

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!['approved', 'pending', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  user.status = status;
  res.json({ message: `User status updated to ${status}`, user });
});

// POST /api/users - Create new provider/merchant account
router.post('/', (req, res) => {
  const { name, email, role, company, phone, baseCity, fleetCount } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email,
    password: 'password123',
    role,
    company: company || name,
    phone: phone || '+359 88 000 0000',
    status: role === 'provider' ? 'pending' : 'approved',
    baseCity: baseCity || 'Sofia',
    fleetCount: Number(fleetCount) || 1,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;
