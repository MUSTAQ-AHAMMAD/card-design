import { Router } from 'express'
import { body } from 'express-validator'
import { listEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, sendTestEmail, getEmailLogs } from '../controllers/emailController'
import { requireHROrAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/templates', listEmailTemplates)
router.post('/templates',
  requireHROrAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Body is required'),
  ],
  validate,
  createEmailTemplate
)
router.put('/templates/:id', requireHROrAdmin, validate, updateEmailTemplate)
router.delete('/templates/:id', requireHROrAdmin, deleteEmailTemplate)
router.post('/send-test',
  requireHROrAdmin,
  [
    body('to').isEmail().normalizeEmail().withMessage('Valid recipient email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
  ],
  validate,
  sendTestEmail
)
router.get('/logs', requireHROrAdmin, getEmailLogs)

export default router
