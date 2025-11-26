import { Router } from 'express';
import { register } from '../controller/user.controller';
import { authenticateToken } from '../middleware/user.middleware';

const router = Router();

router.post('/register', authenticateToken, register);

export default router;
