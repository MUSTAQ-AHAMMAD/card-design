"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = exports.getDashboard = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getDashboard = async (req, res, next) => {
    try {
        const [totalUsers, totalGiftCards, giftCardsByStatusRaw, recentActivity, topTemplates, totalAmountResult] = await Promise.all([
            prisma_1.default.user.count({ where: { deletedAt: null, isActive: true } }),
            prisma_1.default.giftCard.count({ where: { deletedAt: null } }),
            prisma_1.default.giftCard.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { status: true } }),
            prisma_1.default.emailLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    giftCard: { select: { id: true, occasion: true } },
                    user: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
            prisma_1.default.template.findMany({
                where: { deletedAt: null, isActive: true },
                orderBy: { usageCount: 'desc' },
                take: 5,
                select: { id: true, name: true, category: true, usageCount: true },
            }),
            prisma_1.default.giftCard.aggregate({
                where: { deletedAt: null, status: { in: ['SENT', 'RECEIVED'] } },
                _sum: { amount: true },
            }),
        ]);
        const giftCardsByStatus = {};
        for (const item of giftCardsByStatusRaw) {
            giftCardsByStatus[item.status] = item._count.status;
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
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
const getReports = async (req, res, next) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const [giftCardsByOccasion, recentGiftCards, totalAmountResult] = await Promise.all([
            prisma_1.default.giftCard.groupBy({
                by: ['occasion'],
                where: { deletedAt: null },
                _count: { occasion: true },
                _sum: { amount: true },
            }),
            prisma_1.default.giftCard.findMany({
                where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
                select: { createdAt: true, amount: true, status: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma_1.default.giftCard.aggregate({
                where: { deletedAt: null, status: { in: ['SENT', 'RECEIVED'] } },
                _sum: { amount: true },
                _count: { id: true },
            }),
        ]);
        const byMonth = {};
        for (const card of recentGiftCards) {
            const key = `${card.createdAt.getFullYear()}-${String(card.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (!byMonth[key])
                byMonth[key] = { count: 0, amount: 0 };
            byMonth[key].count++;
            byMonth[key].amount += card.amount;
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
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReports = getReports;
//# sourceMappingURL=analyticsController.js.map