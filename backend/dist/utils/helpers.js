"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = exports.parsePaginationParams = exports.generatePaginationMeta = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generatePaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
exports.generatePaginationMeta = generatePaginationMeta;
const parsePaginationParams = (query) => {
    const page = Math.max(1, parseInt(String(query.page || '1')));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '10'))));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.parsePaginationParams = parsePaginationParams;
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateResetToken = generateResetToken;
//# sourceMappingURL=helpers.js.map