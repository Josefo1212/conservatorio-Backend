import express from 'express';
import app from './app';
import pool from './config/database';
import userRoutes from './routes/user.routes';

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRoutes); // Add user routes


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