"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAdmin, userController_1.getUsers);
router.get('/profile', userController_1.getProfile);
router.put('/profile', [
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
], validate_1.validate, userController_1.updateProfile);
router.put('/change-password', [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], validate_1.validate, userController_1.changePassword);
router.get('/:id', auth_1.requireAdmin, userController_1.getUserById);
router.put('/:id', auth_1.requireAdmin, validate_1.validate, userController_1.updateUser);
router.delete('/:id', auth_1.requireAdmin, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map