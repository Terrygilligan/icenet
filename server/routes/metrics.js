const express = require('express');
const router = express.Router();
const { orders, fleetVehicles, users, zones } = require('../data/db');

// GET /api/metrics - Global Overview Metrics
router.get('/', (req, res) => {
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const activeDrivers = fleetVehicles.filter(v => v.status === 'In Transit').length;
  const totalVehicles = fleetVehicles.length;

  const totalRevenueEur = orders.reduce((acc, curr) => acc + (curr.priceEur || 0), 0);

  const pendingProvidersCount = users.filter(u => u.role === 'provider' && u.status === 'pending').length;
  const approvedProvidersCount = users.filter(u => u.role === 'provider' && u.status === 'approved').length;

  res.json({
    activeOrders,
    totalOrders,
    deliveredOrders,
    activeDrivers,
    totalVehicles,
    totalRevenueEur,
    pendingProvidersCount,
    approvedProvidersCount,
    activeZonesCount: zones.length,
    systemHealth: {
      status: 'Operational',
      telemetryGateway: 'Online (0.012s ping)',
      iotSensorAccuracy: '99.8%',
      coldChainAlerts: 0
    }
  });
});

module.exports = router;
