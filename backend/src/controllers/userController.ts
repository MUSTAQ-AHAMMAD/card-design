import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers'

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  avatar: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query)
    const search = String(req.query.search || '')
    const role = req.query.role as string | undefined

    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(role && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ])

    res.json({ success: true, data: users, meta: generatePaginationMeta(total, page, limit) })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: userSelect,
    })

    if (!user) throw new AppError('User not found', 404)
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, avatar } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(avatar !== undefined && { avatar }),
      },
      select: userSelect,
    })
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) throw new AppError('User not found', 404)

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) throw new AppError('Current password is incorrect', 400)

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: userSelect,
    })
    if (!user) throw new AppError('User not found', 404)
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, role, isActive, avatar } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(avatar !== undefined && { avatar }),
      },
      select: userSelect,
    })
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.params.id === req.user!.id) {
      throw new AppError('Cannot delete your own account', 400)
    }
    await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    })
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    next(error)
  }
}
