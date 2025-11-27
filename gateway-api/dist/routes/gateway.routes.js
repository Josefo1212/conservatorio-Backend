"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    console.log('Health check called');
    try {
        res.status(200).json({ status: 'OK', message: 'Gateway is running' });
    }
    catch (error) {
        console.error('Error en /health:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=gateway.routes.js.map