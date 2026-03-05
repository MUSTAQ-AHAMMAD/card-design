"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailLogs = exports.sendTestEmail = exports.deleteEmailTemplate = exports.updateEmailTemplate = exports.createEmailTemplate = exports.listEmailTemplates = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const emailService_1 = require("../services/emailService");
const listEmailTemplates = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, helpers_1.parsePaginationParams)(req.query);
        const [templates, total] = await Promise.all([
            prisma_1.default.emailTemplate.findMany({ where: { deletedAt: null }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            prisma_1.default.emailTemplate.count({ where: { deletedAt: null } }),
        ]);
        res.json({ success: true, data: templates, meta: (0, helpers_1.generatePaginationMeta)(total, page, limit) });
    }
    catch (error) {
        next(error);
    }
};
exports.listEmailTemplates = listEmailTemplates;
const createEmailTemplate = async (req, res, next) => {
    try {
        const { name, subject, body, variables } = req.body;
        const template = await prisma_1.default.emailTemplate.create({
            data: {
                name,
                subject,
                body,
                variables: typeof variables === 'string' ? variables : JSON.stringify(variables || []),
            },
        });
        res.status(201).json({ success: true, data: template });
    }
    catch (error) {
        next(error);
    }
};
exports.createEmailTemplate = createEmailTemplate;
const updateEmailTemplate = async (req, res, next) => {
    try {
        const { name, subject, body, variables, isActive } = req.body;
        const template = await prisma_1.default.emailTemplate.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(subject && { subject }),
                ...(body && { body }),
                ...(variables !== undefined && { variables: typeof variables === 'string' ? variables : JSON.stringify(variables) }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json({ success: true, data: template });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEmailTemplate = updateEmailTemplate;
const deleteEmailTemplate = async (req, res, next) => {
    try {
        await prisma_1.default.emailTemplate.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date(), isActive: false },
        });
        res.json({ success: true, message: 'Email template deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEmailTemplate = deleteEmailTemplate;
const sendTestEmail = async (req, res, next) => {
    try {
        const { to, subject, html } = req.body;
        await (0, emailService_1.sendEmail)({ to, subject, html: html || `<p>This is a test email from the Gift Card System.</p>` });
        res.json({ success: true, message: 'Test email sent successfully' });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to send test email', 500));
    }
};
exports.sendTestEmail = sendTestEmail;
const getEmailLogs = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, helpers_1.parsePaginationParams)(req.query);
        const [logs, total] = await Promise.all([
            prisma_1.default.emailLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    giftCard: { select: { id: true, occasion: true, amount: true } },
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            }),
            prisma_1.default.emailLog.count(),
        ]);
        res.json({ success: true, data: logs, meta: (0, helpers_1.generatePaginationMeta)(total, page, limit) });
    }
    catch (error) {
        next(error);
    }
};
exports.getEmailLogs = getEmailLogs;
//# sourceMappingURL=emailController.js.map