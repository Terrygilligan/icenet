import { PubSub } from '@google-cloud/pubsub';
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

// Local Emulator configuration for $0 cloud spend during dev
const emulatorHost = process.env.PUBSUB_EMULATOR_HOST || 'localhost:8085';
process.env.PUBSUB_EMULATOR_HOST = emulatorHost;

export const pubsubClient = new PubSub({
  projectId: process.env.GCP_PROJECT_ID || 'icenet-dev-project',
});

// Topics required for cold-chain electric transport logistics
export const TOPICS: EventType[] = [
  'order.created',
  'package.labeled',
  'package.depot.received',
  'package.crossdocked',
  'temperature.readout.captured',
  'order.delivered'
];

class PubSubManager {
  private inMemoryBus: Map<string, Array<(event: EventEnvelope<any>) => Promise<void> | void>> = new Map();
  private eventHistory: EventEnvelope[] = [];

  constructor() {
    TOPICS.forEach((t) => this.inMemoryBus.set(t, []));
  }

  /**
   * Publish typed event to GCP Pub/Sub Topic (with local emulator & in-memory fallback)
   */
  async publish<T>(eventType: EventType, event: EventEnvelope<T>): Promise<string> {
    this.eventHistory.push(event);
    console.log(`[GCP PubSub (${emulatorHost})] Published to topic '${eventType}' [Key: ${event.idempotencyKey}]`);

    try {
      const topic = pubsubClient.topic(eventType);
      const messageBuffer = Buffer.from(JSON.stringify(event));
      await topic.publishMessage({ data: messageBuffer, attributes: { eventType, idempotencyKey: event.idempotencyKey } });
    } catch (err) {
      // Fallback for standalone local environment without running emulator container
      console.log(`[PubSub Local Fallback] Triggering subscribers for '${eventType}'`);
    }

    // Trigger local subscriber handlers
    const handlers = this.inMemoryBus.get(eventType) || [];
    for (const h of handlers) {
      try {
        await h(event);
      } catch (e) {
        console.error(`[PubSub Handler Error] Topic ${eventType}:`, e);
      }
    }

    return event.idempotencyKey;
  }

  /**
   * Subscribe handler function to topic
   */
  subscribe<T>(eventType: EventType, handler: (event: EventEnvelope<T>) => Promise<void> | void): void {
    const handlers = this.inMemoryBus.get(eventType) || [];
    handlers.push(handler as any);
    this.inMemoryBus.set(eventType, handlers);
    console.log(`[PubSub Subscribed] Registered listener for topic '${eventType}'`);
  }

  getHistory(): EventEnvelope[] {
    return this.eventHistory;
  }
}

export const pubsubManager = new PubSubManager();

// Default Cold Chain & EV Transport Topic Subscribers
pubsubManager.subscribe<OrderCreatedPayload>('order.created', (evt) => {
  console.log(`[PubSub Sub: order.created] New order ${evt.payload.orderId} registered.`);
});

pubsubManager.subscribe<PackageLabeledPayload>('package.labeled', (evt) => {
  console.log(`[PubSub Sub: package.labeled] Package ${evt.payload.packageId} -> Barcode ${evt.payload.barcode}.`);
});

pubsubManager.subscribe<PackageDepotReceivedPayload>('package.depot.received', (evt) => {
  console.log(`[PubSub Sub: package.depot.received] Package ${evt.payload.packageId} stored at Depot ${evt.payload.depotId}.`);
});

pubsubManager.subscribe<PackageCrossdockedPayload>('package.crossdocked', (evt) => {
  console.log(`[PubSub Sub: package.crossdocked] Package ${evt.payload.packageId} routed via ${evt.payload.routeId}.`);
});

pubsubManager.subscribe<TemperatureReadoutCapturedPayload>('temperature.readout.captured', (evt) => {
  const { currentTemp, minTempLimit, maxTempLimit, sensorId } = evt.payload;
  if (currentTemp < minTempLimit || currentTemp > maxTempLimit) {
    console.warn(`[PubSub Sub: TEMP_BREACH_ALERT] Sensor ${sensorId}: ${currentTemp}°C out of range [${minTempLimit}°C, ${maxTempLimit}°C]!`);
  } else {
    console.log(`[PubSub Sub: temp_reading] Sensor ${sensorId}: ${currentTemp}°C (Nominal)`);
  }
});

pubsubManager.subscribe<OrderDeliveredPayload>('order.delivered', (evt) => {
  console.log(`[PubSub Sub: order.delivered] Order ${evt.payload.orderId} delivered.`);
});
