const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const fleetRoutes = require('./routes/fleet');
const zoneRoutes = require('./routes/zones');
const metricRoutes = require('./routes/metrics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/metrics', metricRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'IceNet Cold Chain Logistics API', region: 'Bulgaria (BG)' });
});

app.listen(PORT, () => {
  console.log(`[IceNet API Server] Running on http://localhost:${PORT}`);
});
