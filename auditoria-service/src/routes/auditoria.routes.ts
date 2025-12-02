import express from 'express';
import {
  createAudit,
  getAudits,
  getAuditById,
  updateAuditById,
  deleteAudit,
} from '../controller/auditoria.controller';

const router = express.Router();

router.post('/', createAudit);
router.get('/', getAudits);
router.get('/:id', getAuditById);
router.put('/:id', updateAuditById);
router.delete('/:id', deleteAudit);

export default router;