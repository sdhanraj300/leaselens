import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import userRoutes from './routes/user';
import scansRoutes from './routes/scans';
import paymentRoutes from './routes/payments';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger for debugging 404s
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = 8080;

// Webhooks must be registered BEFORE global authentication middleware
app.use('/api/webhooks', paymentRoutes);

// Protected Routes
app.use('/api', authenticate);
app.use('/api/user', userRoutes);
app.use('/api/scans', scansRoutes);

// Catch-all 404 for API routes - MUST be after all other routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running at http://0.0.0.0:${PORT}`);
});
