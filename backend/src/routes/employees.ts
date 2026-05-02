import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  getAllEmployees,
  getEmployeeById,
  syncFromOutlook,
  searchEmployees,
  getDepartments
} from '../controllers/employeeController';

const router = Router();

/**
 * @route   GET /api/employees
 * @desc    Get all cached employees with pagination
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('department').optional().isString().trim(),
    validate
  ],
  getAllEmployees
);

/**
 * @route   GET /api/employees/search
 * @desc    Search employees
 * @access  Private
 */
router.get(
  '/search',
  [
    query('q').isString().trim().notEmpty().withMessage('Search query is required')
      .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    validate
  ],
  searchEmployees
);

/**
 * @route   GET /api/employees/departments
 * @desc    Get list of all departments
 * @access  Private
 */
router.get('/departments', getDepartments);

/**
 * @route   GET /api/employees/:id
 * @desc    Get a single employee by ID
 * @access  Private
 */
router.get(
  '/:id',
  [
    param('id').isString().notEmpty().withMessage('Employee ID is required'),
    validate
  ],
  getEmployeeById
);

/**
 * @route   POST /api/employees/sync
 * @desc    Sync employees from Outlook/Microsoft Graph
 * @access  Private (Admin only)
 */
router.post(
  '/sync',
  [
    body('forceRefresh').optional().isBoolean().withMessage('forceRefresh must be a boolean'),
    validate
  ],
  syncFromOutlook
);

export default router;
