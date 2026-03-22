import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import ticketRoutes from './routes/ticket.routes';

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: env.CORS_ORIGIN ?? '*' }));
app.use(express.json());
app.use('/api', generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

export default app;
