import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, refresh, logout, forgotPassword, resetPassword } from '../controllers/authController'
import { validate } from '../middleware/validate'

const router = Router()

router.post('/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
)

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
)

router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refresh
)

router.post('/logout', logout)

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
)

router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
)

export default router
