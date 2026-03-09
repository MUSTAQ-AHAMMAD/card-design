import { Router } from 'express'
import { body } from 'express-validator'
import { getUsers, getProfile, updateProfile, changePassword, getUserById, updateUser, deleteUser } from '../controllers/userController'
import { requireAdmin, requireHROrAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', requireHROrAdmin, getUsers)
router.get('/profile', getProfile)
router.put('/profile',
  [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  ],
  validate,
  updateProfile
)
router.put('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  changePassword
)
router.get('/:id', requireAdmin, getUserById)
router.put('/:id', requireAdmin, validate, updateUser)
router.delete('/:id', requireAdmin, deleteUser)

export default router
