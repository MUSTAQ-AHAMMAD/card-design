import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers'
import { sendEmail } from '../services/emailService'

export const listEmailTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query)
    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({ where: { deletedAt: null }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.emailTemplate.count({ where: { deletedAt: null } }),
    ])
    res.json({ success: true, data: templates, meta: generatePaginationMeta(total, page, limit) })
  } catch (error) {
    next(error)
  }
}

export const createEmailTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, subject, body, variables } = req.body
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        variables: typeof variables === 'string' ? variables : JSON.stringify(variables || []),
      },
    })
    res.status(201).json({ success: true, data: template })
  } catch (error) {
    next(error)
  }
}

export const updateEmailTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, subject, body, variables, isActive } = req.body
    const template = await prisma.emailTemplate.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(body && { body }),
        ...(variables !== undefined && { variables: typeof variables === 'string' ? variables : JSON.stringify(variables) }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    res.json({ success: true, data: template })
  } catch (error) {
    next(error)
  }
}

export const deleteEmailTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.emailTemplate.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    })
    res.json({ success: true, message: 'Email template deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const sendTestEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { to, subject, html } = req.body
    await sendEmail({ to, subject, html: html || `<p>This is a test email from the Gift Card System.</p>` })
    res.json({ success: true, message: 'Test email sent successfully' })
  } catch (error) {
    next(new AppError('Failed to send test email', 500))
  }
}

export const getEmailLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query)
    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          giftCard: { select: { id: true, occasion: true, amount: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.emailLog.count(),
    ])
    res.json({ success: true, data: logs, meta: generatePaginationMeta(total, page, limit) })
  } catch (error) {
    next(error)
  }
}
