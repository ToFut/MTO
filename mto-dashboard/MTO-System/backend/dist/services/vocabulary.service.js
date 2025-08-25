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
    /**
     * Smart vocabulary mapping - finds or creates mapping for SKU with intelligent analysis
     */
    async findOrCreateMapping(sku, brandId, factoryId, patchRef) {
        try {
            // First, try to find existing mapping
            let { data: existingMapping } = await this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .eq('brand_sku', sku)
                .eq('brand_id', brandId)
                .single();
            if (existingMapping) {
                return existingMapping;
            }
            // If no exact match, try fuzzy matching
            const { data: fuzzyMatches } = await this.supabase
                .from('vocabulary_mappings')
                .select('*')
                .or(`brand_sku.ilike.%${sku}%,factory_patch_id.ilike.%${sku}%`)
                .eq('brand_id', brandId)
                .limit(5);
            if (fuzzyMatches && fuzzyMatches.length > 0) {
                // Return best match based on similarity score
                const bestMatch = this.findBestSimilarityMatch(sku, patchRef, fuzzyMatches);
                if (bestMatch.score > 0.8) {
                    return bestMatch.mapping;
                }
            }
            // Create new mapping with intelligent analysis
            const newMapping = await this.createSmartMapping(sku, brandId, factoryId, patchRef);
            return newMapping;
        }
        catch (error) {
            logger_1.logger.error(`Error in findOrCreateMapping for SKU ${sku}:`, error);
            return null;
        }
    }
    /**
     * Create vocabulary mappings from MTOs with smart analysis
     */
    async createMappingsFromMTOs(mtos, brandId, factoryId) {
        try {
            logger_1.logger.info('Creating vocabulary mappings from MTOs...');
            const mappingsToCreate = [];
            const skusProcessed = new Set();
            // Extract all unique SKUs from MTOs
            for (const mto of mtos) {
                if (mto.spots_data) {
                    for (const spot of mto.spots_data) {
                        if (spot.sku && !skusProcessed.has(spot.sku)) {
                            skusProcessed.add(spot.sku);
                            // Check if mapping already exists
                            const { data: existing } = await this.supabase
                                .from('vocabulary_mappings')
                                .select('id')
                                .eq('brand_sku', spot.sku)
                                .eq('brand_id', brandId)
                                .single();
                            if (!existing) {
                                const mapping = this.generateSmartMappingData(spot.sku, brandId, factoryId, spot.patch_ref, spot.description);
                                mappingsToCreate.push(mapping);
                            }
                        }
                    }
                }
            }
            // Bulk create mappings
            let createdCount = 0;
            if (mappingsToCreate.length > 0) {
                const { data: created, error } = await this.supabase
                    .from('vocabulary_mappings')
                    .insert(mappingsToCreate)
                    .select();
                if (error) {
                    logger_1.logger.error('Error creating vocabulary mappings:', error);
                }
                else {
                    createdCount = created?.length || 0;
                }
            }
            logger_1.logger.info(`Created ${createdCount} new vocabulary mappings from ${mtos.length} MTOs`);
            return {
                created: createdCount,
                processed: skusProcessed.size,
                mappings: mappingsToCreate
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating mappings from MTOs:', error);
            throw error;
        }
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
    // Smart Vocabulary Helper Methods
    /**
     * Create smart mapping with intelligent analysis of patch reference
     */
    async createSmartMapping(sku, brandId, factoryId, patchRef) {
        try {
            const mappingData = this.generateSmartMappingData(sku, brandId, factoryId, patchRef);
            const { data, error } = await this.supabase
                .from('vocabulary_mappings')
                .insert(mappingData)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Error creating smart mapping:', error);
                return null;
            }
            logger_1.logger.info(`Created smart mapping for SKU ${sku}`);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error in createSmartMapping:', error);
            return null;
        }
    }
    /**
     * Generate smart mapping data with intelligent analysis
     */
    generateSmartMappingData(sku, brandId, factoryId, patchRef, description) {
        // Analyze patch reference for intelligent categorization
        const analysis = this.analyzePatchReference(patchRef);
        return {
            brand_id: brandId,
            factory_id: factoryId,
            brand_sku: sku,
            brand_description: description || patchRef || `Product ${sku}`,
            brand_category: analysis.category,
            factory_patch_id: sku,
            factory_patch_ref: patchRef || `Patch ${sku}`,
            factory_description: analysis.factoryDescription,
            factory_material_code: analysis.materialCode,
            patch_type: analysis.patchType,
            patch_size: analysis.size,
            patch_position: analysis.visualLocation,
            complexity_level: analysis.complexityLevel,
            production_time_minutes: analysis.productionTime,
            thread_colors: analysis.threadColors,
            stitch_count: analysis.estimatedStitchCount,
            is_active: true,
            version: 1,
            tags: analysis.tags
        };
    }
    /**
     * Intelligent patch reference analysis
     */
    analyzePatchReference(patchRef) {
        if (!patchRef) {
            return this.getDefaultAnalysis();
        }
        const ref = patchRef.toLowerCase().trim();
        const analysis = {
            category: 'custom',
            patchType: 'embroidery',
            complexityLevel: 'medium',
            productionTime: 15,
            threadColors: ['black'],
            estimatedStitchCount: 1500,
            tags: [],
            visualLocation: 'center',
            factoryDescription: patchRef,
            materialCode: null,
            size: 'medium'
        };
        // Icon patterns
        if (ref.includes('icon')) {
            analysis.category = 'icon';
            analysis.patchType = 'embroidery';
            analysis.complexityLevel = 'simple';
            analysis.productionTime = 10;
            analysis.estimatedStitchCount = 800;
            analysis.tags.push('icon', 'simple');
            // Specific icon types
            if (ref.includes('camera')) {
                analysis.threadColors = ['black', 'gray'];
                analysis.factoryDescription = 'Camera Icon - Simple line design';
            }
            else if (ref.includes('music')) {
                analysis.threadColors = ['black'];
                analysis.factoryDescription = 'Music Notes Icon - Musical symbol';
            }
            else if (ref.includes('airplane')) {
                analysis.threadColors = ['navy', 'silver'];
                analysis.factoryDescription = 'Airplane Icon - Travel theme';
            }
        }
        // Letter patterns
        else if (ref.includes('letter') || ref.match(/\b[A-Z]\s*-\s*classic/i)) {
            analysis.category = 'letter';
            analysis.patchType = 'embroidery';
            analysis.complexityLevel = 'simple';
            analysis.productionTime = 12;
            analysis.estimatedStitchCount = 600;
            analysis.tags.push('letter', 'monogram');
            analysis.threadColors = ['gold', 'black'];
            analysis.factoryDescription = `Letter embroidery - ${ref}`;
        }
        // Food/drink patterns
        else if (ref.includes('margarita') || ref.includes('drink') || ref.includes('cocktail')) {
            analysis.category = 'food_drink';
            analysis.patchType = 'embroidery';
            analysis.complexityLevel = 'medium';
            analysis.productionTime = 18;
            analysis.estimatedStitchCount = 2000;
            analysis.tags.push('drink', 'lifestyle');
            analysis.threadColors = ['lime', 'yellow', 'white'];
            analysis.factoryDescription = 'Cocktail design - Food & drink theme';
        }
        // Text-based designs
        else if (ref.split(' ').length > 2) {
            analysis.category = 'text';
            analysis.patchType = 'embroidery';
            analysis.complexityLevel = 'complex';
            analysis.productionTime = 25;
            analysis.estimatedStitchCount = 3000;
            analysis.tags.push('text', 'custom');
            analysis.threadColors = ['black', 'white'];
            analysis.factoryDescription = `Custom text design - ${ref}`;
        }
        // Number-based SKUs (product codes)
        else if (/^\d+$/.test(patchRef)) {
            analysis.category = 'product';
            analysis.materialCode = patchRef;
            analysis.factoryDescription = `Product code ${patchRef}`;
            analysis.tags.push('product-code');
        }
        // Size inference
        if (ref.includes('small') || analysis.estimatedStitchCount < 1000) {
            analysis.size = 'small';
        }
        else if (ref.includes('large') || analysis.estimatedStitchCount > 2500) {
            analysis.size = 'large';
        }
        // Location inference based on common patterns
        if (ref.includes('front'))
            analysis.visualLocation = 'front_center';
        else if (ref.includes('back'))
            analysis.visualLocation = 'back_center';
        else if (ref.includes('side'))
            analysis.visualLocation = 'side_left';
        else if (ref.includes('handle'))
            analysis.visualLocation = 'handle';
        return analysis;
    }
    /**
     * Default analysis for unknown patches
     */
    getDefaultAnalysis() {
        return {
            category: 'unknown',
            patchType: 'embroidery',
            complexityLevel: 'medium',
            productionTime: 15,
            threadColors: ['black'],
            estimatedStitchCount: 1500,
            tags: ['unknown'],
            visualLocation: 'center',
            factoryDescription: 'Unknown patch design',
            materialCode: null,
            size: 'medium'
        };
    }
    /**
     * Find best similarity match for fuzzy matching
     */
    findBestSimilarityMatch(sku, patchRef = '', mappings) {
        let bestMatch = { mapping: null, score: 0 };
        for (const mapping of mappings) {
            let score = 0;
            // SKU similarity
            const skuSimilarity = this.calculateSimilarity(sku, mapping.brand_sku || '');
            score += skuSimilarity * 0.6;
            // Patch reference similarity
            if (patchRef && mapping.factory_patch_ref) {
                const refSimilarity = this.calculateSimilarity(patchRef, mapping.factory_patch_ref);
                score += refSimilarity * 0.4;
            }
            if (score > bestMatch.score) {
                bestMatch = { mapping, score };
            }
        }
        return bestMatch;
    }
    /**
     * Calculate string similarity using Levenshtein distance
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j += 1) {
            matrix[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
}
exports.VocabularyService = VocabularyService;
exports.default = VocabularyService;
//# sourceMappingURL=vocabulary.service.js.map