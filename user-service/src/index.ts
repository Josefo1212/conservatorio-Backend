import express from 'express';
import app from './app';
import dbService from './config/database';
import userRoutes from './routes/user.routes';

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRoutes);


async function main(){
    try {
        await dbService.connect();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`user service running on port ${PORT}`);
    });
}

main();