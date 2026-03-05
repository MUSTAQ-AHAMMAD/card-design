import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateAccessToken, generateRefreshToken, saveRefreshToken, findRefreshToken, deleteRefreshToken, verifyRefreshToken } from '../services/tokenService'
import { sendPasswordResetEmail } from '../services/emailService'
import { AppError } from '../middleware/errorHandler'
import { generateResetToken } from '../utils/helpers'

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new AppError('Email already in use', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    })

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role })
    await saveRefreshToken(user.id, refreshToken)

    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError('Invalid credentials', 401)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role })
    await saveRefreshToken(user.id, refreshToken)

    const userWithoutPassword = (({ password: _pw, ...rest }) => rest)(user)
    res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } })
  } catch (error) {
    next(error)
  }
}

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400)
    }

    const tokenRecord = await findRefreshToken(refreshToken)
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    const decoded = verifyRefreshToken(refreshToken)
    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role })

    res.json({ success: true, data: { accessToken } })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await deleteRefreshToken(refreshToken)
    }
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.deletedAt) {
      res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' })
      return
    }

    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    try {
      await sendPasswordResetEmail(email, resetToken)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
    }

    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
        deletedAt: null,
      },
    })

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    })

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    next(error)
  }
}
