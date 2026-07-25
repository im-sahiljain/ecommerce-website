import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    identifier: string;
    name?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'little_creators_secret_jwt_key_2026';

export const requireCustomerAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in to complete your order.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; identifier: string; name?: string };
    req.user = decoded;
    next();
  } catch (err) {
    // If token invalid, allow simple fallback format if formatted as json or simple identifier
    try {
      const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (parsed && parsed.identifier) {
        req.user = parsed;
        return next();
      }
    } catch (_) {}

    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
};

export const generateUserToken = (user: { id: string; identifier: string; name?: string }) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};
