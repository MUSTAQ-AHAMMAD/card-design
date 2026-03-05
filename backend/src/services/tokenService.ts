import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set')
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'

const parseExpiryToMs = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const value = parseInt(match[1])
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return value * (multipliers[unit] ?? 86400000)
}

export interface TokenPayload {
  id: string
  email: string
  role: string
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions)
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
}

export const saveRefreshToken = async (userId: string, token: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_TOKEN_EXPIRY))

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  })
}

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  })
}

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { token } })
}

export const deleteUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { userId } })
}
