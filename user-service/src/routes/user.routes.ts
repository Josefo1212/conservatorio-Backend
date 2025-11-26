import { Router } from 'express';
import { register } from '../controller/user.controller';

const router = Router();

router.post('/register', register);

export default router;
