"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const tokenService_1 = require("../services/tokenService");
const emailService_1 = require("../services/emailService");
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new errorHandler_1.AppError('Email already in use', 409);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { firstName, lastName, email, password: hashedPassword },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
        });
        const accessToken = (0, tokenService_1.generateAccessToken)({ id: user.id, email: user.email, role: user.role });
        const refreshToken = (0, tokenService_1.generateRefreshToken)({ id: user.id, email: user.email, role: user.role });
        await (0, tokenService_1.saveRefreshToken)(user.id, refreshToken);
        res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || user.deletedAt || !user.isActive) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const accessToken = (0, tokenService_1.generateAccessToken)({ id: user.id, email: user.email, role: user.role });
        const refreshToken = (0, tokenService_1.generateRefreshToken)({ id: user.id, email: user.email, role: user.role });
        await (0, tokenService_1.saveRefreshToken)(user.id, refreshToken);
        const userWithoutPassword = (({ password: _pw, ...rest }) => rest)(user);
        res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new errorHandler_1.AppError('Refresh token required', 400);
        }
        const tokenRecord = await (0, tokenService_1.findRefreshToken)(refreshToken);
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
        }
        const decoded = (0, tokenService_1.verifyRefreshToken)(refreshToken);
        const accessToken = (0, tokenService_1.generateAccessToken)({ id: decoded.id, email: decoded.email, role: decoded.role });
        res.json({ success: true, data: { accessToken } });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await (0, tokenService_1.deleteRefreshToken)(refreshToken);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || user.deletedAt) {
            res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
            return;
        }
        const resetToken = (0, helpers_1.generateResetToken)();
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });
        try {
            await (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        }
        catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }
        res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const user = await prisma_1.default.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
                deletedAt: null,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Invalid or expired reset token', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
        });
        res.json({ success: true, message: 'Password reset successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map