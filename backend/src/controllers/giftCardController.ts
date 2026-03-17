import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers'
import { sendGiftCardEmail } from '../services/emailService'

export const listGiftCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query)
    const user = req.user!
    const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR_MANAGER'

    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(!isAdminOrHR && { employeeId: user.id }),
    }

    const [giftCards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: { select: { id: true, name: true, category: true } },
          employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.giftCard.count({ where }),
    ])

    res.json({ success: true, data: giftCards, meta: generatePaginationMeta(total, page, limit) })
  } catch (error) {
    next(error)
  }
}

export const createGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { templateId, customizations, amount, occasion, message, scheduledAt, recipientEmail, recipientName, personalMessage } = req.body

    const giftCard = await prisma.giftCard.create({
      data: {
        templateId: templateId || null,
        employeeId: req.user!.id,
        customizations: typeof customizations === 'string' ? customizations : JSON.stringify(customizations || {}),
        amount: parseFloat(amount),
        occasion,
        message: message || personalMessage || null,
        recipientEmail: recipientEmail || null,
        recipientName: recipientName || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'DRAFT',
      },
      include: {
        template: { select: { id: true, name: true, category: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    if (templateId) {
      await prisma.template.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
      })
    }

    res.status(201).json({ success: true, data: giftCard })
  } catch (error) {
    next(error)
  }
}

export const getGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!
    const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR_MANAGER'

    const giftCard = await prisma.giftCard.findFirst({
      where: {
        id: req.params.id,
        deletedAt: null,
        ...(!isAdminOrHR && { employeeId: user.id }),
      },
      include: {
        template: true,
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        emailLogs: true,
      },
    })

    if (!giftCard) throw new AppError('Gift card not found', 404)
    res.json({ success: true, data: giftCard })
  } catch (error) {
    next(error)
  }
}

export const updateGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!
    const existing = await prisma.giftCard.findFirst({
      where: { id: req.params.id, deletedAt: null },
    })

    if (!existing) throw new AppError('Gift card not found', 404)
    if (existing.employeeId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR_MANAGER') {
      throw new AppError('Access denied', 403)
    }
    if (existing.status !== 'DRAFT') {
      throw new AppError('Only DRAFT gift cards can be edited', 400)
    }

    const { customizations, amount, occasion, message, scheduledAt, templateId, recipientEmail, recipientName } = req.body
    const updated = await prisma.giftCard.update({
      where: { id: req.params.id },
      data: {
        ...(templateId !== undefined && { templateId }),
        ...(customizations !== undefined && { customizations: typeof customizations === 'string' ? customizations : JSON.stringify(customizations) }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(occasion && { occasion }),
        ...(message !== undefined && { message }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(recipientEmail !== undefined && { recipientEmail: recipientEmail || null }),
        ...(recipientName !== undefined && { recipientName: recipientName || null }),
      },
      include: {
        template: { select: { id: true, name: true, category: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    next(error)
  }
}

export const deleteGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!
    const existing = await prisma.giftCard.findFirst({ where: { id: req.params.id, deletedAt: null } })
    if (!existing) throw new AppError('Gift card not found', 404)
    if (existing.employeeId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR_MANAGER') {
      throw new AppError('Access denied', 403)
    }

    await prisma.giftCard.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } })
    res.json({ success: true, message: 'Gift card deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const sendGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!

    const giftCard = await prisma.giftCard.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
    })

    if (!giftCard) throw new AppError('Gift card not found', 404)
    if (giftCard.employeeId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR_MANAGER') {
      throw new AppError('Access denied', 403)
    }
    if (giftCard.status !== 'DRAFT') {
      throw new AppError('Gift card has already been sent', 400)
    }

    // Resolve recipient email: prefer the one from the request body, fall back to the stored one
    const effectiveRecipientEmail: string = req.body.recipientEmail || giftCard.recipientEmail || ''
    if (!effectiveRecipientEmail) throw new AppError('Recipient email is required', 400)

    let emailStatus = 'SENT'
    let emailError: string | null = null

    try {
      await sendGiftCardEmail(
        {
          id: giftCard.id,
          amount: giftCard.amount,
          occasion: giftCard.occasion,
          message: giftCard.message,
          employee: giftCard.employee,
        },
        effectiveRecipientEmail
      )
    } catch (err) {
      emailStatus = 'FAILED'
      emailError = err instanceof Error ? err.message : 'Failed to send email'
    }

    const now = new Date()
    const [updatedGiftCard] = await Promise.all([
      prisma.giftCard.update({
        where: { id: req.params.id },
        data: { status: 'SENT', sentAt: now },
        include: {
          template: { select: { id: true, name: true, category: true } },
          employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.emailLog.create({
        data: {
          giftCardId: giftCard.id,
          userId: user.id,
          recipient: effectiveRecipientEmail,
          subject: `You've received a ${giftCard.occasion} Gift Card!`,
          status: emailStatus,
          error: emailError,
          sentAt: emailStatus === 'SENT' ? now : null,
        },
      }),
    ])

    res.json({ success: true, data: updatedGiftCard })
  } catch (error) {
    next(error)
  }
}

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query)
    const user = req.user!
    const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR_MANAGER'

    const where: Record<string, unknown> = {
      deletedAt: null,
      status: { in: ['SENT', 'RECEIVED', 'EXPIRED'] },
      ...(!isAdminOrHR && { employeeId: user.id }),
    }

    const [giftCards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          template: { select: { id: true, name: true, category: true } },
          employee: { select: { id: true, firstName: true, lastName: true, email: true } },
          emailLogs: true,
        },
      }),
      prisma.giftCard.count({ where }),
    ])

    res.json({ success: true, data: giftCards, meta: generatePaginationMeta(total, page, limit) })
  } catch (error) {
    next(error)
  }
}
