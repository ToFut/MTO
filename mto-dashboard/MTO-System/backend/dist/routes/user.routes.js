"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all users (admin only)
router.get('/', user_controller_1.userController.getUsers);
// Get single user
router.get('/:id', user_controller_1.userController.getUser);
// Create new user (admin only)
router.post('/', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('full_name').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('role').isIn(['admin', 'brand_user', 'brand_manager', 'factory_user', 'factory_operator'])
        .withMessage('Valid role is required')
], user_controller_1.userController.createUser);
// Update user
router.put('/:id', user_controller_1.userController.updateUser);
// Toggle user active status
router.patch('/:id', user_controller_1.userController.toggleUserStatus);
// Delete user (admin only)
router.delete('/:id', user_controller_1.userController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map