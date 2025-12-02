import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import auditoriaRoutes from './routes/auditoria.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/audits', auditoriaRoutes);

app.get('/', (req, res) =>
  res.json({
    name: 'auditoria-service',
    uptime: process.uptime(),
  })
);

export default app;