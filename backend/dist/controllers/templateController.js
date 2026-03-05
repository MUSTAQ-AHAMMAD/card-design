"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.deleteTemplate = exports.updateTemplate = exports.getTemplateById = exports.createTemplate = exports.listTemplates = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const listTemplates = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, helpers_1.parsePaginationParams)(req.query);
        const search = String(req.query.search || '');
        const category = req.query.category;
        const where = {
            deletedAt: null,
            isActive: true,
            ...(category && { category }),
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { category: { contains: search } },
                ],
            }),
        };
        const [templates, total] = await Promise.all([
            prisma_1.default.template.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
            }),
            prisma_1.default.template.count({ where }),
        ]);
        res.json({ success: true, data: templates, meta: (0, helpers_1.generatePaginationMeta)(total, page, limit) });
    }
    catch (error) {
        next(error);
    }
};
exports.listTemplates = listTemplates;
const createTemplate = async (req, res, next) => {
    try {
        const { name, category, designData, thumbnail } = req.body;
        const template = await prisma_1.default.template.create({
            data: {
                name,
                category,
                designData: typeof designData === 'string' ? designData : JSON.stringify(designData),
                thumbnail,
                createdById: req.user.id,
            },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
        });
        res.status(201).json({ success: true, data: template });
    }
    catch (error) {
        next(error);
    }
};
exports.createTemplate = createTemplate;
const getTemplateById = async (req, res, next) => {
    try {
        const template = await prisma_1.default.template.findFirst({
            where: { id: req.params.id, deletedAt: null },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
        });
        if (!template)
            throw new errorHandler_1.AppError('Template not found', 404);
        res.json({ success: true, data: template });
    }
    catch (error) {
        next(error);
    }
};
exports.getTemplateById = getTemplateById;
const updateTemplate = async (req, res, next) => {
    try {
        const { name, category, designData, thumbnail, isActive } = req.body;
        const template = await prisma_1.default.template.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(category && { category }),
                ...(designData !== undefined && { designData: typeof designData === 'string' ? designData : JSON.stringify(designData) }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(isActive !== undefined && { isActive }),
            },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
        });
        res.json({ success: true, data: template });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res, next) => {
    try {
        await prisma_1.default.template.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date(), isActive: false },
        });
        res.json({ success: true, message: 'Template deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTemplate = deleteTemplate;
const getCategories = async (req, res, next) => {
    try {
        const templates = await prisma_1.default.template.findMany({
            where: { deletedAt: null, isActive: true },
            select: { category: true },
            distinct: ['category'],
        });
        const categories = templates.map((t) => t.category);
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=templateController.js.map