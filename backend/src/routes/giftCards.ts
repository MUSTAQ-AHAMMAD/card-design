import { Router } from 'express'
import { body } from 'express-validator'
import { listGiftCards, createGiftCard, getGiftCard, updateGiftCard, deleteGiftCard, sendGiftCard, getHistory } from '../controllers/giftCardController'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', listGiftCards)
router.get('/history', getHistory)
router.post('/',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('occasion').trim().notEmpty().withMessage('Occasion is required'),
  ],
  validate,
  createGiftCard
)
router.get('/:id', getGiftCard)
router.put('/:id', validate, updateGiftCard)
router.delete('/:id', deleteGiftCard)
router.post('/:id/send',
  [body('recipientEmail').optional().isEmail().normalizeEmail().withMessage('Valid recipient email is required')],
  validate,
  sendGiftCard
)

export default router
