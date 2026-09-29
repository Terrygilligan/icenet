import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import v1Routes from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API v1 Routes
app.use('/api/v1', v1Routes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IceNet Cold Chain Architecture API v1',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[IceNet API Server TS] Running on http://localhost:${PORT}`);
  });
}

export default app;
