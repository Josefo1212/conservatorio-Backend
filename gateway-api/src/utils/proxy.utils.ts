import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
  console.log('Setting up proxies for /auth, /user and /auditoria');
  app.use('/auth', createAuthProxy());
  app.use('/user', createUserProxy());
  app.use('/auditoria', createAuditoriaProxy());
}

export function createAuditoriaProxy() {
  const target = process.env.AUDITORIA_SERVICE_URL || 'http://localhost:3004';
  const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
  return proxy(target, {
    proxyReqPathResolver: (req: Request) => {
      return req.originalUrl;
    },
    filter: (req: Request, res: Response) => {
      try {
        const bearer = req.headers.authorization?.startsWith('Bearer ')
          ? req.headers.authorization.substring(7)
          : undefined;
        const token = bearer || (req as any).cookies?.accessToken;
        if (!token) {
          res.status(401).json({ message: 'Token requerido' });
          return false;
        }
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (!payload || payload.rol !== 'master') {
          res.status(403).json({ message: 'Acceso denegado: requiere rol master' });
          return false;
        }
        return true;
      } catch (e) {
        res.status(401).json({ message: 'Token inválido' });
        return false;
      }
    },
    proxyErrorHandler: (err: any, res: Response, _next: NextFunction) => {
      console.error('Proxy error for auditoria:', err.message);
      res.status(502).json({ error: 'Auditoria service unavailable' });
    }
  });
}
