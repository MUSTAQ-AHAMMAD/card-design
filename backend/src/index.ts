import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import templateRoutes from './routes/templates'
import giftCardRoutes from './routes/giftCards'
import emailRoutes from './routes/email'
import analyticsRoutes from './routes/analytics'
import { authenticate } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded design images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', authenticate, userRoutes)
app.use('/api/templates', authenticate, templateRoutes)
app.use('/api/gift-cards', authenticate, giftCardRoutes)
app.use('/api/email', authenticate, emailRoutes)
app.use('/api/analytics', authenticate, analyticsRoutes)

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Gift Card API is running', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
