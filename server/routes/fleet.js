const express = require('express');
const router = express.Router();
const { fleetVehicles } = require('../data/db');

// GET /api/fleet - List fleet vehicles
router.get('/', (req, res) => {
  const { providerId } = req.query;
  let result = fleetVehicles;
  if (providerId) {
    result = result.filter(v => v.providerId === providerId);
  }
  res.json(result);
});

// POST /api/fleet - Add new vehicle
router.post('/', (req, res) => {
  const {
    providerId,
    plateNumber,
    type,
    smallCoolersCapacity,
    largeCoolersCapacity,
    freezersCapacity,
    assignedDriver,
    driverPhone,
    targetTemp
  } = req.body;

  if (!plateNumber || !type) {
    return res.status(400).json({ message: 'Missing plate number or vehicle type' });
  }

  const newVehicle = {
    id: 'veh_' + Date.now(),
    providerId: providerId || 'usr_provider1',
    plateNumber,
    type,
    smallCoolersCapacity: Number(smallCoolersCapacity) || 10,
    largeCoolersCapacity: Number(largeCoolersCapacity) || 4,
    freezersCapacity: Number(freezersCapacity) || 2,
    assignedDriver: assignedDriver || 'Unassigned',
    driverPhone: driverPhone || '+359 88 000 0000',
    currentLocation: 'Depot (Sofia)',
    status: 'Available',
    currentTemp: targetTemp || '+2.0°C',
    targetTemp: targetTemp || '+2.0°C'
  };

  fleetVehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// PATCH /api/fleet/:id - Update vehicle capacity or driver assignment
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const vehicle = fleetVehicles.find(v => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  Object.assign(vehicle, req.body);
  res.json({ message: 'Vehicle updated successfully', vehicle });
});

module.exports = router;
