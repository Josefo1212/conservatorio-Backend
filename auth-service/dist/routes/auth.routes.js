"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.get('/validate', auth_middleware_1.verifyToken, auth_controller_1.validate);
router.post('/refresh', auth_controller_1.refresh);
router.post('/logout', auth_middleware_1.verifyToken, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map