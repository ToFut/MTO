import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Purchase Order routes
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'PO list endpoint' });
});

router.get('/:id', authenticate, (req, res) => {
  res.json({ message: 'PO detail endpoint', id: req.params.id });
});

router.post('/', authenticate, (req, res) => {
  res.json({ message: 'Create PO endpoint' });
});

router.put('/:id', authenticate, (req, res) => {
  res.json({ message: 'Update PO endpoint', id: req.params.id });
});

router.delete('/:id', authenticate, (req, res) => {
  res.json({ message: 'Delete PO endpoint', id: req.params.id });
});

export default router;