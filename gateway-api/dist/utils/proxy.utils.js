"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthProxy = createAuthProxy;
exports.createUserProxy = createUserProxy;
exports.setupProxies = setupProxies;
// @ts-ignore
const proxy = require("express-http-proxy");
function createAuthProxy() {
    return proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001', {
        proxyReqPathResolver: (req) => {
            console.log(`Proxying auth request: ${req.method} ${req.originalUrl} to ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}${req.originalUrl}`);
            return req.originalUrl;
        },
        proxyErrorHandler: (err, res, _next) => {
            console.error('Proxy error for auth:', err.message);
            res.status(502).json({ error: 'Auth service unavailable' });
        }
    });
}
function createUserProxy() {
    return proxy(process.env.USER_SERVICE_URL || 'http://localhost:3002', {
        proxyReqPathResolver: (req) => {
            console.log(`Proxying user request: ${req.method} ${req.originalUrl} to ${process.env.USER_SERVICE_URL || 'http://localhost:3002'}${req.originalUrl}`);
            return req.originalUrl;
        },
        proxyErrorHandler: (err, res, _next) => {
            console.error('Proxy error for user:', err.message);
            res.status(502).json({ error: 'User service unavailable' });
        }
    });
}
function setupProxies(app) {
    console.log('Setting up proxies for /auth and /user');
    app.use('/auth', createAuthProxy());
    app.use('/user', createUserProxy());
}
//# sourceMappingURL=proxy.utils.js.map