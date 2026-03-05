import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers'

export const listTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query)
    const search = String(req.query.search || '')
    const category = req.query.category as string | undefined

    const where: Record<string, unknown> = {
      deletedAt: null,
      isActive: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { category: { contains: search } },
        ],
      }),
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.template.count({ where }),
    ])

    res.json({ success: true, data: templates, meta: generatePaginationMeta(total, page, limit) })
  } catch (error) {
    next(error)
  }
}

export const createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, category, designData, thumbnail } = req.body
    const template = await prisma.template.create({
      data: {
        name,
        category,
        designData: typeof designData === 'string' ? designData : JSON.stringify(designData),
        thumbnail,
        createdById: req.user!.id,
      },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    })
    res.status(201).json({ success: true, data: template })
  } catch (error) {
    next(error)
  }
}

export const getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    })
    if (!template) throw new AppError('Template not found', 404)
    res.json({ success: true, data: template })
  } catch (error) {
    next(error)
  }
}

export const updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, category, designData, thumbnail, isActive } = req.body
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(designData !== undefined && { designData: typeof designData === 'string' ? designData : JSON.stringify(designData) }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    })
    res.json({ success: true, data: template })
  } catch (error) {
    next(error)
  }
}

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.template.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    })
    res.json({ success: true, message: 'Template deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templates = await prisma.template.findMany({
      where: { deletedAt: null, isActive: true },
      select: { category: true },
      distinct: ['category'],
    })
    const categories = templates.map((t) => t.category)
    res.json({ success: true, data: categories })
  } catch (error) {
    next(error)
  }
}
