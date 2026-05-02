import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  addBrandAsset,
  deleteBrandAsset
} from '../controllers/brandController';

const router = Router();

/**
 * @route   GET /api/brands
 * @desc    Get all brands with pagination
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
  ],
  getAllBrands
);

/**
 * @route   GET /api/brands/:id
 * @desc    Get a single brand by ID
 * @access  Private
 */
router.get(
  '/:id',
  [
    param('id').isString().notEmpty().withMessage('Brand ID is required'),
    validate
  ],
  getBrandById
);

/**
 * @route   POST /api/brands
 * @desc    Create a new brand
 * @access  Private (Admin only)
 */
router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().withMessage('Brand name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Brand name must be between 2 and 100 characters'),
    body('logoUrl').optional().isString().isURL().withMessage('Logo URL must be a valid URL'),
    body('primaryColor').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Primary color must be a valid hex color'),
    body('secondaryColor').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Secondary color must be a valid hex color'),
    body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('website').optional().isString().isURL().withMessage('Website must be a valid URL'),
    validate
  ],
  createBrand
);

/**
 * @route   PUT /api/brands/:id
 * @desc    Update a brand
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  [
    param('id').isString().notEmpty().withMessage('Brand ID is required'),
    body('name').optional().isString().trim().notEmpty()
      .isLength({ min: 2, max: 100 }).withMessage('Brand name must be between 2 and 100 characters'),
    body('logoUrl').optional().isString().isURL().withMessage('Logo URL must be a valid URL'),
    body('primaryColor').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Primary color must be a valid hex color'),
    body('secondaryColor').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Secondary color must be a valid hex color'),
    body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('website').optional().isString().isURL().withMessage('Website must be a valid URL'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
  ],
  updateBrand
);

/**
 * @route   DELETE /api/brands/:id
 * @desc    Soft delete a brand
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  [
    param('id').isString().notEmpty().withMessage('Brand ID is required'),
    validate
  ],
  deleteBrand
);

/**
 * @route   POST /api/brands/:id/assets
 * @desc    Add an asset to a brand
 * @access  Private (Admin only)
 */
router.post(
  '/:id/assets',
  [
    param('id').isString().notEmpty().withMessage('Brand ID is required'),
    body('name').isString().trim().notEmpty().withMessage('Asset name is required'),
    body('assetType').isString().isIn(['logo', 'icon', 'banner', 'image', 'font']).withMessage('Invalid asset type'),
    body('fileUrl').isString().isURL().withMessage('File URL must be a valid URL'),
    body('mimeType').optional().isString(),
    body('fileSize').optional().isInt({ min: 0 }).withMessage('File size must be a positive integer'),
    body('width').optional().isInt({ min: 0 }).withMessage('Width must be a positive integer'),
    body('height').optional().isInt({ min: 0 }).withMessage('Height must be a positive integer'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object'),
    validate
  ],
  addBrandAsset
);

/**
 * @route   DELETE /api/brands/:id/assets/:assetId
 * @desc    Delete a brand asset
 * @access  Private (Admin only)
 */
router.delete(
  '/:id/assets/:assetId',
  [
    param('id').isString().notEmpty().withMessage('Brand ID is required'),
    param('assetId').isString().notEmpty().withMessage('Asset ID is required'),
    validate
  ],
  deleteBrandAsset
);

export default router;
