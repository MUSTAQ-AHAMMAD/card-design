"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const giftCardController_1 = require("../controllers/giftCardController");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get('/', giftCardController_1.listGiftCards);
router.get('/history', giftCardController_1.getHistory);
router.post('/', [
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('occasion').trim().notEmpty().withMessage('Occasion is required'),
], validate_1.validate, giftCardController_1.createGiftCard);
router.get('/:id', giftCardController_1.getGiftCard);
router.put('/:id', validate_1.validate, giftCardController_1.updateGiftCard);
router.delete('/:id', giftCardController_1.deleteGiftCard);
router.post('/:id/send', [(0, express_validator_1.body)('recipientEmail').optional().isEmail().normalizeEmail().withMessage('Valid recipient email is required')], validate_1.validate, giftCardController_1.sendGiftCard);
exports.default = router;
//# sourceMappingURL=giftCards.js.map