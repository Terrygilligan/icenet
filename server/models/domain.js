/**
 * IceNet EDA Domain Models and Interfaces
 */

export enum PackageStatus {
  PENDING = 'Pending',
  IN_TRANSIT_PICKUP = 'InTransitPickup',
  DEPOT_INVENTORY = 'DepotInventory',
  IN_TRANSIT_DELIVERY = 'InTransitDelivery',
  DELIVERED = 'Delivered',
}

export enum TempRequirement {
  DEEP_FREEZE = 'DEEP_FREEZE', // -20°C Deep Freeze
  CHILLED = 'CHILLED',         // +2°C to +8°C Chilled
  AMBIENT = 'AMBIENT',
}

export enum LegType {
  LOCAL = 'Local',
  LINEHAUL = 'Linehaul',
}

export interface Depot {
  id: string;
  name: string;
  city: string;
  address: string;
  createdAt?: string;
}

export interface Route {
  id: string;
  originDepotId: string;
  destinationDepotId: string;
  driverName: string;
  driverPhone: string;
  legType: LegType;
  status: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  clientId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  tempRequirement: TempRequirement;
  targetTempCelsius: number;
  status: string;
  createdAt?: string;
}

export interface Package {
  id: string;
  orderId: string;
  barcode: string;
  qrCode: string;
  status: PackageStatus;
  currentDepotId?: string | null;
  currentRouteId?: string | null;
  description?: string;
  createdAt?: string;
}

export interface TempReadout {
  id: string;
  sensorId: string;
  readingCelsius: number;
  recordedAt: string;
  packageId?: string;
  routeId?: string;
  createdAt?: string;
}
