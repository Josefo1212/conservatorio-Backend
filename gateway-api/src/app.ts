import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { setupProxies } from './utils/proxy.utils';
import gatewayRoutes from './routes/gateway.routes';

dotenv.config();

const app = express();

// Middleware de logging para todas las solicitudes
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(helmet());
setupProxies(app);
app.use(gatewayRoutes);

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error en la aplicación:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;