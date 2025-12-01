import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/user',userRoutes); 

export default app;