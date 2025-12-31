import dotenv from 'dotenv';
dotenv.config();

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

// Ensure polyfills for pdf-parse if needed
try {
  if (typeof (global as any).DOMMatrix === 'undefined') {
    const canvas = require('@napi-rs/canvas');
    (global as any).DOMMatrix = canvas.DOMMatrix;
    (global as any).ImageData = canvas.ImageData;
    (global as any).Path2D = canvas.Path2D;
  }
} catch (e) {
  console.warn("PDF Polyfills could not be initialized:", e);
}

// Health check routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'LeaseLens API is running', 
    version: '1.0.0',
    env: process.env.VERCEL === '1' ? 'production' : 'development',
    time: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Request logger for debugging 404s
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("GLOBAL_ERROR:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message 
  });
});

// Only start server in non-serverless environment
if (process.env.VERCEL !== '1') {
  const PORT = parseInt(process.env.PORT || '8080', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running at http://0.0.0.0:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
