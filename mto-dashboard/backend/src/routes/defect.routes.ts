import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'defect endpoint' });
});

export default router;
