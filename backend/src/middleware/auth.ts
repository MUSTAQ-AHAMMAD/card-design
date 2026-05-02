import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../services/tokenService'
import { AppError } from './errorHandler'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)
    req.user = {
      ...decoded as { id: string; email: string; role: string },
      userId: (decoded as any).userId || (decoded as any).id
    }
    next()
  } catch (error) {
    next(new AppError('Invalid or expired token', 401))
  }
}

// requireAdmin and requireHROrAdmin must be used after authenticate middleware,
// which is applied at the app.use() level in index.ts for all protected route groups.
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    next(new AppError('Admin access required', 403))
    return
  }
  next()
}

export const requireHROrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'HR_MANAGER')) {
    next(new AppError('HR Manager or Admin access required', 403))
    return
  }
  next()
}
