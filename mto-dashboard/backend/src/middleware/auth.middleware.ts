import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase';
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      companyType: user.company?.type,
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', decoded.id)
      .single();

    if (!error && user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        companyType: user.company?.type,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};