import { Router } from 'express';
import { login, validate, refresh, logout, forgotPassword, resetPassword, register, getAvailableRoles, selectRole } from '../controller/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/validate', verifyToken, validate);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', verifyToken, register);
router.get('/roles', getAvailableRoles);
router.post('/select-role', selectRole);

export default router;
