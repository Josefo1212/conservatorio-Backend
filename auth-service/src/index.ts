import app from './app';
import pool from './config/database';

const PORT = process.env.PORT || 3000;

async function main(){
    try {
        await pool.connect();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main();