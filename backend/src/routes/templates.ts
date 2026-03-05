import { Router } from 'express'
import { body } from 'express-validator'
import { listTemplates, createTemplate, getTemplateById, updateTemplate, deleteTemplate, getCategories } from '../controllers/templateController'
import { requireHROrAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', listTemplates)
router.get('/categories', getCategories)
router.post('/',
  requireHROrAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('designData').notEmpty().withMessage('Design data is required'),
  ],
  validate,
  createTemplate
)
router.get('/:id', getTemplateById)
router.put('/:id', requireHROrAdmin, validate, updateTemplate)
router.delete('/:id', requireHROrAdmin, deleteTemplate)

export default router
