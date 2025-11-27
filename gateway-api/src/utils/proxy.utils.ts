import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import proxy = require('express-http-proxy');

export function createAuthProxy() {
  return proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001', {
    proxyReqPathResolver: (req: Request) => {
      console.log(`Proxying auth request: ${req.method} ${req.originalUrl} to ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}${req.originalUrl}`);
      return req.originalUrl;
    },
    proxyErrorHandler: (err: any, res: Response, _next: NextFunction) => {
      console.error('Proxy error for auth:', err.message);
      res.status(502).json({ error: 'Auth service unavailable' });
    }
  });
}

export function createUserProxy() {
  return proxy(process.env.USER_SERVICE_URL || 'http://localhost:3002', {
    proxyReqPathResolver: (req: Request) => {
      console.log(`Proxying user request: ${req.method} ${req.originalUrl} to ${process.env.USER_SERVICE_URL || 'http://localhost:3002'}${req.originalUrl}`);
      return req.originalUrl;
    },
    proxyErrorHandler: (err: any, res: Response, _next: NextFunction) => {
      console.error('Proxy error for user:', err.message);
      res.status(502).json({ error: 'User service unavailable' });
    }
  });
}

export function setupProxies(app: any) {
  console.log('Setting up proxies for /auth and /user');
  app.use('/auth', createAuthProxy());
  app.use('/user', createUserProxy());
}
