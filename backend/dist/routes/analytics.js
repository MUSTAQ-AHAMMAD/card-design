"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_1.requireHROrAdmin, analyticsController_1.getDashboard);
router.get('/reports', auth_1.requireHROrAdmin, analyticsController_1.getReports);
exports.default = router;
//# sourceMappingURL=analytics.js.map