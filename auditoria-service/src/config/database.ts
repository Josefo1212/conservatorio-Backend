// filepath: ...\auth-service\src\config\database.ts
import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

const host = process.env.POSTGRES_HOST ?? 'localhost';
const port = Number(process.env.POSTGRES_PORT ?? 5432);
const user = String(process.env.POSTGRES_USER ?? 'postgres');
const password = process.env.POSTGRES_PASSWORD === undefined ? undefined : String(process.env.POSTGRES_PASSWORD);
const database = String(process.env.POSTGRES_DB ?? 'postgres');

console.log('auth-service DB config', { host, port, user, database, hasPassword: !!password });

const pool = new Pool({ host, port, user, password, database });
export default pool;