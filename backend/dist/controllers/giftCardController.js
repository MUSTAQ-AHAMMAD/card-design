"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.sendGiftCard = exports.deleteGiftCard = exports.updateGiftCard = exports.getGiftCard = exports.createGiftCard = exports.listGiftCards = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const emailService_1 = require("../services/emailService");
const listGiftCards = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, helpers_1.parsePaginationParams)(req.query);
        const user = req.user;
        const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
        const where = {
            deletedAt: null,
            ...(!isAdminOrHR && { employeeId: user.id }),
        };
        const [giftCards, total] = await Promise.all([
            prisma_1.default.giftCard.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    template: { select: { id: true, name: true, category: true } },
                    employee: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            }),
            prisma_1.default.giftCard.count({ where }),
        ]);
        res.json({ success: true, data: giftCards, meta: (0, helpers_1.generatePaginationMeta)(total, page, limit) });
    }
    catch (error) {
        next(error);
    }
};
exports.listGiftCards = listGiftCards;
const createGiftCard = async (req, res, next) => {
    try {
        const { templateId, customizations, amount, occasion, message, scheduledAt, recipientEmail, recipientName, personalMessage } = req.body;
        const giftCard = await prisma_1.default.giftCard.create({
            data: {
                templateId: templateId || null,
                employeeId: req.user.id,
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
        });
        if (templateId) {
            await prisma_1.default.template.update({
                where: { id: templateId },
                data: { usageCount: { increment: 1 } },
            });
        }
        res.status(201).json({ success: true, data: giftCard });
    }
    catch (error) {
        next(error);
    }
};
exports.createGiftCard = createGiftCard;
const getGiftCard = async (req, res, next) => {
    try {
        const user = req.user;
        const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
        const giftCard = await prisma_1.default.giftCard.findFirst({
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
        });
        if (!giftCard)
            throw new errorHandler_1.AppError('Gift card not found', 404);
        res.json({ success: true, data: giftCard });
    }
    catch (error) {
        next(error);
    }
};
exports.getGiftCard = getGiftCard;
const updateGiftCard = async (req, res, next) => {
    try {
        const user = req.user;
        const existing = await prisma_1.default.giftCard.findFirst({
            where: { id: req.params.id, deletedAt: null },
        });
        if (!existing)
            throw new errorHandler_1.AppError('Gift card not found', 404);
        if (existing.employeeId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR_MANAGER') {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        if (existing.status !== 'DRAFT') {
            throw new errorHandler_1.AppError('Only DRAFT gift cards can be edited', 400);
        }
        const { customizations, amount, occasion, message, scheduledAt, templateId, recipientEmail, recipientName } = req.body;
        const updated = await prisma_1.default.giftCard.update({
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
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateGiftCard = updateGiftCard;
const deleteGiftCard = async (req, res, next) => {
    try {
        const user = req.user;
        const existing = await prisma_1.default.giftCard.findFirst({ where: { id: req.params.id, deletedAt: null } });
        if (!existing)
            throw new errorHandler_1.AppError('Gift card not found', 404);
        if (existing.employeeId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR_MANAGER') {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        await prisma_1.default.giftCard.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
        res.json({ success: true, message: 'Gift card deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteGiftCard = deleteGiftCard;
const sendGiftCard = async (req, res, next) => {
    try {
        const user = req.user;
        const giftCard = await prisma_1.default.giftCard.findFirst({
            where: { id: req.params.id, deletedAt: null },
            include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
        if (!giftCard)
            throw new errorHandler_1.AppError('Gift card not found', 404);
        if (giftCard.employeeId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR_MANAGER') {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        if (giftCard.status !== 'DRAFT') {
            throw new errorHandler_1.AppError('Gift card has already been sent', 400);
        }
        // Resolve recipient email: prefer the one from the request body, fall back to the stored one
        const effectiveRecipientEmail = req.body.recipientEmail || giftCard.recipientEmail || '';
        if (!effectiveRecipientEmail)
            throw new errorHandler_1.AppError('Recipient email is required', 400);
        let emailStatus = 'SENT';
        let emailError = null;
        try {
            await (0, emailService_1.sendGiftCardEmail)({
                id: giftCard.id,
                amount: giftCard.amount,
                occasion: giftCard.occasion,
                message: giftCard.message,
                employee: giftCard.employee,
            }, effectiveRecipientEmail);
        }
        catch (err) {
            emailStatus = 'FAILED';
            emailError = err instanceof Error ? err.message : 'Failed to send email';
        }
        const now = new Date();
        const [updatedGiftCard] = await Promise.all([
            prisma_1.default.giftCard.update({
                where: { id: req.params.id },
                data: { status: 'SENT', sentAt: now },
                include: {
                    template: { select: { id: true, name: true, category: true } },
                    employee: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            }),
            prisma_1.default.emailLog.create({
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
        ]);
        res.json({ success: true, data: updatedGiftCard });
    }
    catch (error) {
        next(error);
    }
};
exports.sendGiftCard = sendGiftCard;
const getHistory = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, helpers_1.parsePaginationParams)(req.query);
        const user = req.user;
        const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
        const where = {
            deletedAt: null,
            status: { in: ['SENT', 'RECEIVED', 'EXPIRED'] },
            ...(!isAdminOrHR && { employeeId: user.id }),
        };
        const [giftCards, total] = await Promise.all([
            prisma_1.default.giftCard.findMany({
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
            prisma_1.default.giftCard.count({ where }),
        ]);
        res.json({ success: true, data: giftCards, meta: (0, helpers_1.generatePaginationMeta)(total, page, limit) });
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
//# sourceMappingURL=giftCardController.js.map