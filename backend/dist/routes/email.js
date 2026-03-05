"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const emailController_1 = require("../controllers/emailController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get('/templates', emailController_1.listEmailTemplates);
router.post('/templates', auth_1.requireHROrAdmin, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('subject').trim().notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('body').trim().notEmpty().withMessage('Body is required'),
], validate_1.validate, emailController_1.createEmailTemplate);
router.put('/templates/:id', auth_1.requireHROrAdmin, validate_1.validate, emailController_1.updateEmailTemplate);
router.delete('/templates/:id', auth_1.requireHROrAdmin, emailController_1.deleteEmailTemplate);
router.post('/send-test', auth_1.requireHROrAdmin, [
    (0, express_validator_1.body)('to').isEmail().normalizeEmail().withMessage('Valid recipient email is required'),
    (0, express_validator_1.body)('subject').trim().notEmpty().withMessage('Subject is required'),
], validate_1.validate, emailController_1.sendTestEmail);
router.get('/logs', auth_1.requireHROrAdmin, emailController_1.getEmailLogs);
exports.default = router;
//# sourceMappingURL=email.js.map