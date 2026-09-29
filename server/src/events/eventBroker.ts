import { EventEmitter } from 'events';
import {
  EventEnvelope,
  EventType,
  OrderCreatedPayload,
  PackageLabeledPayload,
  PackageDepotReceivedPayload,
  PackageCrossdockedPayload,
  TemperatureReadoutCapturedPayload,
  OrderDeliveredPayload
} from './eventTypes';

class EventBroker extends EventEmitter {
  private eventHistory: EventEnvelope[] = [];

  publish<T>(eventType: EventType, event: EventEnvelope<T>): void {
    this.eventHistory.push(event);
    console.log(`[EventBroker] Published '${eventType}' (Key: ${event.idempotencyKey}):`, JSON.stringify(event.payload));
    this.emit(eventType, event);
    this.emit('*', event);
  }

  subscribe<T>(eventType: EventType, handler: (event: EventEnvelope<T>) => Promise<void> | void): void {
    this.on(eventType, async (event: EventEnvelope<T>) => {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBroker] Error handling event ${eventType}:`, err);
      }
    });
    console.log(`[EventBroker] Handler registered for '${eventType}'`);
  }

  getHistory(): EventEnvelope[] {
    return this.eventHistory;
  }
}

export const eventBroker = new EventBroker();

// Register Default Typed Subscriptions & Handlers
eventBroker.subscribe<OrderCreatedPayload>('order.created', (evt) => {
  console.log(`[Handler: OrderCreated] Order ID ${evt.payload.orderId} registered.`);
});

eventBroker.subscribe<PackageLabeledPayload>('package.labeled', (evt) => {
  console.log(`[Handler: PackageLabeled] Barcode ${evt.payload.barcode} assigned to Package ${evt.payload.packageId}.`);
});

eventBroker.subscribe<PackageDepotReceivedPayload>('package.depot.received', (evt) => {
  console.log(`[Handler: DepotReceived] Package ${evt.payload.packageId} logged at Depot ${evt.payload.depotId}.`);
});

eventBroker.subscribe<PackageCrossdockedPayload>('package.crossdocked', (evt) => {
  console.log(`[Handler: Crossdocked] Package ${evt.payload.packageId} routed onto ${evt.payload.routeId}.`);
});

eventBroker.subscribe<TemperatureReadoutCapturedPayload>('temperature.readout.captured', (evt) => {
  const { currentTemp, minTempLimit, maxTempLimit, sensorId } = evt.payload;
  if (currentTemp < minTempLimit || currentTemp > maxTempLimit) {
    console.warn(`[ALERT: ColdChainBreach] Sensor ${sensorId} reading ${currentTemp}°C out of bounds [${minTempLimit}°C, ${maxTempLimit}°C]!`);
  } else {
    console.log(`[Handler: TempLog] Sensor ${sensorId} OK: ${currentTemp}°C.`);
  }
});

eventBroker.subscribe<OrderDeliveredPayload>('order.delivered', (evt) => {
  console.log(`[Handler: OrderDelivered] Order ${evt.payload.orderId} delivered successfully.`);
});
