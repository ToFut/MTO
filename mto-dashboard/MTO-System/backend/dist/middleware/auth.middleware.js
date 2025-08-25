"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorizeCompanyType = exports.authorize = exports.authenticate = void 0;
const database_1 = require("../config/database");
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../config/logger");
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Verify JWT token
        const decoded = auth_service_1.authService.verifyToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid authentication token' });
            return;
        }
        // Handle demo users (they don't exist in database)
        if (decoded.userId === 'demo-brand-user-id' || decoded.userId === 'f47ac10b-58cc-4372-a567-0e02b2c3d479' || decoded.userId === 'admin-demo-user-id-12345') {
            // Demo users
            let demoUser;
            if (decoded.userId === 'demo-brand-user-id') {
                demoUser = {
                    id: 'demo-brand-user-id',
                    email: 'brand@brand.com',
                    role: 'brand_manager',
                    companyId: 'a0560528-ac53-4dd7-ac9c-92d3e90addf0',
                    companyType: 'brand'
                };
            }
            else if (decoded.userId === 'f47ac10b-58cc-4372-a567-0e02b2c3d479') {
                demoUser = {
                    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                    email: 'factory@factory.com',
                    role: 'factory_operator',
                    companyId: 'b1234567-89ab-cdef-0123-456789abcdef',
                    companyType: 'factory'
                };
            }
            else {
                demoUser = {
                    id: 'admin-demo-user-id-12345',
                    email: 'admin@admin.com',
                    role: 'admin',
                    companyId: '',
                    companyType: 'admin'
                };
            }
            req.user = demoUser;
        }
        else {
            // Get user from database for real users
            const user = await auth_service_1.authService.getUserById(decoded.userId);
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            if (!user.active) {
                res.status(403).json({ error: 'Account is deactivated' });
                return;
            }
            // Get company information
            const { data: company } = await database_1.db
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
        }
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
        const decoded = auth_service_1.authService.verifyToken(token);
        if (decoded) {
            // Handle demo users
            if (decoded.userId === 'demo-brand-user-id' || decoded.userId === 'f47ac10b-58cc-4372-a567-0e02b2c3d479' || decoded.userId === 'admin-demo-user-id-12345') {
                let demoUser;
                if (decoded.userId === 'demo-brand-user-id') {
                    demoUser = {
                        id: 'demo-brand-user-id',
                        email: 'brand@brand.com',
                        role: 'brand_manager',
                        companyId: 'a0560528-ac53-4dd7-ac9c-92d3e90addf0',
                        companyType: 'brand'
                    };
                }
                else if (decoded.userId === 'f47ac10b-58cc-4372-a567-0e02b2c3d479') {
                    demoUser = {
                        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                        email: 'factory@factory.com',
                        role: 'factory_operator',
                        companyId: 'b1234567-89ab-cdef-0123-456789abcdef',
                        companyType: 'factory'
                    };
                }
                else {
                    demoUser = {
                        id: 'admin-demo-user-id-12345',
                        email: 'admin@admin.com',
                        role: 'admin',
                        companyId: '',
                        companyType: 'admin'
                    };
                }
                req.user = demoUser;
            }
            else {
                // Get user from database
                const user = await auth_service_1.authService.getUserById(decoded.userId);
                if (user && user.active) {
                    // Get company information
                    const { data: company } = await database_1.db
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