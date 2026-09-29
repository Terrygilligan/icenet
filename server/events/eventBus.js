const EventEmitter = require('events');

// Core Event Channel Definitions
const EVENT_CHANNELS = {
  ORDER_CREATED: 'order.created',
  PACKAGE_LABELED: 'package.labeled',
  PACKAGE_DEPOT_RECEIVED: 'package.depot.received',
  PACKAGE_CROSSDOCKED: 'package.crossdocked',
  TEMPERATURE_READOUT_CAPTURED: 'temperature.readout.captured',
  ORDER_DELIVERED: 'order.delivered'
};

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.eventLog = [];
  }

  /**
   * Publish an event payload to a channel
   * @param {string} channel - Channel name from EVENT_CHANNELS
   * @param {object} payload - Event payload
   */
  publish(channel, payload) {
    const event = {
      eventId: `evt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      channel,
      timestamp: new Date().toISOString(),
      payload
    };

    this.eventLog.push(event);
    console.log(`[EventBus] Published -> [${channel}]:`, JSON.stringify(event));
    this.emit(channel, event);
    this.emit('*', event); // Wildcard handler
    return event;
  }

  /**
   * Subscribe to an event channel
   * @param {string} channel - Channel name
   * @param {function} handler - Event handler function
   */
  subscribe(channel, handler) {
    this.on(channel, handler);
    console.log(`[EventBus] Subscribed to channel: ${channel}`);
  }

  /**
   * Get historical audit log of published events
   */
  getAuditLog() {
    return this.eventLog;
  }
}

const globalEventBus = new EventBus();

// Setup typed event handlers / subscribers boilerplate
globalEventBus.subscribe(EVENT_CHANNELS.ORDER_CREATED, (event) => {
  console.log(`[Handler: OrderService] Order Created -> Order ID: ${event.payload.orderId}`);
});

globalEventBus.subscribe(EVENT_CHANNELS.PACKAGE_LABELED, (event) => {
  console.log(`[Handler: LabelingService] Package Labeled -> Barcode: ${event.payload.barcode}`);
});

globalEventBus.subscribe(EVENT_CHANNELS.PACKAGE_DEPOT_RECEIVED, (event) => {
  console.log(`[Handler: DepotService] Package Received at Depot ${event.payload.depotId} -> Package: ${event.payload.packageId}`);
});

globalEventBus.subscribe(EVENT_CHANNELS.PACKAGE_CROSSDOCKED, (event) => {
  console.log(`[Handler: CrossDockService] Package Crossdocked -> Depot: ${event.payload.depotId}, Route: ${event.payload.nextRouteId}`);
});

globalEventBus.subscribe(EVENT_CHANNELS.TEMPERATURE_READOUT_CAPTURED, (event) => {
  const { readingCelsius, targetTempCelsius } = event.payload;
  if (targetTempCelsius && readingCelsius > targetTempCelsius + 2) {
    console.warn(`[ALERT: TempBreach] Sensor ${event.payload.sensorId} reading ${readingCelsius}°C exceeds target ${targetTempCelsius}°C!`);
  } else {
    console.log(`[Handler: TelemetryService] Temp Readout Recorded -> ${readingCelsius}°C`);
  }
});

globalEventBus.subscribe(EVENT_CHANNELS.ORDER_DELIVERED, (event) => {
  console.log(`[Handler: DeliveryService] Order Delivered -> Order ID: ${event.payload.orderId}`);
});

module.exports = {
  eventBus: globalEventBus,
  EVENT_CHANNELS
};
