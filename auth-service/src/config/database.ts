import dotenv from 'dotenv';
import { DatabaseService } from '../services/DatabaseService';
import queries from '../queries/queries.json';

dotenv.config();

const dbService = new DatabaseService({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Obtenemos el pool del servicio para mantener compatibilidad si es necesario
const pool = dbService.getPool();

// Cargar queries predefinidas
dbService.queries = { auth: queries };

export { pool };
export default dbService;