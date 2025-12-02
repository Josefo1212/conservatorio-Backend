import { Request, Response } from 'express';
import AuditoriaService, { AuditRecord } from '../services/auditoriaService';

export async function createAudit(req: Request, res: Response) {
  try {
    const body = req.body as AuditRecord;
    if (!body || !body.action) {
      return res.status(400).json({ message: 'action is required' });
    }

    const created = await AuditoriaService.create(body);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create audit' });
  }
}

export async function getAudits(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit ?? 100);
    const offset = Number(req.query.offset ?? 0);
    const records = await AuditoriaService.findAll(limit, offset);
    return res.json(records);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch audits' });
  }
}

export async function getAuditById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const record = await AuditoriaService.findById(id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch audit' });
  }
}

export async function updateAuditById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const payload = req.body as Partial<AuditRecord>;
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ message: 'Empty payload' });
    }
    const updated = await AuditoriaService.update(id, payload);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update audit' });
  }
}

export async function deleteAudit(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const deleted = await AuditoriaService.deleteById(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete audit' });
  }
}