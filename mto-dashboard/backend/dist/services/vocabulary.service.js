"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VocabularyService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const XLSX = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
class VocabularyService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async getMappings(filters) {
        try {
            let query = this.supabase
                .from('vocabulary_mappings')
                .select(`
          *,
          brand:companies!vocabulary_mappings_brand_id_fkey(*),
          factory:companies!vocabulary_mappings_factory_id_fkey(*)
        `, { count: 'exact' });
            // Apply filters
            if (filters.brandId) {
                query = query.eq('brand_id', filters.brandId);
            }
            if (filters.factoryId) {
                query = query.eq('factory_id', filters.factoryId);
            }
            if (filters.category) {
                query = query.eq('brand_category', filters.category);
            }
            if (filters.isActive !== undefined) {
                query = query.eq('is_active', filters.isActive);
            }
            if (filters.search) {
                query = query.or(`
          brand_sku.ilike.%${filters.search}%,
          factory_patch_id.ilike.%${filters.search}%,
          brand_description.ilike.%${filters.search}%
        `);
            }
            // Pagination
            query = query
                .order('created_at', { ascending: false })
                .range(filters.offset, filters.offset + filters.limit - 1);
            const { data, error, count } = await query;
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return {
                data: data || [],
                total: count || 0,
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching vocabulary mappings:', error);
            throw error;
        }
    }
    async getMappingById(id) {
        try {
            const { data, error } = await this.supabase
                .from('vocabulary_mappings')
                .select(`
          *,
          brand:companies!vocabulary_mappings_brand_id_fkey(*),
          factory:companies!vocabulary_mappings_factory_id_fkey(*)
        `)
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error fetching vocabulary mapping ${id}:`, error);
            throw error;
        }
    }
    async createMapping(mappingData) {
        try {
            const { data, error } = await this.supabase
                .from('vocabulary_mappings')
                .insert(mappingData)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error creating vocabulary mapping:', error);
            throw error;
        }
    }
    async updateMapping(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('vocabulary_mappings')
                .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error updating vocabulary mapping ${id}:`, error);
            throw error;
        }
    }
    async deleteMapping(id) {
        try {
            const { error } = await this.supabase
                .from('vocabulary_mappings')
                .delete()
                .eq('id', id);
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Error deleting vocabulary mapping ${id}:`, error);
            throw error;
        }
    }
    async bulkUploadMappings(file, companyId, userId) {
        try {
            // Read CSV/Excel file
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            // Parse and validate mappings
            const mappings = data.map((row) => ({
                brand_id: companyId,
                factory_id: row.factory_id || null,
                brand_sku: row.brand_sku || row['Brand SKU'],
                brand_pid: row.brand_pid || row['Brand PID'],
                brand_description: row.brand_description || row['Brand Description'],
                brand_category: row.brand_category || row['Category'],
                factory_patch_id: row.factory_patch_id || row['Factory Patch ID'],
                factory_patch_ref: row.factory_patch_ref || row['Factory Reference'],
                factory_description: row.factory_description || row['Factory Description'],
                patch_type: row.patch_type || row['Patch Type'],
                patch_size: row.patch_size || row['Size'],
                is_active: true,
                created_by: userId,
            }));
            // Insert mappings
            const { data: insertedMappings, error } = await this.supabase
                .from('vocabulary_mappings')
                .insert(mappings)
                .select();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Clean up uploaded file
            fs_1.default.unlinkSync(file.path);
            return {
                created: insertedMappings?.length || 0,
                mappings: insertedMappings,
            };
        }
        catch (error) {
            logger_1.logger.error('Error in bulk vocabulary upload:', error);
            throw error;
        }
    }
    async getPatchLibrary(filters) {
        try {
            let query = this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .eq('is_active', true);
            if (filters.category) {
                query = query.eq('patch_type', filters.category);
            }
            if (filters.search) {
                query = query.or(`
          factory_patch_ref.ilike.%${filters.search}%,
          factory_description.ilike.%${filters.search}%
        `);
            }
            if (filters.brandId) {
                query = query.eq('brand_id', filters.brandId);
            }
            if (filters.factoryId) {
                query = query.eq('factory_id', filters.factoryId);
            }
            const { data, error } = await query;
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Group by category
            const library = (data || []).reduce((acc, item) => {
                const category = item.patch_type || 'Other';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(item);
                return acc;
            }, {});
            return library;
        }
        catch (error) {
            logger_1.logger.error('Error fetching patch library:', error);
            throw error;
        }
    }
    async getIconWall() {
        try {
            const { data, error } = await this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .eq('is_active', true)
                .not('patch_image_url', 'is', null);
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Group by category for visual display
            const iconWall = (data || []).reduce((acc, item) => {
                const category = item.brand_category || 'Other';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push({
                    id: item.id,
                    sku: item.brand_sku,
                    name: item.factory_patch_ref,
                    image: item.patch_image_url,
                    thumbnail: item.patch_thumbnail_url,
                    category: item.patch_type,
                });
                return acc;
            }, {});
            return iconWall;
        }
        catch (error) {
            logger_1.logger.error('Error fetching icon wall:', error);
            throw error;
        }
    }
    async translateVocabulary(fromSKU, toLanguage) {
        try {
            // Get the vocabulary mapping
            const { data: mapping, error } = await this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .eq('brand_sku', fromSKU)
                .single();
            if (error || !mapping) {
                throw new error_middleware_1.AppError('SKU not found', 404);
            }
            // Get translation from translations table
            const { data: translation } = await this.supabase
                .from('vocabulary_translations')
                .select('*')
                .eq('mapping_id', mapping.id)
                .eq('language', toLanguage)
                .single();
            if (translation) {
                return translation;
            }
            // If no translation exists, return original with note
            return {
                original: mapping,
                language: toLanguage,
                translation: null,
                note: 'Translation not available',
            };
        }
        catch (error) {
            logger_1.logger.error('Error translating vocabulary:', error);
            throw error;
        }
    }
    async searchBySKU(sku) {
        try {
            const { data, error } = await this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .or(`
          brand_sku.ilike.%${sku}%,
          factory_patch_id.ilike.%${sku}%
        `)
                .limit(10);
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return data || [];
        }
        catch (error) {
            logger_1.logger.error('Error searching vocabulary by SKU:', error);
            throw error;
        }
    }
    async getVocabularyStatistics(companyId, companyType) {
        try {
            const field = companyType === 'brand' ? 'brand_id' : 'factory_id';
            const { data: mappings } = await this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .eq(field, companyId);
            const stats = {
                total: mappings?.length || 0,
                active: mappings?.filter(m => m.is_active).length || 0,
                inactive: mappings?.filter(m => !m.is_active).length || 0,
                byCategory: {},
                byType: {},
                withImages: mappings?.filter(m => m.patch_image_url).length || 0,
                withoutImages: mappings?.filter(m => !m.patch_image_url).length || 0,
            };
            // Group by category and type
            mappings?.forEach((mapping) => {
                const category = mapping.brand_category || 'Other';
                const type = mapping.patch_type || 'Other';
                stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            });
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error getting vocabulary statistics:', error);
            throw error;
        }
    }
    async exportVocabularyToExcel(filters) {
        try {
            // Get vocabulary mappings
            const { data: mappings } = await this.getMappings({
                brandId: filters.brandId,
                factoryId: filters.factoryId,
                isActive: true,
                limit: 10000,
                offset: 0,
            });
            // Create workbook
            const workbook = XLSX.utils.book_new();
            // Convert mappings to worksheet data
            const worksheetData = mappings.map((mapping) => ({
                'Brand SKU': mapping.brand_sku,
                'Brand PID': mapping.brand_pid,
                'Brand Description': mapping.brand_description,
                'Category': mapping.brand_category,
                'Factory Patch ID': mapping.factory_patch_id,
                'Factory Reference': mapping.factory_patch_ref,
                'Factory Description': mapping.factory_description,
                'Patch Type': mapping.patch_type,
                'Patch Size': mapping.patch_size,
                'Active': mapping.is_active ? 'Yes' : 'No',
            }));
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Vocabulary');
            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return buffer;
        }
        catch (error) {
            logger_1.logger.error('Error exporting vocabulary to Excel:', error);
            throw error;
        }
    }
}
exports.VocabularyService = VocabularyService;
exports.default = VocabularyService;
//# sourceMappingURL=vocabulary.service.js.map