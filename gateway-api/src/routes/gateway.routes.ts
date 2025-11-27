import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('Health check called');
  try {
    res.status(200).json({ status: 'OK', message: 'Gateway is running' });
  } catch (error) {
    console.error('Error en /health:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
