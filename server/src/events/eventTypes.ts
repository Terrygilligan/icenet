export type EventType =
  | 'order.created'
  | 'package.labeled'
  | 'package.depot.received'
  | 'package.crossdocked'
  | 'temperature.readout.captured'
  | 'order.delivered';

export interface OrderCreatedPayload {
  orderId: string;
  clientId: string;
  pickupAddress: string;
  deliveryAddress: string;
  minTemp: number;
  maxTemp: number;
}

export interface PackageLabeledPayload {
  packageId: string;
  orderId: string;
  barcode: string;
  tempClass?: 'DEEP_FREEZE' | 'CHILLED' | 'AMBIENT';
}

export interface PackageDepotReceivedPayload {
  packageId: string;
  depotId: string;
  receivedAt: string;
}

export interface PackageCrossdockedPayload {
  packageId: string;
  fromDepotId: string;
  toDepotId?: string;
  routeId: string;
}

export interface TemperatureReadoutCapturedPayload {
  sensorId: string;
  packageId?: string;
  currentTemp: number;
  minTempLimit: number;
  maxTempLimit: number;
  recordedAt: string;
}

export interface OrderDeliveredPayload {
  orderId: string;
  deliveredAt: string;
  recipientSignature?: string;
}

export interface EventEnvelope<T = any> {
  idempotencyKey: string;
  eventType: EventType;
  payload: T;
  deviceId?: string;
  timestamp: string;
}
