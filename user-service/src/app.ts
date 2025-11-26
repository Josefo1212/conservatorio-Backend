import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(userRoutes); // Mount user routes under /api

export default app;