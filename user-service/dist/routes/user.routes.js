"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const user_middleware_1 = require("../middleware/user.middleware");
const router = (0, express_1.Router)();
router.post('/register', user_middleware_1.authenticateToken, user_controller_1.register);
exports.default = router;
//# sourceMappingURL=user.routes.js.map