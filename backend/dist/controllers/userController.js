"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.changePassword = exports.updateProfile = exports.getProfile = exports.getUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    avatar: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
const getUsers = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, helpers_1.parsePaginationParams)(req.query);
        const search = String(req.query.search || '');
        const role = req.query.role;
        const where = {
            deletedAt: null,
            ...(role && { role }),
            ...(search && {
                OR: [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { email: { contains: search } },
                ],
            }),
        };
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            prisma_1.default.user.count({ where }),
        ]);
        res.json({ success: true, data: users, meta: (0, helpers_1.generatePaginationMeta)(total, page, limit) });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: userSelect,
        });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, avatar } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(avatar !== undefined && { avatar }),
            },
            select: userSelect,
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid)
            throw new errorHandler_1.AppError('Current password is incorrect', 400);
        const hashed = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({ where: { id: user.id }, data: { password: hashed } });
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const getUserById = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findFirst({
            where: { id: req.params.id, deletedAt: null },
            select: userSelect,
        });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, role, isActive, avatar } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
                ...(avatar !== undefined && { avatar }),
            },
            select: userSelect,
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            throw new errorHandler_1.AppError('Cannot delete your own account', 400);
        }
        await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date(), isActive: false },
        });
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map