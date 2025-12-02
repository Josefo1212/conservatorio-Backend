import dotenv from 'dotenv';
import { DatabaseService } from '../services/DatabaseService';
import path from 'path';

dotenv.config();

// Crear instancia del servicio con variables de entorno
const dbService = new DatabaseService({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Cargar queries predefinidas en el namespace 'auth'
const queriesPath = path.join(__dirname, '../queries/queries.json');
try {
    dbService.loadQueries(queriesPath, 'auth');
} catch (e) {
    console.warn('No se pudieron cargar las queries predefinidas de user.', e);
}

export default dbService;