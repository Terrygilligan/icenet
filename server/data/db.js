// In-Memory Database for IceNet Temp-Controlled Logistics (Bulgaria)

const users = [
  {
    id: 'usr_admin1',
    email: 'admin@icenet.bg',
    password: 'password123',
    name: 'Dimitar Georgiev',
    role: 'admin',
    company: 'IceNet HQ Bulgaria',
    phone: '+359 88 123 4567',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_provider1',
    email: 'provider@frigotrans.bg',
    password: 'password123',
    name: 'FrigoTrans Bulgaria OOD',
    role: 'provider',
    company: 'FrigoTrans Logistics',
    phone: '+359 89 765 4321',
    status: 'approved', // approved, pending, rejected
    fleetCount: 12,
    baseCity: 'Sofia',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_provider2',
    email: 'contact@balkancold.bg',
    password: 'password123',
    name: 'Balkan Cold Express',
    role: 'provider',
    company: 'Balkan Cold Express Ltd',
    phone: '+359 52 334 890',
    status: 'pending', // pending approval by admin
    fleetCount: 5,
    baseCity: 'Varna',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_merchant1',
    email: 'merchant@lacta.bg',
    password: 'password123',
    name: 'Lacta Dairy Bulgaria',
    role: 'merchant', // End-User (Customer/Merchant)
    company: 'Lacta BG EAD',
    phone: '+359 32 998 112',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_merchant2',
    email: 'orders@blacksea-seafood.bg',
    password: 'password123',
    name: 'Black Sea Seafoods',
    role: 'merchant',
    company: 'Black Sea Foods Ltd',
    phone: '+359 56 443 210',
    status: 'approved',
    createdAt: new Date().toISOString(),
  }
];

const zones = [
  { id: 'zone_sofia', name: 'Sofia Metropolitan', code: 'SOF', basePriceEur: 18.50, tempSurchargeFreezer: 7.00, estimatedHours: 2, activeDrivers: 14 },
  { id: 'zone_plovdiv', name: 'Plovdiv & Thracian Valley', code: 'PDV', basePriceEur: 16.00, tempSurchargeFreezer: 6.50, estimatedHours: 3, activeDrivers: 8 },
  { id: 'zone_varna', name: 'Varna & Black Sea North', code: 'VAR', basePriceEur: 22.00, tempSurchargeFreezer: 8.50, estimatedHours: 4, activeDrivers: 6 },
  { id: 'zone_burgas', name: 'Burgas & South Coast', code: 'BOJ', basePriceEur: 21.00, tempSurchargeFreezer: 8.00, estimatedHours: 4, activeDrivers: 5 },
  { id: 'zone_ruse', name: 'Ruse & Danube Border', code: 'RSE', basePriceEur: 24.00, tempSurchargeFreezer: 9.00, estimatedHours: 5, activeDrivers: 4 },
  { id: 'zone_stara', name: 'Stara Zagora Hub', code: 'SZR', basePriceEur: 19.00, tempSurchargeFreezer: 7.00, estimatedHours: 3, activeDrivers: 5 },
];

