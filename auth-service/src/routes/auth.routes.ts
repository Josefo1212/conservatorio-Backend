import { Router } from 'express';
import { login, validate, refresh, logout } from '../controller/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/validate', verifyToken, validate);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);

export default router;
