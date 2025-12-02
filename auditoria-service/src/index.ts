import dotenv from 'dotenv';
import app from './app';
import DatabaseService from './services/DatabaseService';

dotenv.config();

const PORT = Number(process.env.PORT ?? 3004);

async function main() {
  try {
    await DatabaseService.query('SELECT 1');
    console.log('Connected to the database successfully.');
  } catch (err) {
    console.error('Failed to connect to the database (will continue running for debug):', err);
  }

  app.listen(PORT, () => {
    console.log(`Auditoria service running on port ${PORT}`);
  });
}

main();