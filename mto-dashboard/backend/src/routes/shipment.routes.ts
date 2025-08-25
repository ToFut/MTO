import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'shipment endpoint' });
});

export default router;
