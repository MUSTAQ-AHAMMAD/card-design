import crypto from 'crypto'

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const generatePaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export const parsePaginationParams = (query: Record<string, unknown>): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(String(query.page || '1')))
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '10'))))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}
