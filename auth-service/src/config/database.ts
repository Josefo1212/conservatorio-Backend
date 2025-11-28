import pg from 'pg';
import dotenv from 'dotenv';
import { DatabaseService } from '../services/DatabaseService';
import path from 'path';

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
// Nota: Asegúrate de que el archivo queries.json se copie al directorio dist al compilar
const queriesPath = path.join(__dirname, '../queries/queries.json');
// En desarrollo puede que necesitemos ajustar si __dirname apunta a src o dist
if (process.env.NODE_ENV !== 'production') {
    // Lógica adicional si es necesario, pero path relativo suele funcionar si la estructura se mantiene
}

try {
    // Cargamos las queries en el namespace 'auth' para acceder como dbService.queries.auth.nombreQuery
    dbService.loadQueries(queriesPath, 'auth');
} catch (e) {
    console.warn('No se pudieron cargar las queries predefinidas. Asegúrate de que el archivo existe.', e);
}

export { pool };
export default dbService;