const express = require('express');
const router = express.Router();
const { eventBus, EVENT_CHANNELS } = require('../events/eventBus');

// In-Memory store for EDA demo / fallback
const edaOrders = [];
const edaPackages = [];
const edaDepots = [
  { id: 'depot_sofia_01', name: 'Sofia Central Cold Depot', city: 'Sofia', address: 'Kazichene Logistics Hub, Bldg 4' },
  { id: 'depot_plovdiv_01', name: 'Plovdiv Thracian Depot', city: 'Plovdiv', address: 'Industrial Zone North, Street 12' },
  { id: 'depot_varna_01', name: 'Varna Port Cold Hub', city: 'Varna', address: 'Port Pier 3 Refrigerated Warehouse' }
];
const edaInventory = {
  'depot_sofia_01': [],
  'depot_plovdiv_01': [],
  'depot_varna_01': []
};
const edaTempLogs = [];

/**
 * A. Order Service: POST /api/eda/orders
 * Ingest pickup/delivery details & temp requirement window
 */
router.post('/orders', (req, res) => {
  const {
    clientId,
    pickupAddress,
    dropoffAddress,
    pickupWindowStart,
    pickupWindowEnd,
    deliveryWindowStart,
    deliveryWindowEnd,
    tempRequirement,
    targetTempCelsius,
    packageCount
  } = req.body;

  if (!pickupAddress || !dropoffAddress || !tempRequirement) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  const orderId = `ORD-ICE-${Date.now().toString().slice(-6)}`;
  const newOrder = {
    id: orderId,
    clientId: clientId || 'client_default',
    pickupAddress,
    dropoffAddress,
    pickupWindowStart: pickupWindowStart || new Date().toISOString(),
    pickupWindowEnd: pickupWindowEnd || new Date(Date.now() + 3600000 * 3).toISOString(),
    deliveryWindowStart: deliveryWindowStart || new Date(Date.now() + 3600000 * 4).toISOString(),
    deliveryWindowEnd: deliveryWindowEnd || new Date(Date.now() + 3600000 * 8).toISOString(),
    tempRequirement: tempRequirement || 'CHILLED',
    targetTempCelsius: targetTempCelsius ?? 3.0,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  edaOrders.push(newOrder);

  // Publish order.created
  eventBus.publish(EVENT_CHANNELS.ORDER_CREATED, {
    orderId: newOrder.id,
    clientId: newOrder.clientId,
    tempRequirement: newOrder.tempRequirement,
    targetTempCelsius: newOrder.targetTempCelsius,
    pickupAddress: newOrder.pickupAddress,
    dropoffAddress: newOrder.dropoffAddress
  });

  // Generate packages & barcodes
  const numPackages = packageCount || 1;
  const createdPackages = [];

  for (let i = 1; i <= numPackages; i++) {
    const pkgId = `PKG-${orderId}-${i}`;
    const barcode = `BC-${orderId}-0${i}`;
    const qrCode = `QR-${orderId}-0${i}`;

    const pkg = {
      id: pkgId,
      orderId: newOrder.id,
      barcode,
      qrCode,
      status: 'Pending',
      currentDepotId: null,
      currentRouteId: null,
      description: `Cold-chain package #${i} for ${orderId}`,
      createdAt: new Date().toISOString()
    };

    edaPackages.push(pkg);
    createdPackages.push(pkg);

    // Publish package.labeled
    eventBus.publish(EVENT_CHANNELS.PACKAGE_LABELED, {
      packageId: pkg.id,
      orderId: newOrder.id,
      barcode: pkg.barcode,
      qrCode: pkg.qrCode,
      tempRequirement: newOrder.tempRequirement
    });
  }

  res.status(201).json({
    message: 'Order created and packages labeled successfully',
    order: newOrder,
    packages: createdPackages
  });
});

/**
 * B. Handheld Sync API: POST /api/eda/sync/events
 * Batch sync offline driver scans, signatures, and temp logs
 */
router.post('/sync/events', (req, res) => {
  const { deviceId, offlineEvents } = req.body;

  if (!Array.isArray(offlineEvents)) {
    return res.status(400).json({ error: 'offlineEvents must be an array' });
  }

  const processedEvents = [];

  offlineEvents.forEach((evt) => {
    const { type, payload, timestamp } = evt;

    switch (type) {
      case EVENT_CHANNELS.TEMPERATURE_READOUT_CAPTURED:
        edaTempLogs.push({ ...payload, deviceId, syncedAt: new Date().toISOString() });
        eventBus.publish(EVENT_CHANNELS.TEMPERATURE_READOUT_CAPTURED, { ...payload, deviceId, timestamp });
        processedEvents.push({ type, status: 'PROCESSED' });
        break;

      case EVENT_CHANNELS.PACKAGE_DEPOT_RECEIVED:
        const pkgToReceive = edaPackages.find(p => p.id === payload.packageId || p.barcode === payload.barcode);
        if (pkgToReceive) {
          pkgToReceive.status = 'DepotInventory';
          pkgToReceive.currentDepotId = payload.depotId;
          if (!edaInventory[payload.depotId]) edaInventory[payload.depotId] = [];
          if (!edaInventory[payload.depotId].includes(pkgToReceive.id)) {
            edaInventory[payload.depotId].push(pkgToReceive.id);
          }
        }
        eventBus.publish(EVENT_CHANNELS.PACKAGE_DEPOT_RECEIVED, { ...payload, deviceId, timestamp });
        processedEvents.push({ type, status: 'PROCESSED' });
        break;

      case EVENT_CHANNELS.ORDER_DELIVERED:
        const orderToDeliver = edaOrders.find(o => o.id === payload.orderId);
        if (orderToDeliver) {
          orderToDeliver.status = 'Delivered';
        }
        eventBus.publish(EVENT_CHANNELS.ORDER_DELIVERED, { ...payload, deviceId, timestamp });
        processedEvents.push({ type, status: 'PROCESSED' });
        break;

      default:
        eventBus.publish(type, { ...payload, deviceId, timestamp });
        processedEvents.push({ type, status: 'PROCESSED' });
        break;
    }
  });

  res.json({
    message: 'Offline events batch synced successfully',
    deviceId: deviceId || 'handheld_01',
    syncedCount: processedEvents.length,
    results: processedEvents
  });
});

/**
 * C. Depot Inventory Service
 * GET /api/eda/depots/:id/inventory
 */
router.get('/depots/:id/inventory', (req, res) => {
  const depotId = req.params.id;
  const depot = edaDepots.find(d => d.id === depotId);

  if (!depot) {
    return res.status(404).json({ error: `Depot ${depotId} not found` });
  }

  const inventoryPkgIds = edaInventory[depotId] || [];
  const inventoryPackages = edaPackages.filter(p => inventoryPkgIds.includes(p.id) || p.currentDepotId === depotId);

  res.json({
    depot,
    inventoryCount: inventoryPackages.length,
    packages: inventoryPackages
  });
});

/**
 * C. Depot Inventory Service
 * POST /api/eda/depots/:id/scan (Receive / Cross-dock scan)
 */
router.post('/depots/:id/scan', (req, res) => {
  const depotId = req.params.id;
  const { barcode, qrCode, action, nextRouteId } = req.body; // action: 'RECEIVE' | 'CROSSDOCK'

  const depot = edaDepots.find(d => d.id === depotId);
  if (!depot) {
    return res.status(404).json({ error: `Depot ${depotId} not found` });
  }

  const pkg = edaPackages.find(p => p.barcode === barcode || p.qrCode === qrCode);
  if (!pkg) {
    return res.status(404).json({ error: 'Package not found for barcode/QR' });
  }

  if (action === 'CROSSDOCK') {
    pkg.status = 'InTransitDelivery';
    pkg.currentRouteId = nextRouteId || 'route_linehaul_01';

    // Remove from inventory
    if (edaInventory[depotId]) {
      edaInventory[depotId] = edaInventory[depotId].filter(id => id !== pkg.id);
    }

    eventBus.publish(EVENT_CHANNELS.PACKAGE_CROSSDOCKED, {
      packageId: pkg.id,
      depotId,
      nextRouteId: pkg.currentRouteId,
      timestamp: new Date().toISOString()
    });
  } else {
    // Default: Receive into Depot Inventory
    pkg.status = 'DepotInventory';
    pkg.currentDepotId = depotId;

    if (!edaInventory[depotId]) edaInventory[depotId] = [];
    if (!edaInventory[depotId].includes(pkg.id)) {
      edaInventory[depotId].push(pkg.id);
    }

    eventBus.publish(EVENT_CHANNELS.PACKAGE_DEPOT_RECEIVED, {
      packageId: pkg.id,
      depotId,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    message: `Package ${pkg.id} scanned successfully (${action || 'RECEIVE'})`,
    package: pkg
  });
});

/**
 * Audit log of event bus
 */
router.get('/events/audit', (req, res) => {
  res.json({
    totalEvents: eventBus.getAuditLog().length,
    events: eventBus.getAuditLog()
  });
});

module.exports = router;
