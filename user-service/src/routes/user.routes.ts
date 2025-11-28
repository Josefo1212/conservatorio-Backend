import { Router } from 'express';
import { getUser, updateUser, assignRole } from '../controller/user.controller';
import { authenticateToken } from '../middleware/user.middleware';

const router = Router();

router.get('/get/:id', authenticateToken, getUser);
router.put('/update/:id', authenticateToken, updateUser);
router.post('/assign-role', authenticateToken, assignRole);

export default router;
