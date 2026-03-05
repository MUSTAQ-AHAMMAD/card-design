import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalUsers, totalGiftCards, giftCardsByStatusRaw, recentActivity, topTemplates, totalAmountResult] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.giftCard.count({ where: { deletedAt: null } }),
      prisma.giftCard.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { status: true } }),
      prisma.emailLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          giftCard: { select: { id: true, occasion: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.template.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { usageCount: 'desc' },
        take: 5,
        select: { id: true, name: true, category: true, usageCount: true },
      }),
      prisma.giftCard.aggregate({
        where: { deletedAt: null, status: { in: ['SENT', 'RECEIVED'] } },
        _sum: { amount: true },
      }),
    ])

    const giftCardsByStatus: Record<string, number> = {}
    for (const item of giftCardsByStatusRaw) {
      giftCardsByStatus[item.status] = item._count.status
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalGiftCards,
        totalAmountSent: totalAmountResult._sum.amount || 0,
        giftCardsByStatus,
        recentActivity,
        topTemplates,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [giftCardsByOccasion, recentGiftCards, totalAmountResult] = await Promise.all([
      prisma.giftCard.groupBy({
        by: ['occasion'],
        where: { deletedAt: null },
        _count: { occasion: true },
        _sum: { amount: true },
      }),
      prisma.giftCard.findMany({
        where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, amount: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.giftCard.aggregate({
        where: { deletedAt: null, status: { in: ['SENT', 'RECEIVED'] } },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ])

    const byMonth: Record<string, { count: number; amount: number }> = {}
    for (const card of recentGiftCards) {
      const key = `${card.createdAt.getFullYear()}-${String(card.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth[key]) byMonth[key] = { count: 0, amount: 0 }
      byMonth[key].count++
      byMonth[key].amount += card.amount
    }

    res.json({
      success: true,
      data: {
        giftCardsByOccasion: giftCardsByOccasion.map((item) => ({
          occasion: item.occasion,
          count: item._count.occasion,
          totalAmount: item._sum.amount || 0,
        })),
        giftCardsByMonth: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
        summary: {
          totalSent: totalAmountResult._count.id,
          totalAmount: totalAmountResult._sum.amount || 0,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
