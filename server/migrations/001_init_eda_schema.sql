-- Migration 001: Initial EDA Schema for IceNet Cold-Chain Logistics
-- PostgreSQL Schema Definitions

CREATE TYPE package_status AS ENUM (
  'Pending',
  'InTransitPickup',
  'DepotInventory',
  'InTransitDelivery',
  'Delivered'
);

CREATE TYPE leg_type AS ENUM (
  'Local',
  'Linehaul'
);

CREATE TYPE temp_requirement_type AS ENUM (
  'DEEP_FREEZE', -- -20°C
  'CHILLED',     -- +2°C to +8°C
  'AMBIENT'      -- Controlled Ambient
);

-- Depots Table
CREATE TABLE IF NOT EXISTS depots (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
  id VARCHAR(64) PRIMARY KEY,
  origin_depot_id VARCHAR(64) REFERENCES depots(id),
  destination_depot_id VARCHAR(64) REFERENCES depots(id),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  leg_type leg_type NOT NULL DEFAULT 'Local',
  status VARCHAR(50) DEFAULT 'Scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  temp_requirement temp_requirement_type NOT NULL DEFAULT 'CHILLED',
  target_temp_celsius NUMERIC(5,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  barcode VARCHAR(128) UNIQUE NOT NULL,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  status package_status NOT NULL DEFAULT 'Pending',
  current_depot_id VARCHAR(64) REFERENCES depots(id),
  current_route_id VARCHAR(64) REFERENCES routes(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Temperature Readouts Table
CREATE TABLE IF NOT EXISTS temp_readouts (
  id VARCHAR(64) PRIMARY KEY,
  sensor_id VARCHAR(64) NOT NULL,
  reading_celsius NUMERIC(5,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  package_id VARCHAR(64) REFERENCES packages(id),
  route_id VARCHAR(64) REFERENCES routes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Handheld Offline Sync Log
CREATE TABLE IF NOT EXISTS sync_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  device_id VARCHAR(64) NOT NULL,
  synced_events_count INT NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
