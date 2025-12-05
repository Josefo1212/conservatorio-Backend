import express from 'express';
import { verifyMaster } from '../middleware/auth.middleware';
import {
  createAudit,
  getAudits as getAllAudits,
  getAuditById,
  updateAuditById,
  deleteAudit,
} from '../controller/auditoria.controller';

const router = express.Router();

router.get("/audit", verifyMaster, getAllAudits);
router.get("/audit/:id", verifyMaster, getAuditById);
// The following routes reuse getAllAudits until specific handlers exist
router.get("/audit/user/:id_usuario", verifyMaster, getAllAudits);
router.get("/audit/module/:id_modulo", verifyMaster, getAllAudits);
router.get("/audit/action/:id_accion", verifyMaster, getAllAudits);
router.get("/audit/filter", verifyMaster, getAllAudits);
router.post("/audit", verifyMaster, createAudit);
router.put('/audit/:id', verifyMaster, updateAuditById);
router.delete('/audit/:id', verifyMaster, deleteAudit);

export default router;