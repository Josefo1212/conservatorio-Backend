"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const user_middleware_1 = require("../middleware/user.middleware");
const router = (0, express_1.Router)();
router.get('/get/:id', user_middleware_1.authenticateToken, user_controller_1.getUser);
router.put('/update/:id', user_middleware_1.authenticateToken, user_controller_1.updateUser);
router.post('/assign-role', user_middleware_1.authenticateToken, user_controller_1.assignRole);
router.post('/designate-role', user_middleware_1.authenticateToken, user_controller_1.designateRole);
exports.default = router;
//# sourceMappingURL=user.routes.js.map