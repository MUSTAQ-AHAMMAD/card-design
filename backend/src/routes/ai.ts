import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { checkGrammar, generateContentSuggestions, enhanceText } from '../controllers/aiController';

const router = Router();

/**
 * @route   POST /api/ai/grammar-check
 * @desc    Check grammar and spelling in text
 * @access  Private
 */
router.post(
  '/grammar-check',
  [
    body('text').isString().trim().notEmpty().withMessage('Text is required')
      .isLength({ max: 5000 }).withMessage('Text must be less than 5000 characters'),
    body('language').optional().isString().isIn(['en', 'es', 'fr', 'de']).withMessage('Invalid language code'),
    validate
  ],
  checkGrammar
);

/**
 * @route   POST /api/ai/content-suggestions
 * @desc    Generate content suggestions for gift card messages
 * @access  Private
 */
router.post(
  '/content-suggestions',
  [
    body('context').isString().trim().notEmpty().withMessage('Context is required')
      .isLength({ max: 500 }).withMessage('Context must be less than 500 characters'),
    body('occasion').optional().isString().isIn(['birthday', 'holiday', 'appreciation', 'general'])
      .withMessage('Invalid occasion type'),
    body('tone').optional().isString().isIn(['formal', 'casual', 'friendly', 'professional'])
      .withMessage('Invalid tone type'),
    validate
  ],
  generateContentSuggestions
);

/**
 * @route   POST /api/ai/enhance-text
 * @desc    Enhance text with AI-powered improvements
 * @access  Private
 */
router.post(
  '/enhance-text',
  [
    body('text').isString().trim().notEmpty().withMessage('Text is required')
      .isLength({ max: 5000 }).withMessage('Text must be less than 5000 characters'),
    body('style').optional().isString().isIn(['professional', 'casual', 'formal'])
      .withMessage('Invalid style type'),
    validate
  ],
  enhanceText
);

export default router;
