import { Router } from 'express';
import { login, validate, refresh, logout, forgotPassword, resetPassword, register } from '../controller/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/validate', verifyToken, validate);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', verifyToken, register);

export default router;
