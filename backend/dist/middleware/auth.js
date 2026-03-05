"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHROrAdmin = exports.requireAdmin = exports.authenticate = void 0;
const tokenService_1 = require("../services/tokenService");
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, tokenService_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError('Invalid or expired token', 401));
    }
};
exports.authenticate = authenticate;
// requireAdmin and requireHROrAdmin must be used after authenticate middleware,
// which is applied at the app.use() level in index.ts for all protected route groups.
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        next(new errorHandler_1.AppError('Admin access required', 403));
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireHROrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'HR_MANAGER')) {
        next(new errorHandler_1.AppError('HR Manager or Admin access required', 403));
        return;
    }
    next();
};
exports.requireHROrAdmin = requireHROrAdmin;
//# sourceMappingURL=auth.js.map