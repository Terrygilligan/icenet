import { Router, Request, Response } from 'express';
import { pubsubManager } from '../events/pubsub';
import { EventEnvelope } from '../events/eventTypes';

const router = Router();

export interface LocalPackage {
  id: string;
  orderId: string;
  barcode: string;
  status: string;
  currentDepotId: string | null;
  currentRouteId: string | null;
  createdAt: string;
}

// Local Data Store for Zero-Cost Dev Stack
export const localStore = {
  orders: [
    {
      id: 'ord_ev_sofia_101',
      clientId: 'client_lacta_bg',
      pickupAddress: 'Sofia Industrial Kazichene EV Hub',
      deliveryAddress: 'Plovdiv Central Logistics Hub',
      pickupWindowStart: new Date().toISOString(),
      pickupWindowEnd: new Date(Date.now() + 10800000).toISOString(),
      deliveryWindowStart: new Date(Date.now() + 14400000).toISOString(),
      deliveryWindowEnd: new Date(Date.now() + 28800000).toISOString(),
      minTemp: 2.0,
      maxTemp: 8.0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
  ],
  packages: [
    {
      id: 'pkg_ev_sofia_101',
      orderId: 'ord_ev_sofia_101',
      barcode: 'BC-EV-BG-101',
      status: 'DEPOT_INVENTORY',
      currentDepotId: 'depot_sofia_ev_main',
      currentRouteId: null,
      createdAt: new Date().toISOString(),
    }
  ] as LocalPackage[],
  depots: [
    {
      id: 'depot_sofia_ev_main',
      name: 'Sofia Central EV Cold Storage Depot',
      location: 'Sofia Ring Road Kazichene',
      coldStorageType: 'CHILLED_+2C_+8C',
    },
    {
      id: 'depot_plovdiv_ev_main',
      name: 'Plovdiv Thracian EV Depot',
      location: 'Plovdiv Industrial Zone North',
      coldStorageType: 'DEEP_FREEZE_-20C',
    }
  ],
  vehicles: [
    {
      id: 'veh_ev_van_01',
      name: 'Volvo FH Electric Chilled Semi',
      transportType: 'EV_TRUCK',
      batteryCapacity: 540, // kWh
      coldChainPowerKW: 12.5,
      maxRangeKm: 300,
      status: 'AVAILABLE'
    },
    {
      id: 'veh_electric_rail_01',
      name: 'Balkan Express Electric Rail Container',
      transportType: 'ELECTRIC_RAIL',
      batteryCapacity: 2000,
      coldChainPowerKW: 45.0,
      maxRangeKm: 1200,
      status: 'AVAILABLE'
    }
  ],
  routeLegs: [
    {
      id: 'leg_sofia_plovdiv_rail',
      originDepotId: 'depot_sofia_ev_main',
      destinationDepotId: 'depot_plovdiv_ev_main',
      transitMode: 'ELECTRIC_RAIL',
      chargingBayReserved: true,
      distanceKm: 145.0
    }
  ],
  eventLogs: new Map<string, EventEnvelope>() // Key: idempotencyKey
};

/**
 * 1. POST /api/v1/orders
 * Ingest client orders
 */
router.post('/orders', async (req: Request, res: Response) => {
  const {
    clientId,
    pickupAddress,
    deliveryAddress,
    pickupWindowStart,
    pickupWindowEnd,
    deliveryWindowStart,
    deliveryWindowEnd,
    minTemp,
    maxTemp,
    packageCount
  } = req.body;

  if (!pickupAddress || !deliveryAddress) {
    return res.status(400).json({ error: 'pickupAddress and deliveryAddress are required.' });
  }

  const orderId = `ord_ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newOrder = {
    id: orderId,
    clientId: clientId || 'client_default',
    pickupAddress,
    deliveryAddress,
    pickupWindowStart: pickupWindowStart || new Date().toISOString(),
    pickupWindowEnd: pickupWindowEnd || new Date(Date.now() + 10800000).toISOString(),
    deliveryWindowStart: deliveryWindowStart || new Date(Date.now() + 14400000).toISOString(),
    deliveryWindowEnd: deliveryWindowEnd || new Date(Date.now() + 28800000).toISOString(),
    minTemp: minTemp ?? 2.0,
    maxTemp: maxTemp ?? 8.0,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  localStore.orders.push(newOrder);

  // Publish order.created via Pub/Sub
  const orderCreatedEvent: EventEnvelope = {
    idempotencyKey: `ord_create_${orderId}`,
    eventType: 'order.created',
    payload: {
      orderId: newOrder.id,
      clientId: newOrder.clientId,
      pickupAddress: newOrder.pickupAddress,
      deliveryAddress: newOrder.deliveryAddress,
      minTemp: newOrder.minTemp,
      maxTemp: newOrder.maxTemp
    },
    timestamp: new Date().toISOString()
  };

  await pubsubManager.publish('order.created', orderCreatedEvent);
  localStore.eventLogs.set(orderCreatedEvent.idempotencyKey, orderCreatedEvent);

  // Generate packages
  const count = packageCount || 1;
  const createdPackages: LocalPackage[] = [];
  for (let i = 1; i <= count; i++) {
    const pkgId = `pkg_${orderId}_${i}`;
    const barcode = `BC-EV-${orderId}-${i}`;
    const newPkg: LocalPackage = {
      id: pkgId,
      orderId,
      barcode,
      status: 'PENDING_PICKUP',
      currentDepotId: null,
      currentRouteId: null,
      createdAt: new Date().toISOString()
    };
    localStore.packages.push(newPkg);
    createdPackages.push(newPkg);

    const pkgLabeledEvent: EventEnvelope = {
      idempotencyKey: `pkg_label_${pkgId}`,
      eventType: 'package.labeled',
      payload: {
        packageId: pkgId,
        orderId,
        barcode
      },
      timestamp: new Date().toISOString()
    };
    await pubsubManager.publish('package.labeled', pkgLabeledEvent);
    localStore.eventLogs.set(pkgLabeledEvent.idempotencyKey, pkgLabeledEvent);
  }

  return res.status(201).json({
    message: 'Order created successfully and published to Pub/Sub',
    order: newOrder,
    packages: createdPackages
  });
});

/**
 * 2. POST /api/v1/sync/events
 * Batch upload queued driver events from handhelds (with Idempotency Key validation)
 */
router.post('/sync/events', async (req: Request, res: Response) => {
  const { deviceId, events } = req.body;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'events must be an array of event objects.' });
  }

  const results: Array<{ idempotencyKey: string; status: 'PROCESSED' | 'DUPLICATE_SKIPPED'; eventType: string }> = [];

  for (const evt of events as EventEnvelope[]) {
    const { idempotencyKey, eventType, payload } = evt;

    if (!idempotencyKey) {
      results.push({ idempotencyKey: 'MISSING', status: 'DUPLICATE_SKIPPED', eventType: eventType || 'UNKNOWN' });
      continue;
    }

    // Validate IdempotencyKey to prevent duplicate scan processing
    if (localStore.eventLogs.has(idempotencyKey)) {
      results.push({ idempotencyKey, status: 'DUPLICATE_SKIPPED', eventType });
      continue;
    }

    const processedEvent: EventEnvelope = {
      idempotencyKey,
      eventType,
      payload,
      deviceId: deviceId || evt.deviceId || 'ev_handheld_scanner_01',
      timestamp: evt.timestamp || new Date().toISOString()
    };
    localStore.eventLogs.set(idempotencyKey, processedEvent);

    // Update domain state based on event
    if (eventType === 'package.depot.received') {
      const pkg = localStore.packages.find(p => p.id === payload.packageId || p.barcode === payload.barcode);
      if (pkg) {
        pkg.status = 'DEPOT_INVENTORY';
        pkg.currentDepotId = payload.depotId;
      }
    } else if (eventType === 'package.crossdocked') {
      const pkg = localStore.packages.find(p => p.id === payload.packageId || p.barcode === payload.barcode);
      if (pkg) {
        pkg.status = 'IN_TRANSIT_LINEHAUL';
        pkg.currentRouteId = payload.routeId;
      }
    } else if (eventType === 'order.delivered') {
      const order = localStore.orders.find(o => o.id === payload.orderId);
      if (order) {
        order.status = 'DELIVERED';
      }
    }

    // Publish to Pub/Sub
    await pubsubManager.publish(eventType, processedEvent);
    results.push({ idempotencyKey, status: 'PROCESSED', eventType });
  }

  return res.status(200).json({
    message: 'Event batch sync processed',
    deviceId: deviceId || 'handheld_default',
    totalSynced: results.filter(r => r.status === 'PROCESSED').length,
    duplicatesSkipped: results.filter(r => r.status === 'DUPLICATE_SKIPPED').length,
    results
  });
});

/**
 * 3. GET /api/v1/depots/:id/inventory
 * Retrieve active inventory list at a depot
 */
router.get('/depots/:id/inventory', (req: Request, res: Response) => {
  const depotId = req.params.id;
  const depot = localStore.depots.find(d => d.id === depotId);

  if (!depot) {
    return res.status(404).json({ error: `Depot with ID '${depotId}' not found.` });
  }

  const activePackages = localStore.packages.filter(p => p.currentDepotId === depotId && p.status === 'DEPOT_INVENTORY');

  return res.status(200).json({
    depot,
    packageCount: activePackages.length,
    packages: activePackages
  });
});

export default router;
