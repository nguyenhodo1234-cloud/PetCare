import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyAccess(header.slice(7)) as { id: number; role: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token expired' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
