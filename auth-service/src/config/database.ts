import dotenv from 'dotenv';
import { DatabaseService } from '../services/DatabaseService';
import queries from '../queries/queries.json';

dotenv.config();

const dbService = new DatabaseService({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`,
});

// Obtenemos el pool del servicio para mantener compatibilidad si es necesario
const pool = dbService.getPool();

// Cargar queries predefinidas
dbService.queries = { auth: queries };

export { pool };
export default dbService;