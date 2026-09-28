const express = require('express');
const router = express.Router();
const { zones } = require('../data/db');

// GET /api/zones - List zones
router.get('/', (req, res) => {
  res.json(zones);
});

// POST /api/zones - Add new zone
router.post('/', (req, res) => {
  const { name, code, basePriceEur, tempSurchargeFreezer, estimatedHours, activeDrivers } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Zone name and code are required' });
  }

  const newZone = {
    id: 'zone_' + Date.now(),
    name,
    code: code.toUpperCase(),
    basePriceEur: Number(basePriceEur) || 20.0,
    tempSurchargeFreezer: Number(tempSurchargeFreezer) || 7.5,
    estimatedHours: Number(estimatedHours) || 3,
    activeDrivers: Number(activeDrivers) || 2
  };

  zones.push(newZone);
  res.status(201).json(newZone);
});

// PATCH /api/zones/:id - Update zone pricing
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const zone = zones.find(z => z.id === id);
  if (!zone) {
    return res.status(404).json({ message: 'Zone not found' });
  }

  Object.assign(zone, req.body);
  res.json({ message: 'Zone pricing updated', zone });
});

module.exports = router;
