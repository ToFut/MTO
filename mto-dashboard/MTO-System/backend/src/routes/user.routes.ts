import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', userController.getUsers);

// Get single user
router.get('/:id', userController.getUser);

// Create new user (admin only)
router.post('/',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('role').isIn(['admin', 'brand_user', 'brand_manager', 'factory_user', 'factory_operator'])
      .withMessage('Valid role is required')
  ],
  userController.createUser
);

// Update user
router.put('/:id', userController.updateUser);

// Toggle user active status
router.patch('/:id', userController.toggleUserStatus);

// Delete user (admin only)
router.delete('/:id', userController.deleteUser);

export default router;