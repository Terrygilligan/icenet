const express = require('express');
const router = express.Router();
const { orders, fleetVehicles, users } = require('../data/db');

// GET /api/orders
router.get('/', (req, res) => {
  const { merchantId, providerId, status, search } = req.query;
  let result = [...orders];

  if (merchantId) {
    result = result.filter(o => o.merchantId === merchantId);
  }
  if (providerId) {
    result = result.filter(o => o.providerId === providerId || (o.status === 'Pending' && !o.providerId));
  }
  if (status) {
    result = result.filter(o => o.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.merchantName.toLowerCase().includes(q) ||
      o.pickupCity.toLowerCase().includes(q) ||
      o.dropoffCity.toLowerCase().includes(q)
    );
  }

  // Sort by newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
});

// GET /api/orders/:id - Get single order details with live telemetry & logs
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id || o.trackingCode === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Simulate subtle real-time telemetry updates for live tracking
  if (order.status === 'In Transit - Temp Controlled') {
    const variance = (Math.random() * 0.4 - 0.2).toFixed(1);
    order.currentLiveTempCelsius = parseFloat((order.targetTempCelsius + parseFloat(variance)).toFixed(1));
  }

  res.json(order);
});

// POST /api/orders - Order Creation Wizard (End-User / Merchant)
router.post('/', (req, res) => {
  const {
    merchantId,
    itemType, // 'small_cooler', 'large_cooler', 'freezer'
    containerCount,
    tempRequirement,
    targetTempCelsius,
    pickupLocation,
    pickupCity,
    dropoffLocation,
    dropoffCity,
    pickupTimeSlot,
    deliveryTimeSlot,
    notes,
    estimatedPriceEur
  } = req.body;

  if (!itemType || !pickupLocation || !dropoffLocation) {
    return res.status(400).json({ message: 'Missing required order details' });
  }

  const merchant = users.find(u => u.id === merchantId) || {
    id: merchantId || 'usr_merchant1',
    name: 'Lacta Dairy Bulgaria',
    company: 'Lacta BG EAD'
  };

  const newId = `ICE-2026-${Math.floor(100 + Math.random() * 900)}`;
  const trackingCode = `BG-ICE-${Math.floor(1000 + Math.random() * 9000)}-${itemType.charAt(0).toUpperCase()}`;

  let targetTemp = targetTempCelsius !== undefined ? parseFloat(targetTempCelsius) : 4.0;
  let tempReq = tempRequirement;
  if (!tempReq) {
    if (itemType === 'freezer') tempReq = '-18°C Deep Freezer';
    else if (itemType === 'large_cooler') tempReq = '+2°C to +4°C (Large Cooler)';
    else tempReq = '+4°C to +8°C (Small Cooler)';
  }

  const newOrder = {
    id: newId,
    merchantId: merchant.id,
    merchantName: merchant.company || merchant.name,
    providerId: null,
    providerName: 'Unassigned',
    assignedVehicleId: null,
    driverName: 'Unassigned',
    driverPhone: '',
    itemType,
    containerCount: Number(containerCount) || 1,
    tempRequirement: tempReq,
    targetTempCelsius: targetTemp,
    currentLiveTempCelsius: null,
    pickupLocation,
    pickupCity: pickupCity || 'Sofia',
    dropoffLocation,
    dropoffCity: dropoffCity || 'Plovdiv',
    pickupTimeSlot: pickupTimeSlot || '2026-09-29 09:00 - 11:00',
    deliveryTimeSlot: deliveryTimeSlot || '2026-09-29 14:00 - 16:00',
    status: 'Pending',
    priceEur: estimatedPriceEur ? parseFloat(estimatedPriceEur) : 120.00,
    trackingCode,
    notes: notes || '',
    deliveryProof: null,
    createdAt: new Date().toISOString(),
    logs: [
      {
        time: new Date().toISOString(),
        status: 'Order Created',
        note: `Order created by ${merchant.company || merchant.name}. Spec: ${itemType} x ${containerCount || 1}`
      }
    ]
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// PATCH /api/orders/:id/dispatch - Transport Provider accepts or declines dispatch
router.patch('/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const { action, providerId, vehicleId } = req.body; // action = 'accept' | 'decline'

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (action === 'accept') {
    const provider = users.find(u => u.id === providerId) || { name: 'FrigoTrans Logistics' };
    const vehicle = fleetVehicles.find(v => v.id === vehicleId) || fleetVehicles[0];

    order.providerId = providerId || 'usr_provider1';
    order.providerName = provider.company || provider.name;
    order.assignedVehicleId = vehicle.id;
    order.driverName = vehicle.assignedDriver;
    order.driverPhone = vehicle.driverPhone;
    order.status = 'Dispatch Accepted';
    order.logs.push({
      time: new Date().toISOString(),
      status: 'Dispatch Accepted',
      note: `Dispatch accepted by ${order.providerName}. Assigned vehicle ${vehicle.plateNumber} (${vehicle.assignedDriver}).`
    });

    return res.json({ message: 'Dispatch accepted successfully', order });
  } else if (action === 'decline') {
    order.logs.push({
      time: new Date().toISOString(),
      status: 'Dispatch Declined',
      note: `Dispatch offer declined by provider.`
    });

    return res.json({ message: 'Dispatch declined', order });
  }

  res.status(400).json({ message: 'Invalid action' });
});

// PATCH /api/orders/:id/status - Update tracking status & temperature telemetry
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, currentTempCelsius, proofSignature, signedBy, note } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (status) {
    order.status = status;
  }

  if (currentTempCelsius !== undefined) {
    order.currentLiveTempCelsius = parseFloat(currentTempCelsius);
  }

  if (status === 'Delivered') {
    order.deliveryProof = {
      signedBy: signedBy || 'Receiving Clerk',
      timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Europe/Sofia' }),
      tempOnArrival: `${order.currentLiveTempCelsius || order.targetTempCelsius}°C`,
      signatureCode: proofSignature || `SIG-BG-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`
    };
  }

  order.logs.push({
    time: new Date().toISOString(),
    status: status || 'Status Updated',
    note: note || `Order updated to ${status}. Current temperature: ${order.currentLiveTempCelsius ?? 'N/A'}°C`
  });

  res.json({ message: 'Order status updated', order });
});

module.exports = router;
