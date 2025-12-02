import pool from '../config/database';
import { QueryResult } from 'pg';

class DatabaseService {
  async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database query error', err);
      throw err;
    }
  }
}

export default new DatabaseService();