import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh';

export function signAccess(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefresh(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
