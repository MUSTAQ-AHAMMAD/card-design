"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const templates_1 = __importDefault(require("./routes/templates"));
const giftCards_1 = __importDefault(require("./routes/giftCards"));
const email_1 = __importDefault(require("./routes/email"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const brands_1 = __importDefault(require("./routes/brands"));
const employees_1 = __importDefault(require("./routes/employees"));
const ai_1 = __importDefault(require("./routes/ai"));
const auth_2 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const schedulerService_1 = require("./services/schedulerService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use(requestLogger_1.requestLogger);
// Serve uploaded design images
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
// Public routes
app.use('/api/auth', authLimiter, auth_1.default);
// Protected routes
app.use('/api/users', auth_2.authenticate, users_1.default);
app.use('/api/templates', auth_2.authenticate, templates_1.default);
app.use('/api/gift-cards', auth_2.authenticate, giftCards_1.default);
app.use('/api/email', auth_2.authenticate, email_1.default);
app.use('/api/analytics', auth_2.authenticate, analytics_1.default);
app.use('/api/brands', auth_2.authenticate, brands_1.default);
app.use('/api/employees', auth_2.authenticate, employees_1.default);
app.use('/api/ai', auth_2.authenticate, ai_1.default);
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Gift Card API is running', timestamp: new Date().toISOString() });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    (0, schedulerService_1.startScheduler)();
});
exports.default = app;
//# sourceMappingURL=index.js.map