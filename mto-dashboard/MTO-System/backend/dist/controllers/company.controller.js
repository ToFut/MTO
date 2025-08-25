"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = exports.CompanyController = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
class CompanyController {
    constructor() {
        // Get all companies
        this.getCompanies = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            try {
                const { type } = req.query;
                let query = database_1.db
                    .from('companies')
                    .select('*')
                    .order('created_at', { ascending: false });
                // Filter by type if provided
                if (type && (type === 'brand' || type === 'factory')) {
                    query = query.eq('type', type);
                }
                const { data: companies, error } = await query;
                if (error) {
                    logger_1.logger.error('Error fetching companies:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to fetch companies'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: companies || []
                });
            }
            catch (error) {
                logger_1.logger.error('Error in getCompanies:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch companies'
                });
            }
        });
        // Get single company
        this.getCompany = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            try {
                const { data: company, error } = await database_1.db
                    .from('companies')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error || !company) {
                    res.status(404).json({
                        success: false,
                        error: 'Company not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: company
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching company:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch company'
                });
            }
        });
        // Create company (admin only)
        this.createCompany = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin only.'
                });
                return;
            }
            const { name, code, type, contact_email, contact_person, phone, address } = req.body;
            try {
                // Check if company with same code exists
                const { data: existing } = await database_1.db
                    .from('companies')
                    .select('id')
                    .eq('code', code)
                    .single();
                if (existing) {
                    res.status(400).json({
                        success: false,
                        error: 'Company with this code already exists'
                    });
                    return;
                }
                // Create company
                const { data: company, error } = await database_1.db
                    .from('companies')
                    .insert({
                    name,
                    code,
                    type,
                    contact_email,
                    contact_person,
                    phone,
                    address,
                    active: true
                })
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Error creating company:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to create company'
                    });
                    return;
                }
                res.status(201).json({
                    success: true,
                    data: company
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating company:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create company'
                });
            }
        });
        // Update company
        this.updateCompany = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const updates = req.body;
            try {
                const { data: company, error } = await database_1.db
                    .from('companies')
                    .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', id)
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Error updating company:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to update company'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: company
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating company:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update company'
                });
            }
        });
        // Toggle company active status
        this.toggleCompanyStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { active } = req.body;
            try {
                const { data: company, error } = await database_1.db
                    .from('companies')
                    .update({
                    active,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', id)
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Error toggling company status:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to update company status'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: company
                });
            }
            catch (error) {
                logger_1.logger.error('Error toggling company status:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update company status'
                });
            }
        });
        // Delete company (admin only)
        this.deleteCompany = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            // Check if user is admin
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin only.'
                });
                return;
            }
            const { id } = req.params;
            try {
                // Check if company has users
                const { data: users } = await database_1.db
                    .from('users')
                    .select('id')
                    .eq('company_id', id)
                    .limit(1);
                if (users && users.length > 0) {
                    res.status(400).json({
                        success: false,
                        error: 'Cannot delete company with active users'
                    });
                    return;
                }
                const { error } = await database_1.db
                    .from('companies')
                    .delete()
                    .eq('id', id);
                if (error) {
                    logger_1.logger.error('Error deleting company:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to delete company'
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Company deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error deleting company:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete company'
                });
            }
        });
    }
}
exports.CompanyController = CompanyController;
exports.companyController = new CompanyController();
//# sourceMappingURL=company.controller.js.map