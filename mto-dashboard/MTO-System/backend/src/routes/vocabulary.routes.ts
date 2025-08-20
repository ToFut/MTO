import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'vocabulary endpoint' });
});

export default router;
