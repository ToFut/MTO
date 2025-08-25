"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorizeCompanyType = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const supabase = (0, supabase_1.getSupabase)();
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
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
const authorizeCompanyType = (types) => {
    return (req, res, next) => {
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
exports.authorizeCompanyType = authorizeCompanyType;
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            next();
            return;
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const supabase = (0, supabase_1.getSupabase)();
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
    }
    catch (error) {
        // Continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map