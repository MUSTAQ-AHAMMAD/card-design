"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate_1.validate, authController_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], validate_1.validate, authController_1.login);
router.post('/refresh', [(0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required')], validate_1.validate, authController_1.refresh);
router.post('/logout', authController_1.logout);
router.post('/forgot-password', [(0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required')], validate_1.validate, authController_1.forgotPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate_1.validate, authController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map