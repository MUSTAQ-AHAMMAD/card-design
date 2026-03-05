import { Router } from 'express'
import { getDashboard, getReports } from '../controllers/analyticsController'
import { requireHROrAdmin } from '../middleware/auth'

const router = Router()

router.get('/dashboard', requireHROrAdmin, getDashboard)
router.get('/reports', requireHROrAdmin, getReports)

export default router
