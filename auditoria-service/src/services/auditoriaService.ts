import DatabaseService from './DatabaseService';
// @ts-ignore
const queries = require('../queries/queries.json');

export type AuditRecord = {
  id?: number;
  user_id?: string | null;
  action: string;
  entity?: string | null;
  resource_id?: string | null;
  before_data?: Record<string, any> | null;
  after_data?: Record<string, any> | null;
  ip?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
};

class AuditoriaService {
  async create(audit: AuditRecord): Promise<AuditRecord> {
    const params = [
      audit.user_id ?? null,
      audit.action,
      audit.entity ?? null,
      audit.resource_id ?? null,
      audit.before_data ? JSON.stringify(audit.before_data) : null,
      audit.after_data ? JSON.stringify(audit.after_data) : null,
      audit.ip ?? null,
      audit.user_agent ?? null,
      audit.metadata ? JSON.stringify(audit.metadata) : null,
    ];

    const result = await DatabaseService.query(queries.create, params);
    return result.rows[0] as AuditRecord;
  }

  async update(id: number, audit: Partial<AuditRecord>): Promise<AuditRecord | undefined> {
    const params = [
      audit.user_id ?? null,
      audit.action ?? '',
      audit.entity ?? null,
      audit.resource_id ?? null,
      audit.before_data ? JSON.stringify(audit.before_data) : null,
      audit.after_data ? JSON.stringify(audit.after_data) : null,
      audit.ip ?? null,
      audit.user_agent ?? null,
      audit.metadata ? JSON.stringify(audit.metadata) : null,
      id,
    ];

    const result = await DatabaseService.query(queries.update, params);
    return result.rows[0] as AuditRecord | undefined;
  }

  async findAll(limit = 100, offset = 0): Promise<AuditRecord[]> {
    const result = await DatabaseService.query(queries.findAll, [limit, offset]);
    return result.rows as AuditRecord[];
  }

  async findById(id: number): Promise<AuditRecord | undefined> {
    const result = await DatabaseService.query(queries.findById, [id]);
    return result.rows[0] as AuditRecord | undefined;
  }

  async deleteById(id: number): Promise<AuditRecord | undefined> {
    const result = await DatabaseService.query(queries.deleteById, [id]);
    return result.rows[0] as AuditRecord | undefined;
  }
}

export default new AuditoriaService();