const fleetVehicles = [
  {
    id: 'veh_01',
    providerId: 'usr_provider1',
    plateNumber: 'CB 8842 PK',
    type: 'Sprinter Van (-25°C to +8°C)',
    smallCoolersCapacity: 12,
    largeCoolersCapacity: 4,
    freezersCapacity: 3,
    assignedDriver: 'Ivan Petrov',
    driverPhone: '+359 88 555 011',
    currentLocation: 'Sofia Ring Road (A2)',
    status: 'In Transit', // In Transit, Available, Maintenance
    currentTemp: '-18.4°C',
    targetTemp: '-20.0°C'
  },
  {
    id: 'veh_02',
    providerId: 'usr_provider1',
    plateNumber: 'PB 1290 AH',
    type: 'Isothermal Truck 7.5T',
    smallCoolersCapacity: 30,
    largeCoolersCapacity: 12,
    freezersCapacity: 8,
    assignedDriver: 'Stefan Dimitrov',
    driverPhone: '+359 88 555 022',
    currentLocation: 'Plovdiv Industrial Zone North',
    status: 'Available',
    currentTemp: '+3.8°C',
    targetTemp: '+2.0°C'
  },
  {
    id: 'veh_03',
    providerId: 'usr_provider2',
    plateNumber: 'B 3301 MM',
    type: 'Refrigerated Compact Van',
    smallCoolersCapacity: 8,
    largeCoolersCapacity: 2,
    freezersCapacity: 2,
    assignedDriver: 'Nikolay Ivanov',
    driverPhone: '+359 88 555 033',
    currentLocation: 'Varna Port Logistics Terminal',
    status: 'In Transit',
    currentTemp: '-22.1°C',
    targetTemp: '-22.0°C'
  }
];

