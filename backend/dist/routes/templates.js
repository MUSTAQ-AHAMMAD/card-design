"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const templateController_1 = require("../controllers/templateController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get('/', templateController_1.listTemplates);
router.get('/categories', templateController_1.getCategories);
router.post('/upload-image', auth_1.requireHROrAdmin, upload_1.uploadDesignImage, templateController_1.uploadDesignImageHandler);
router.post('/', auth_1.requireHROrAdmin, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('category').trim().notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('designData').notEmpty().withMessage('Design data is required'),
], validate_1.validate, templateController_1.createTemplate);
router.get('/:id', templateController_1.getTemplateById);
router.put('/:id', auth_1.requireHROrAdmin, validate_1.validate, templateController_1.updateTemplate);
router.delete('/:id', auth_1.requireHROrAdmin, templateController_1.deleteTemplate);
exports.default = router;
//# sourceMappingURL=templates.js.map