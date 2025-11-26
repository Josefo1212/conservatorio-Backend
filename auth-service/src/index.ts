import express from 'express';
import cookieParser from 'cookie-parser';
import app from './app';
import pool from './config/database';
import authRoutes from './routes/auth.routes';

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // Configura cookie-parser

app.use(authRoutes);

async function main(){
    try {
        await pool.connect();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Auth service running on port ${PORT}`);
    });
}

main();