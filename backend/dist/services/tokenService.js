"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserRefreshTokens = exports.deleteRefreshToken = exports.findRefreshToken = exports.saveRefreshToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const parseExpiryToMs = (expiry) => {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match)
        return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] ?? 86400000);
};
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
const saveRefreshToken = async (userId, token) => {
    const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_TOKEN_EXPIRY));
    await prisma_1.default.refreshToken.create({
        data: { token, userId, expiresAt },
    });
};
exports.saveRefreshToken = saveRefreshToken;
const findRefreshToken = async (token) => {
    return prisma_1.default.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
};
exports.findRefreshToken = findRefreshToken;
const deleteRefreshToken = async (token) => {
    await prisma_1.default.refreshToken.deleteMany({ where: { token } });
};
exports.deleteRefreshToken = deleteRefreshToken;
const deleteUserRefreshTokens = async (userId) => {
    await prisma_1.default.refreshToken.deleteMany({ where: { userId } });
};
exports.deleteUserRefreshTokens = deleteUserRefreshTokens;
//# sourceMappingURL=tokenService.js.map