const orders = [
  {
    id: 'ICE-2026-901',
    merchantId: 'usr_merchant1',
    merchantName: 'Lacta Dairy Bulgaria',
    providerId: 'usr_provider1',
    providerName: 'FrigoTrans Logistics',
    assignedVehicleId: 'veh_01',
    driverName: 'Ivan Petrov',
    driverPhone: '+359 88 555 011',
    itemType: 'large_cooler', // small_cooler, large_cooler, freezer
    containerCount: 3,
    tempRequirement: '+2°C to +4°C (Cooler)',
    targetTempCelsius: 3.0,
    currentLiveTempCelsius: 3.2,
    pickupLocation: 'Sofia, Industrial Area Kazichene, Block 4',
    pickupCity: 'Sofia',
    dropoffLocation: 'Plovdiv, Central Distribution Hub B',
    dropoffCity: 'Plovdiv',
    pickupTimeSlot: '2026-09-28 09:00 - 11:00',
    deliveryTimeSlot: '2026-09-28 14:00 - 16:00',
    status: 'In Transit - Temp Controlled', // Pending, Dispatch Accepted, Picked Up, In Transit - Temp Controlled, Delivered, Cancelled
    priceEur: 145.00,
    trackingCode: 'BG-ICE-901-X',
    notes: 'Artisanal dairy products. Keep strictly between +2 and +5 degrees Celsius.',
    deliveryProof: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    logs: [
      { time: new Date(Date.now() - 1000 * 60 * 180).toISOString(), status: 'Order Created', note: 'Order placed by Lacta Dairy Bulgaria' },
      { time: new Date(Date.now() - 1000 * 60 * 150).toISOString(), status: 'Dispatch Accepted', note: 'Accepted by FrigoTrans Logistics' },
      { time: new Date(Date.now() - 1000 * 60 * 90).toISOString(), status: 'Picked Up', note: 'Cargo loaded in vehicle CB 8842 PK at Kazichene' },
      { time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'In Transit - Temp Controlled', note: 'Vehicle on A1 Trakia Highway. Sensor reading +3.2°C.' }
    ]
  },
  {
    id: 'ICE-2026-902',
    merchantId: 'usr_merchant2',
    merchantName: 'Black Sea Seafoods',
    providerId: 'usr_provider2',
    providerName: 'Balkan Cold Express',
    assignedVehicleId: 'veh_03',
    driverName: 'Nikolay Ivanov',
    driverPhone: '+359 88 555 033',
    itemType: 'freezer',
    containerCount: 5,
    tempRequirement: '-18°C or colder (Deep Freezer)',
    targetTempCelsius: -20.0,
    currentLiveTempCelsius: -21.4,
    pickupLocation: 'Varna Port Pier 3 Cold Storage',
    pickupCity: 'Varna',
    dropoffLocation: 'Burgas Wholesale Fish Market',
    dropoffCity: 'Burgas',
    pickupTimeSlot: '2026-09-28 11:00 - 13:00',
    deliveryTimeSlot: '2026-09-28 16:00 - 18:00',
    status: 'In Transit - Temp Controlled',
    priceEur: 210.00,
    trackingCode: 'BG-ICE-902-Z',
    notes: 'Frozen Black Sea turbot and seafood crates.',
    deliveryProof: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    logs: [
      { time: new Date(Date.now() - 1000 * 60 * 240).toISOString(), status: 'Order Created', note: 'Order placed by Black Sea Seafoods' },
      { time: new Date(Date.now() - 1000 * 60 * 200).toISOString(), status: 'Dispatch Accepted', note: 'Accepted by Balkan Cold Express' },
      { time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'Picked Up', note: 'Cargo pre-chilled to -20°C and loaded' },
      { time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'In Transit - Temp Controlled', note: 'En route via E87 road. Sensor -21.4°C.' }
    ]
  },
  {
    id: 'ICE-2026-903',
    merchantId: 'usr_merchant1',
    merchantName: 'Lacta Dairy Bulgaria',
    providerId: null,
    providerName: 'Unassigned',
    assignedVehicleId: null,
    driverName: 'Unassigned',
    driverPhone: '',
    itemType: 'small_cooler',
    containerCount: 8,
    tempRequirement: '+4°C (Cooler)',
    targetTempCelsius: 4.0,
    currentLiveTempCelsius: null,
    pickupLocation: 'Sofia Central Food Logistics Depot',
    pickupCity: 'Sofia',
    dropoffLocation: 'Ruse Danube Logistics Park',
    dropoffCity: 'Ruse',
    pickupTimeSlot: '2026-09-29 08:00 - 10:00',
    deliveryTimeSlot: '2026-09-29 15:00 - 17:00',
    status: 'Pending',
    priceEur: 185.00,
    trackingCode: 'BG-ICE-903-P',
    notes: 'Fresh organic yogurt sample packs.',
    deliveryProof: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    logs: [
      { time: new Date(Date.now() - 1000 * 60 * 40).toISOString(), status: 'Order Created', note: 'Order submitted to dispatch queue' }
    ]
  },
  {
    id: 'ICE-2026-890',
    merchantId: 'usr_merchant2',
    merchantName: 'Black Sea Seafoods',
    providerId: 'usr_provider1',
    providerName: 'FrigoTrans Logistics',
    assignedVehicleId: 'veh_02',
    driverName: 'Stefan Dimitrov',
    driverPhone: '+359 88 555 022',
    itemType: 'freezer',
    containerCount: 2,
    tempRequirement: '-18°C Deep Freezer',
    targetTempCelsius: -18.0,
    currentLiveTempCelsius: -19.2,
    pickupLocation: 'Burgas Port Cold Terminal',
    pickupCity: 'Burgas',
    dropoffLocation: 'Sofia Retail Supermarket Hub',
    dropoffCity: 'Sofia',
    pickupTimeSlot: '2026-09-27 10:00 - 12:00',
    deliveryTimeSlot: '2026-09-27 16:00 - 18:00',
    status: 'Delivered',
    priceEur: 260.00,
    trackingCode: 'BG-ICE-890-D',
    notes: 'Completed delivery. Temperature log verified.',
    deliveryProof: {
      signedBy: 'Martin Tonev (Warehouse Manager)',
      timestamp: '2026-09-27 17:22',
      tempOnArrival: '-19.1°C',
      signatureCode: 'SIG-BG-9981-OK'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    logs: [
      { time: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), status: 'Order Created', note: 'Order created' },
      { time: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(), status: 'Dispatch Accepted', note: 'Dispatch accepted by FrigoTrans' },
      { time: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), status: 'Picked Up', note: 'Cargo verified at pickup' },
      { time: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), status: 'In Transit - Temp Controlled', note: 'In transit across A1' },
      { time: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), status: 'Delivered', note: 'Delivered and verified by Martin Tonev' }
    ]
  }
];

module.exports = {
  users,
  zones,
  fleetVehicles,
  orders
};
