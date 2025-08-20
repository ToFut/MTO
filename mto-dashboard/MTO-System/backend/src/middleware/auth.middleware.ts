import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId: string;
    companyType?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify JWT token
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }

    // Get user from database
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!user.active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    // Get company information
    const { data: company } = await db
      .from('companies')
      .select('type')
      .eq('id', user.company_id || '')
      .single();

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id || '',
      companyType: company?.type,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

export const authorizeCompanyType = (types: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.user.companyType || !types.includes(req.user.companyType)) {
      res.status(403).json({ 
        error: 'Invalid company type',
        required: types,
        current: req.user.companyType,
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      next();
      return;
    }

    // Verify JWT token
    const decoded = authService.verifyToken(token);
    
    if (decoded) {
      // Get user from database
      const user = await authService.getUserById(decoded.userId);

      if (user && user.active) {
        // Get company information
        const { data: company } = await db
          .from('companies')
          .select('type')
          .eq('id', user.company_id || '')
          .single();

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.company_id || '',
          companyType: company?.type,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};