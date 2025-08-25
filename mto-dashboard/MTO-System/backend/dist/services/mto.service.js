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
exports.MTOService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const excel_service_1 = require("./excel.service");
const po_parser_service_1 = require("./po-parser.service");
const vocabulary_service_1 = require("./vocabulary.service");
const inventory_service_1 = require("./inventory.service");
const barcode_service_1 = require("./barcode.service");
const XLSX = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
class MTOService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
        this.excelService = new excel_service_1.ExcelService();
        this.poParserService = new po_parser_service_1.POParserService();
        this.vocabularyService = new vocabulary_service_1.VocabularyService();
        this.inventoryService = new inventory_service_1.InventoryService();
        this.barcodeService = new barcode_service_1.BarcodeService();
    }
    async getMTOs(filters) {
        try {
            let query = this.supabase
                .from('mtos')
                .select(`
          *,
          purchase_orders(*),
          defects(count)
        `, { count: 'exact' });
            // Apply filters
            if (filters.poId) {
                query = query.eq('po_id', filters.poId);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.productionCategory) {
                query = query.eq('production_category', filters.productionCategory);
            }
            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }
            if (filters.brandId) {
                query = query.eq('brand_id', filters.brandId);
            }
            if (filters.factoryId) {
                query = query.eq('factory_id', filters.factoryId);
            }
            if (filters.search) {
                query = query.or(`
          internal_id.ilike.%${filters.search}%,
          reference_number.ilike.%${filters.search}%,
          display_name.ilike.%${filters.search}%,
          sales_order_number.ilike.%${filters.search}%
        `);
            }
            if (filters.startDate) {
                query = query.gte('created_at', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('created_at', filters.endDate);
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
            logger_1.logger.error('Error fetching MTOs:', error);
            throw error;
        }
    }
    async getMTOById(id) {
        try {
            const { data, error } = await this.supabase
                .from('mtos')
                .select(`
          *,
          po:purchase_orders(*),
          brand:companies!mtos_brand_id_fkey(*),
          factory:companies!mtos_factory_id_fkey(*),
          defects(*),
          barcodes(*),
          inventory_allocations(*)
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
            logger_1.logger.error(`Error fetching MTO ${id}:`, error);
            throw error;
        }
    }
    async createMTO(mtoData) {
        try {
            // Generate internal ID if not provided
            if (!mtoData.internal_id) {
                mtoData.internal_id = await this.generateInternalId();
            }
            // Set default values
            mtoData.status = mtoData.status || 'pending';
            mtoData.production_stage = mtoData.production_stage || 'receive';
            mtoData.is_replacement = mtoData.is_replacement || false;
            const { data, error } = await this.supabase
                .from('mtos')
                .insert(mtoData)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Create barcodes for the MTO
            await this.createMTOBarcodes(data.id, data);
            // Auto-populate inventory if needed
            await this.autoPopulateInventory(data);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Error creating MTO:', error);
            throw error;
        }
    }
    async updateMTO(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('mtos')
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
            logger_1.logger.error(`Error updating MTO ${id}:`, error);
            throw error;
        }
    }
    async updateMTOStatus(id, status, userId) {
        try {
            // Get current MTO
            const { data: currentMTO } = await this.supabase
                .from('mtos')
                .select('status')
                .eq('id', id)
                .single();
            // Update status
            const { data, error } = await this.supabase
                .from('mtos')
                .update({
                status,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Log status change
            await this.supabase
                .from('mto_status_history')
                .insert({
                mto_id: id,
                old_status: currentMTO?.status,
                new_status: status,
                changed_by: userId,
            });
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error updating MTO status ${id}:`, error);
            throw error;
        }
    }
    async updateProductionStage(id, stage, userId) {
        try {
            // Get current MTO
            const { data: currentMTO } = await this.supabase
                .from('mtos')
                .select('production_stage')
                .eq('id', id)
                .single();
            // Update production stage
            const { data, error } = await this.supabase
                .from('mtos')
                .update({
                production_stage: stage,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            // Log production stage change
            await this.supabase
                .from('production_history')
                .insert({
                mto_id: id,
                old_stage: currentMTO?.production_stage,
                new_stage: stage,
                changed_by: userId,
            });
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Error updating production stage ${id}:`, error);
            throw error;
        }
    }
    async deleteMTO(id) {
        try {
            const { error } = await this.supabase
                .from('mtos')
                .delete()
                .eq('id', id);
            if (error) {
                throw new error_middleware_1.AppError(error.message, 400);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Error deleting MTO ${id}:`, error);
            throw error;
        }
    }
    /**
     * Preview MTO Upload - Parse and analyze without saving to database
     * Returns parsed MTOs and analysis for user review
     */
    async previewMTOUpload(fileBuffer, poNumber, brandId, factoryId) {
        try {
            logger_1.logger.info(`Starting MTO preview for PO: ${poNumber}`);
            // Step 1: Detect file format (PO or MTO)
            const fileType = await this.detectFileType(fileBuffer);
            logger_1.logger.info(`Detected file type: ${fileType}`);
            let parsedMTOs = [];
            let poData = null;
            let excelAnalysis = { detectedSpots: 0, qualityScore: 0, totalRows: 0 };
            if (fileType === 'PO') {
                // Handle Bauble Bar PO format
                logger_1.logger.info('Processing as Bauble Bar PO format...');
                // Parse PO using specialized parser
                poData = await this.poParserService.parseBaublePO(fileBuffer);
                // Convert PO line items to MTOs
                parsedMTOs = this.poParserService.convertPOToMTOs(poData, brandId, factoryId);
                // Create analysis summary
                excelAnalysis = {
                    detectedSpots: parsedMTOs.reduce((sum, mto) => sum + (mto.spots?.length || 0), 0),
                    qualityScore: 90,
                    totalRows: poData.lineItems.length,
                    format: 'BaublePO',
                    poInfo: {
                        poNumber: poData.poNumber,
                        customer: poData.customer,
                        totalAmount: poData.totalAmount,
                        totalQty: poData.totalQty,
                        requestedShipDate: poData.requestedShipDate,
                        vendor: poData.vendorInfo,
                        shipTo: poData.shipToInfo
                    }
                };
            }
            else {
                // Handle traditional MTO Excel format
                logger_1.logger.info('Processing as MTO Excel format...');
                // Validate Excel file
                const validation = await this.excelService.validateExcelFile(fileBuffer);
                if (!validation.isValid) {
                    throw new error_middleware_1.AppError(`Invalid Excel file: ${validation.errors.join(', ')}`, 400);
                }
                // Smart Excel Analysis
                excelAnalysis = await this.excelService.analyzeExcelStructure(fileBuffer);
                // Extract MTOs with intelligent parsing
                parsedMTOs = await this.excelService.extractMTOsFromExcel(excelAnalysis, fileBuffer);
                excelAnalysis.format = 'MTO';
            }
            // Enrich MTOs with additional data (without saving)
            const enrichedMTOs = await this.smartEnrichMTOs(parsedMTOs, brandId, factoryId);
            // Analyze what would be created
            const inventoryItems = new Set();
            const vocabularyMappings = new Set();
            let totalSpots = 0;
            enrichedMTOs.forEach(mto => {
                // Count unique inventory items
                if (mto.bag_base_pid)
                    inventoryItems.add(mto.bag_base_pid);
                // Count spots and vocabulary needs
                if (mto.spots && Array.isArray(mto.spots)) {
                    mto.spots.forEach((spot) => {
                        totalSpots++;
                        if (spot.sku) {
                            inventoryItems.add(spot.sku);
                            vocabularyMappings.add(spot.sku);
                        }
                    });
                }
            });
            // Group MTOs by category and priority for summary
            const summary = {
                byCategory: this.groupBy(enrichedMTOs, 'production_category'),
                byPriority: this.groupBy(enrichedMTOs, 'priority'),
                dailyCount: enrichedMTOs.filter(m => m.production_category === 'daily').length,
                monthlyCount: enrichedMTOs.filter(m => m.production_category === 'monthly').length,
                urgentCount: enrichedMTOs.filter(m => m.priority === 'urgent').length,
            };
            logger_1.logger.info(`Preview complete: ${enrichedMTOs.length} MTOs ready for upload`);
            return {
                mtoCount: enrichedMTOs.length,
                mtos: enrichedMTOs.map(mto => ({
                    internal_id: mto.internal_id,
                    po_line_id: mto.po_line_id,
                    display_name: mto.display_name,
                    reference_number: mto.reference_number,
                    quantity: mto.quantity,
                    production_category: mto.production_category,
                    priority: mto.priority,
                    expected_ship_date: mto.expected_ship_date,
                    spots: mto.spots,
                    spot_count: mto.spots?.length || 0,
                    po_customer: mto.po_customer,
                    hts_code: mto.hts_code,
                    fob_cost: mto.fob_cost,
                    ext_fob: mto.ext_fob
                })),
                analysis: {
                    fileFormat: excelAnalysis.format,
                    qualityScore: excelAnalysis.qualityScore,
                    totalRows: excelAnalysis.totalRows,
                    detectedSpots: totalSpots,
                    poInfo: excelAnalysis.poInfo || null
                },
                summary,
                impact: {
                    inventoryItemsToCreate: inventoryItems.size,
                    vocabularyMappingsNeeded: vocabularyMappings.size,
                    totalSpotsToProcess: totalSpots
                },
                warnings: this.generateUploadWarnings(enrichedMTOs, excelAnalysis)
            };
        }
        catch (error) {
            logger_1.logger.error('MTO preview failed:', error);
            throw error;
        }
    }
    /**
     * Generate warnings for upload preview
     */
    generateUploadWarnings(mtos, analysis) {
        const warnings = [];
        // Check for missing data
        const missingShipDates = mtos.filter(m => !m.expected_ship_date).length;
        if (missingShipDates > 0) {
            warnings.push(`${missingShipDates} MTOs have no ship date specified`);
        }
        // Check for urgent items
        const urgentItems = mtos.filter(m => m.priority === 'urgent').length;
        if (urgentItems > 0) {
            warnings.push(`${urgentItems} MTOs marked as URGENT - immediate attention required`);
        }
        // Check for rush orders
        const rushOrders = mtos.filter(m => m.is_rush).length;
        if (rushOrders > 0) {
            warnings.push(`${rushOrders} MTOs are rush orders (ship within 3 days)`);
        }
        // Check for MTOs without spots
        const noSpots = mtos.filter(m => !m.spots || m.spots.length === 0).length;
        if (noSpots > 0) {
            warnings.push(`${noSpots} MTOs have no customization spots defined`);
        }
        // Data quality warnings
        if (analysis.qualityScore < 70) {
            warnings.push('Low data quality score - please review the parsed data carefully');
        }
        return warnings;
    }
    /**
     * Direct MTO Upload - no PO required (auto-creates PO and workspace)
     * Used by legacy frontend upload route
     */
    async directMTOUpload(fileBuffer, brandId, factoryId, uploadedBy) {
        try {
            logger_1.logger.info('Starting direct MTO upload process');
            // Step 1: Parse Excel data using fixed method
            const { validMTOs, errors, excelAnalysis } = await this.parseExcelData(fileBuffer);
            if (validMTOs.length === 0) {
                throw new Error('No valid MTOs found in the Excel file');
            }
            logger_1.logger.info(`Parsed ${validMTOs.length} valid MTOs from Excel`);
            // Step 2: Auto-create a PO from the first MTO
            const autoPONumber = `AUTO-PO-${Date.now()}-${process.hrtime.bigint()}-${Math.random().toString(36).substring(2, 8)}`;
            const { data: purchaseOrder, error: poError } = await this.supabase
                .from('purchase_orders')
                .insert({
                po_number: autoPONumber,
                brand_id: brandId,
                factory_id: factoryId,
                status: 'assigned',
                total_mtos: validMTOs.length,
                source_format: 'MTO',
                notes: 'Auto-created from direct MTO upload'
            })
                .select()
                .single();
            if (poError) {
                logger_1.logger.error('PO creation failed:', poError);
                throw new Error(`Failed to create purchase order: ${poError.message}`);
            }
            logger_1.logger.info(`Created PO: ${purchaseOrder.po_number}`);
            // Step 3: Create workspace for factory/brand collaboration
            const { data: workspace, error: wsError } = await this.supabase
                .from('workspaces')
                .insert({
                name: `MTO Upload - ${new Date().toLocaleDateString()}`,
                brand_id: brandId,
                factory_id: factoryId,
                po_id: purchaseOrder.id,
                production_category: 'monthly', // Default
                total_mtos: validMTOs.length,
                status: 'active',
                created_by: uploadedBy
            })
                .select()
                .single();
            if (wsError) {
                logger_1.logger.error('Workspace creation failed:', wsError);
                throw new Error(`Failed to create workspace: ${wsError.message}`);
            }
            logger_1.logger.info(`Created workspace: ${workspace.name}`);
            // Step 4: Add PO and workspace IDs to MTOs and save
            const finalMTOData = validMTOs.map(mto => ({
                ...mto,
                po_id: purchaseOrder.id,
                workspace_id: workspace.id,
                brand_id: brandId,
                factory_id: factoryId,
                created_by: uploadedBy
            }));
            // Validate uniqueness within batch and fix duplicates
            const internalIds = finalMTOData.map(mto => mto.internal_id);
            const uniqueIds = new Set(internalIds);
            if (internalIds.length !== uniqueIds.size) {
                logger_1.logger.error('Duplicate internal_id values found within batch:', internalIds);
                // Find and fix duplicates
                const idCounts = new Map();
                for (let i = 0; i < finalMTOData.length; i++) {
                    const id = finalMTOData[i].internal_id;
                    const count = idCounts.get(id) || 0;
                    idCounts.set(id, count + 1);
                    // If duplicate, generate a new unique ID
                    if (count > 0) {
                        const newId = this.generateUniqueInternalId(i);
                        logger_1.logger.info(`Replacing duplicate internal_id "${id}" with "${newId}"`);
                        finalMTOData[i].internal_id = newId;
                    }
                }
            }
            // Check for existing internal_ids in database
            const { data: existing, error: checkError } = await this.supabase
                .from('mtos')
                .select('internal_id')
                .in('internal_id', internalIds);
            if (checkError) {
                logger_1.logger.error('Error checking existing internal_ids:', checkError);
            }
            else if (existing && existing.length > 0) {
                logger_1.logger.error('Found existing internal_ids in database:', existing.map(m => m.internal_id));
                throw new Error(`Found existing internal_ids in database: ${existing.map(m => m.internal_id).join(', ')}`);
            }
            const { data: savedMTOs, error: mtoError } = await this.supabase
                .from('mtos')
                .insert(finalMTOData)
                .select();
            if (mtoError) {
                logger_1.logger.error('MTO save failed:', mtoError);
                throw new Error(`Failed to save MTOs: ${mtoError.message}`);
            }
            logger_1.logger.info(`Saved ${savedMTOs.length} MTOs to database`);
            // Step 5: Auto-populate supporting data
            const autoPopulation = await this.performAutoPopulation(savedMTOs, factoryId);
            return {
                success: true,
                created: savedMTOs.length,
                mtos: savedMTOs,
                po: purchaseOrder,
                workspace: workspace,
                excelAnalysis,
                autoPopulation,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            logger_1.logger.error('Direct MTO upload failed:', error);
            throw error;
        }
    }
    /**
     * Smart MTO Upload and Analysis Engine
     * The heart of the system - intelligently processes Excel and populates everything
     */
    async smartUploadMTOs(fileBuffer, poNumber, brandId, factoryId, userId) {
        try {
            logger_1.logger.info(`Starting smart MTO upload for PO: ${poNumber}`);
            // Step 1: Detect file format (PO or MTO)
            const fileType = await this.detectFileType(fileBuffer);
            logger_1.logger.info(`Detected file type: ${fileType}`);
            let parsedMTOs = [];
            let excelAnalysis = { detectedSpots: 0, qualityScore: 0, totalRows: 0 };
            if (fileType === 'PO') {
                // Handle Bauble Bar PO format
                logger_1.logger.info('Processing as Bauble Bar PO format...');
                // Parse PO using specialized parser
                const poData = await this.poParserService.parseBaublePO(fileBuffer);
                // Convert PO line items to MTOs
                parsedMTOs = this.poParserService.convertPOToMTOs(poData, brandId, factoryId);
                // Create analysis summary
                excelAnalysis = {
                    detectedSpots: parsedMTOs.reduce((sum, mto) => sum + (mto.spots?.length || 0), 0),
                    qualityScore: 90, // High confidence for structured PO
                    totalRows: poData.lineItems.length,
                    format: 'BaublePO'
                };
                logger_1.logger.info(`Parsed ${parsedMTOs.length} MTOs from PO with ${poData.lineItems.length} line items`);
            }
            else {
                // Handle traditional MTO Excel format
                logger_1.logger.info('Processing as MTO Excel format...');
                // Step 1: Validate Excel file
                const validation = await this.excelService.validateExcelFile(fileBuffer);
                if (!validation.isValid) {
                    throw new error_middleware_1.AppError(`Invalid Excel file: ${validation.errors.join(', ')}`, 400);
                }
                // Step 2: Smart Excel Analysis
                excelAnalysis = await this.excelService.analyzeExcelStructure(fileBuffer);
                logger_1.logger.info(`Excel analysis: ${excelAnalysis.detectedSpots} spots detected, quality: ${excelAnalysis.qualityScore}%`);
                // Step 3: Extract MTOs with intelligent parsing
                parsedMTOs = await this.excelService.extractMTOsFromExcel(excelAnalysis, fileBuffer);
            }
            // Step 2: Create or get PO record
            const po = await this.createOrGetPO(poNumber, brandId, factoryId);
            // Step 5: Smart enrichment and categorization
            const enrichedMTOs = await this.smartEnrichMTOs(parsedMTOs, brandId, factoryId);
            // Step 6: Store MTOs in database with spots as JSONB
            const savedMTOs = await this.bulkCreateMTOsWithSpots(enrichedMTOs, po.id, userId);
            // Step 7: Auto-populate all related systems
            const autoPopulationResults = await this.autoPopulateAllSystems(savedMTOs, brandId, factoryId, userId);
            // Step 8: Generate comprehensive report
            const analysisReport = this.generateSmartAnalysisReport(savedMTOs, autoPopulationResults, excelAnalysis);
            logger_1.logger.info(`Smart MTO upload completed: ${savedMTOs.length} MTOs processed`);
            return {
                success: true,
                created: savedMTOs.length,
                mtos: savedMTOs,
                analysisReport,
                autoPopulation: autoPopulationResults,
                excelAnalysis: {
                    detectedSpots: excelAnalysis.detectedSpots,
                    qualityScore: excelAnalysis.qualityScore,
                    totalRows: excelAnalysis.totalRows,
                    format: excelAnalysis.format || 'MTO'
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Smart MTO upload failed:', error);
            throw error;
        }
    }
    async bulkUploadMTOs(file, poId, brandId, userId) {
        try {
            // Read Excel file
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            // Parse MTOs from Excel data
            const mtos = this.parseExcelDataLegacy(data, poId, brandId);
            // Validate MTOs
            const validMTOs = [];
            const errors = [];
            for (let i = 0; i < mtos.length; i++) {
                const validation = this.validateMTO(mtos[i]);
                if (validation.isValid) {
                    validMTOs.push(mtos[i]);
                }
                else {
                    errors.push({
                        row: i + 2,
                        errors: validation.errors,
                    });
                }
            }
            // Insert valid MTOs
            if (validMTOs.length > 0) {
                const { data: insertedMTOs, error } = await this.supabase
                    .from('mtos')
                    .insert(validMTOs)
                    .select();
                if (error) {
                    throw new error_middleware_1.AppError(error.message, 400);
                }
                // Create barcodes for all MTOs
                for (const mto of insertedMTOs || []) {
                    await this.createMTOBarcodes(mto.id, mto);
                }
                // Clean up uploaded file
                fs_1.default.unlinkSync(file.path);
                return {
                    created: insertedMTOs?.length || 0,
                    errors,
                    mtos: insertedMTOs,
                };
            }
            // Clean up uploaded file
            fs_1.default.unlinkSync(file.path);
            return {
                created: 0,
                errors,
                mtos: [],
            };
        }
        catch (error) {
            logger_1.logger.error('Error in bulk MTO upload:', error);
            throw error;
        }
    }
    async getMTOStatistics(filters) {
        try {
            let query = this.supabase
                .from('mtos')
                .select('*', { count: 'exact', head: false });
            // Apply filters
            if (filters.brandId) {
                query = query.eq('brand_id', filters.brandId);
            }
            if (filters.factoryId) {
                query = query.eq('factory_id', filters.factoryId);
            }
            if (filters.startDate) {
                query = query.gte('created_at', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('created_at', filters.endDate);
            }
            const { data, count } = await query;
            if (!data) {
                return this.getEmptyStatistics();
            }
            // Calculate statistics
            const stats = {
                total: count || 0,
                byStatus: this.groupBy(data, 'status'),
                byProductionStage: this.groupBy(data, 'production_stage'),
                byPriority: this.groupBy(data, 'priority'),
                byCategory: this.groupBy(data, 'production_category'),
                dailyCount: data.filter((m) => m.production_category === 'daily').length,
                monthlyCount: data.filter((m) => m.production_category === 'monthly').length,
                urgentCount: data.filter((m) => m.priority === 'urgent').length,
                completionRate: this.calculateCompletionRate(data),
                averageProductionTime: await this.calculateAverageProductionTime(data),
            };
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error getting MTO statistics:', error);
            throw error;
        }
    }
    async getMTOTimeline(id) {
        try {
            const { data: statusHistory } = await this.supabase
                .from('mto_status_history')
                .select(`
          *,
          user:users(full_name, email)
        `)
                .eq('mto_id', id)
                .order('created_at', { ascending: true });
            const { data: productionHistory } = await this.supabase
                .from('production_history')
                .select(`
          *,
          user:users(full_name, email)
        `)
                .eq('mto_id', id)
                .order('created_at', { ascending: true });
            return {
                statusHistory: statusHistory || [],
                productionHistory: productionHistory || [],
            };
        }
        catch (error) {
            logger_1.logger.error(`Error getting MTO timeline ${id}:`, error);
            throw error;
        }
    }
    async getUploadHistory(filters = {}) {
        try {
            let query = this.supabase
                .from('workspaces')
                .select(`
          *,
          brand:companies!brand_id(name, type),
          factory:companies!factory_id(name, type),
          po:purchase_orders(po_number, total_mtos, source_format),
          _count_mtos:mtos(count)
        `)
                .order('created_at', { ascending: false });
            // Apply filters
            if (filters.brandId) {
                query = query.eq('brand_id', filters.brandId);
            }
            if (filters.factoryId) {
                query = query.eq('factory_id', filters.factoryId);
            }
            if (filters.startDate) {
                query = query.gte('created_at', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('created_at', filters.endDate);
            }
            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.offset) {
                query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 50) - 1);
            }
            const { data: workspaces, error } = await query;
            if (error) {
                logger_1.logger.error('Error getting upload history:', error);
                throw new Error(`Failed to get upload history: ${error.message}`);
            }
            // Get total count for pagination
            const { count } = await this.supabase
                .from('workspaces')
                .select('*', { count: 'exact', head: true });
            return {
                data: workspaces || [],
                total: count || 0,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting upload history:', error);
            throw error;
        }
    }
    async exportMTOsToExcel(filters) {
        try {
            // Get MTOs
            const { data: mtos } = await this.getMTOs({
                ...filters,
                limit: 10000,
                offset: 0,
            });
            // Create workbook
            const workbook = XLSX.utils.book_new();
            // Convert MTOs to worksheet data
            const worksheetData = mtos.map((mto) => ({
                'Internal ID': mto.internal_id,
                'PO Line ID': mto.po_line_id,
                'Reference Number': mto.reference_number,
                'Display Name': mto.display_name,
                'Status': mto.status,
                'Production Stage': mto.production_stage,
                'Priority': mto.priority,
                'Category': mto.production_category,
                'Quantity': mto.quantity,
                'Ship Date': mto.expected_ship_date,
                'Created At': mto.created_at,
            }));
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'MTOs');
            // Generate buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return buffer;
        }
        catch (error) {
            logger_1.logger.error('Error exporting MTOs to Excel:', error);
            throw error;
        }
    }
    // Helper methods
    async detectFileType(fileBuffer) {
        try {
            const workbook = XLSX.read(fileBuffer, {
                type: 'buffer',
                cellText: true,
                raw: false
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            // Check for PO indicators
            const poIndicators = ['purchase order', 'bauble', 'vendor', 'ship to', 'total qty', 'fob cost'];
            const mtoIndicators = ['internal_id', 'po_line_id', 'spot1', 'spot2', 'spot3'];
            let poScore = 0;
            let mtoScore = 0;
            // Check first 20 rows for patterns
            for (let i = 0; i < Math.min(20, data.length); i++) {
                const row = data[i];
                if (!row)
                    continue;
                const rowText = row.join(' ').toLowerCase();
                poIndicators.forEach(indicator => {
                    if (rowText.includes(indicator))
                        poScore++;
                });
                mtoIndicators.forEach(indicator => {
                    if (rowText.includes(indicator))
                        mtoScore++;
                });
            }
            logger_1.logger.info(`File type detection - PO score: ${poScore}, MTO score: ${mtoScore}`);
            return poScore > mtoScore ? 'PO' : 'MTO';
        }
        catch (error) {
            logger_1.logger.warn('Could not detect file type, defaulting to MTO:', error);
            return 'MTO';
        }
    }
    async generateInternalId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `MTO-${timestamp}-${random}`.toUpperCase();
    }
    generateUniqueInternalId(rowIndex) {
        const timestamp = Date.now();
        const hrtime = process.hrtime.bigint();
        const randomBytes = crypto_1.default.randomBytes(4).toString('hex');
        const rowSuffix = rowIndex !== undefined ? `-${rowIndex}` : '';
        return `AUTO-${timestamp}-${hrtime}-${randomBytes}${rowSuffix}`;
    }
    generateUniqueReferenceNumber(rowIndex) {
        const timestamp = Date.now();
        const hrtime = process.hrtime.bigint();
        const randomBytes = crypto_1.default.randomBytes(4).toString('hex');
        const rowSuffix = rowIndex !== undefined ? `-${rowIndex}` : '';
        return `REF-${timestamp}-${hrtime}-${randomBytes}${rowSuffix}`;
    }
    async createMTOBarcodes(mtoId, mtoData) {
        try {
            const barcodes = [];
            // Line barcode
            barcodes.push({
                mto_id: mtoId,
                type: 'line',
                value: `PO:${mtoData.po_id}|LINE:${mtoData.po_line_id}|REF:${mtoData.reference_number}`,
            });
            // Spot barcodes using modern spots_data format
            if (mtoData.spots_data && Array.isArray(mtoData.spots_data)) {
                mtoData.spots_data.forEach((spot) => {
                    if (spot.sku) {
                        barcodes.push({
                            mto_id: mtoId,
                            type: 'spot',
                            value: `PO:${mtoData.po_id}|LINE:${mtoData.po_line_id}|SPOT:${spot.position}|SKU:${spot.sku}`,
                            spot_number: spot.position,
                        });
                    }
                });
            }
            // Master carton barcode from excel_data
            if (mtoData.excel_data?.master_carton) {
                barcodes.push({
                    mto_id: mtoId,
                    type: 'master',
                    value: `PO:${mtoData.po_id}|MASTER:${mtoData.excel_data.master_carton}`,
                });
            }
            // Insert barcodes
            if (barcodes.length > 0) {
                await this.supabase.from('barcodes').insert(barcodes);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error creating barcodes for MTO ${mtoId}:`, error);
        }
    }
    async autoPopulateInventory(mtoData) {
        try {
            // Extract all SKUs from MTO using modern spots_data format
            const skus = [];
            // Base product from excel_data
            if (mtoData.excel_data?.bag_base_pid) {
                skus.push(mtoData.excel_data.bag_base_pid);
            }
            // Spots from spots_data array
            if (mtoData.spots_data && Array.isArray(mtoData.spots_data)) {
                mtoData.spots_data.forEach((spot) => {
                    if (spot.sku) {
                        skus.push(spot.sku);
                    }
                });
            }
            // Check and create inventory items if they don't exist
            for (const sku of skus) {
                const { data: existing } = await this.supabase
                    .from('inventory')
                    .select('id')
                    .eq('sku', sku)
                    .single();
                if (!existing) {
                    await this.supabase
                        .from('inventory')
                        .insert({
                        sku,
                        name: sku,
                        category: 'patch',
                        current_stock: 0,
                        reserved_stock: 0,
                        available_stock: 0,
                        reorder_level: 100,
                        reorder_quantity: 500,
                    });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error auto-populating inventory:', error);
        }
    }
    /**
     * Parse Excel buffer into MTO data with validation and analysis
     * Handles multiple sheets and flexible MTO structures
     * Used by directMTOUpload method
     */
    async parseExcelData(fileBuffer) {
        try {
            // Read Excel file from buffer
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const allValidMTOs = [];
            const allErrors = [];
            const usedInternalIds = new Set();
            let totalRowsProcessed = 0;
            // Process all sheets in the workbook
            for (const sheetName of workbook.SheetNames) {
                logger_1.logger.info(`Processing sheet: ${sheetName}`);
                const worksheet = workbook.Sheets[sheetName];
                // Parse sheet data
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                // Skip empty sheets
                if (!data || data.length < 2) {
                    logger_1.logger.info(`Sheet ${sheetName} is empty or has no data rows, skipping`);
                    continue;
                }
                const validMTOs = [];
                const errors = [];
                // Find the header row (might not be the first row)
                let headerRowIndex = 0;
                let headers = data[0];
                // Look for header row in first 10 rows
                for (let i = 0; i < Math.min(10, data.length); i++) {
                    const row = data[i];
                    if (row && row.length > 0) {
                        const testMap = this.createHeaderMap(row);
                        const mappedFields = Object.values(testMap).filter(v => v !== -1).length;
                        // If we found at least 2 mapped fields, consider this the header row
                        if (mappedFields >= 2) {
                            headerRowIndex = i;
                            headers = row;
                            logger_1.logger.info(`Found header row at index ${i} in sheet ${sheetName}`);
                            break;
                        }
                    }
                }
                logger_1.logger.info(`Headers in sheet ${sheetName}:`, headers);
                const headerMap = this.createHeaderMap(headers);
                logger_1.logger.info(`Header mapping for sheet ${sheetName}:`, headerMap);
                // Process data rows starting after header
                for (let i = headerRowIndex + 1; i < data.length; i++) {
                    const row = data[i];
                    // Skip completely empty rows
                    if (!row || row.length === 0 || row.every(cell => !cell || cell.toString().trim() === '')) {
                        continue;
                    }
                    totalRowsProcessed++;
                    try {
                        // Extract spots from row and enrich with vocabulary
                        const spots = [];
                        for (let spotIndex = 1; spotIndex <= 6; spotIndex++) {
                            const skuCol = headerMap[`spot${spotIndex}`];
                            const refCol = headerMap[`spot${spotIndex}_ref`];
                            if (skuCol !== -1 && row[skuCol] && row[skuCol].toString().trim()) {
                                const sku = row[skuCol].toString().trim();
                                const patchRef = refCol !== -1 && row[refCol] ? row[refCol].toString().trim() : null;
                                // Create spot with potential vocabulary lookup
                                const spot = {
                                    position: spotIndex,
                                    sku,
                                    patch_ref: patchRef,
                                    description: patchRef || `Patch ${sku}`,
                                    // Mark for vocabulary translation
                                    needs_vocabulary: true,
                                    brand_sku: sku,
                                    brand_description: patchRef
                                };
                                spots.push(spot);
                            }
                        }
                        // Build MTO data using modern structure
                        let internalId = this.getColumnValue(row, headerMap, 'internal_id');
                        // Check if internal_id looks like a Yes/No value and ignore it
                        if (internalId && (internalId.toLowerCase() === 'no' || internalId.toLowerCase() === 'yes')) {
                            logger_1.logger.warn(`Invalid internal_id value "${internalId}" at row ${i + 1}, will generate new ID`);
                            internalId = null;
                        }
                        // If internal_id from Excel is empty or already used, generate a unique one
                        if (!internalId || usedInternalIds.has(internalId)) {
                            if (internalId && usedInternalIds.has(internalId)) {
                                logger_1.logger.warn(`Duplicate internal_id "${internalId}" found at row ${i + 1}, generating new ID`);
                            }
                            // Try SKU field as fallback for internal_id
                            const skuValue = this.getColumnValue(row, headerMap, 'sku');
                            if (skuValue && !usedInternalIds.has(skuValue)) {
                                internalId = skuValue;
                            }
                            else {
                                internalId = this.generateUniqueInternalId(i);
                            }
                        }
                        usedInternalIds.add(internalId);
                        // Get display name with multiple fallback options
                        let displayName = this.getColumnValue(row, headerMap, 'display_name');
                        // If display name is empty or just whitespace, try multiple fallbacks
                        if (!displayName || displayName.toString().trim() === '') {
                            // Try these fields in order of preference
                            const fallbackFields = [
                                'reference_number',
                                'sku',
                                'bag_base_pid',
                                'sales_order_number',
                                'po_line_id'
                            ];
                            for (const field of fallbackFields) {
                                const value = this.getColumnValue(row, headerMap, field);
                                if (value && value.toString().trim() !== '') {
                                    displayName = value;
                                    logger_1.logger.info(`Using ${field} as display name: ${displayName}`);
                                    break;
                                }
                            }
                            // If still no display name, generate one from available data
                            if (!displayName || displayName.toString().trim() === '') {
                                const internalIdForDisplay = this.getColumnValue(row, headerMap, 'internal_id');
                                const bagBase = this.getColumnValue(row, headerMap, 'bag_base_pid');
                                if (bagBase) {
                                    displayName = `${bagBase}-${internalIdForDisplay || i}`;
                                }
                                else {
                                    displayName = `MTO-${internalIdForDisplay || i}`;
                                }
                                logger_1.logger.info(`Generated display name: ${displayName}`);
                            }
                        }
                        const mtoData = {
                            internal_id: internalId,
                            po_line_id: this.getColumnValue(row, headerMap, 'po_line_id') || i.toString(),
                            display_name: displayName,
                            reference_number: this.getColumnValue(row, headerMap, 'reference_number') || this.generateUniqueReferenceNumber(i),
                            quantity: parseInt(this.getColumnValue(row, headerMap, 'quantity')) || 1,
                            expected_ship_date: this.parseExcelDate(this.getColumnValue(row, headerMap, 'expected_ship_date')),
                            status: 'pending',
                            production_stage: 'receive',
                            production_category: 'monthly',
                            priority: 'normal',
                            // Modern JSONB storage
                            spots_data: spots,
                            // Store ALL original Excel data for complete preservation
                            excel_data: this.captureAllExcelData(row, headers, headerMap, {
                                sheet: sheetName,
                                row_number: i,
                                parsed_at: new Date().toISOString(),
                                source: 'excel_upload'
                            })
                        };
                        // Validation - display_name now has fallback, so just ensure it exists
                        if (!mtoData.display_name || mtoData.display_name.trim() === '') {
                            logger_1.logger.warn(`Row ${i + 1} has no identifiable data, skipping`);
                            errors.push({
                                row: i + 1,
                                errors: ['No identifiable data found in row']
                            });
                            continue;
                        }
                        // Additional validation: check if row has any meaningful data
                        const hasSpots = spots.length > 0;
                        const hasQuantity = mtoData.quantity > 0;
                        if (!hasSpots && !hasQuantity) {
                            logger_1.logger.warn(`Row ${i + 1} appears to be empty or invalid, skipping`);
                            continue; // Skip completely empty rows without logging as error
                        }
                        validMTOs.push(mtoData);
                    }
                    catch (error) {
                        errors.push({
                            row: i + 1,
                            errors: [`Parsing error: ${error.message}`]
                        });
                    }
                }
                // Add sheet results to overall results
                allValidMTOs.push(...validMTOs);
                allErrors.push(...errors.map(e => ({ ...e, sheet: sheetName })));
            }
            // Excel analysis
            const excelAnalysis = {
                totalRows: totalRowsProcessed,
                validRows: allValidMTOs.length,
                errorRows: allErrors.length,
                detectedSpots: allValidMTOs.reduce((sum, mto) => sum + (mto.spots_data?.length || 0), 0),
                qualityScore: totalRowsProcessed > 0 ? Math.round((allValidMTOs.length / totalRowsProcessed) * 100) : 0,
                format: 'MTO',
                sheetsProcessed: workbook.SheetNames.length
            };
            logger_1.logger.info(`Parsed ${allValidMTOs.length} valid MTOs from ${workbook.SheetNames.length} sheets`);
            return { validMTOs: allValidMTOs, errors: allErrors, excelAnalysis };
        }
        catch (error) {
            logger_1.logger.error('Excel parsing failed:', error);
            throw new Error(`Failed to parse Excel file: ${error.message}`);
        }
    }
    /**
     * Legacy parseExcelData method for backward compatibility
     */
    parseExcelDataLegacy(data, poId, brandId) {
        const headers = data[0];
        const mtos = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row[0])
                continue; // Skip empty rows
            // Extract spots into modern JSONB format
            const spots = [];
            const spotColumns = [
                { sku: row[16], ref: row[23] }, // spot1
                { sku: row[17], ref: row[24] }, // spot2
                { sku: row[18], ref: row[25] }, // spot3
                { sku: row[19], ref: row[26] }, // spot4
                { sku: row[20], ref: row[27] }, // spot5
                { sku: row[21], ref: row[28] } // spot6
            ];
            spotColumns.forEach((spot, index) => {
                if (spot.sku && spot.sku.toString().trim()) {
                    spots.push({
                        position: index + 1,
                        sku: spot.sku.toString().trim(),
                        patch_ref: spot.ref ? spot.ref.toString().trim() : null,
                        description: spot.ref ? spot.ref.toString().trim() : `Patch ${spot.sku}`
                    });
                }
            });
            const mto = {
                internal_id: row[0],
                po_id: poId,
                po_line_id: row[1],
                display_name: row[13],
                reference_number: row[14],
                quantity: parseInt(row[15]) || 1,
                expected_ship_date: this.parseExcelDate(row[2]),
                actual_ship_date: this.parseExcelDate(row[3]),
                brand_id: brandId,
                status: 'pending',
                production_stage: 'receive',
                production_category: this.determineCategory(row[2]),
                priority: this.determinePriority(row[2]),
                // Modern spots storage
                spots_data: spots,
                // Store ALL original Excel data in JSONB
                excel_data: {
                    internal_id: row[0],
                    po_line_id: row[1],
                    expected_ship_date: row[2],
                    actual_ship_date: row[3],
                    po_line_tracking: row[4],
                    awb: row[5],
                    master_carton: row[6],
                    vendor_po_status: row[7],
                    order_submit_date: row[8],
                    so_date: row[9],
                    shopify_order_date: row[10],
                    sales_order_number: row[11],
                    cpsd: row[12],
                    display_name: row[13],
                    reference_number: row[14],
                    quantity: row[15],
                    spot1: row[16],
                    spot2: row[17],
                    spot3: row[18],
                    spot4: row[19],
                    spot5: row[20],
                    spot6: row[21],
                    bag_base_pid: row[22],
                    spot1_patch_ref: row[23],
                    spot2_patch_ref: row[24],
                    spot3_patch_ref: row[25],
                    spot4_patch_ref: row[26],
                    spot5_patch_ref: row[27],
                    spot6_patch_ref: row[28],
                    parsed_at: new Date().toISOString(),
                    source: 'excel_upload'
                }
            };
            mtos.push(mto);
        }
        return mtos;
    }
    parseExcelDate(value) {
        if (!value)
            return null;
        try {
            // Already a valid Date object
            if (value instanceof Date) {
                const year = value.getFullYear();
                // Sanity check - reject dates outside reasonable range
                if (year < 1900 || year > 2100)
                    return null;
                return value.toISOString().split('T')[0]; // Return date only, not datetime
            }
            // Excel date serial number
            if (typeof value === 'number') {
                // Excel dates are numbers of days since 1900-01-01
                // But Excel incorrectly treats 1900 as a leap year
                const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
                const msPerDay = 24 * 60 * 60 * 1000;
                const date = new Date(excelEpoch.getTime() + value * msPerDay);
                const year = date.getFullYear();
                // Sanity check - reject invalid dates
                if (year < 1900 || year > 2100 || isNaN(date.getTime()))
                    return null;
                return date.toISOString().split('T')[0]; // Return date only
            }
            // String date
            if (typeof value === 'string') {
                // Clean up common date formats
                const cleanValue = value.trim();
                // Skip if it's clearly not a date
                if (!cleanValue || cleanValue === '-' || cleanValue === 'N/A')
                    return null;
                const parsed = new Date(cleanValue);
                const year = parsed.getFullYear();
                // Sanity check
                if (isNaN(parsed.getTime()) || year < 1900 || year > 2100)
                    return null;
                return parsed.toISOString().split('T')[0]; // Return date only
            }
            return null;
        }
        catch (error) {
            logger_1.logger.warn(`Failed to parse date value: ${value}`, error);
            return null;
        }
    }
    determineCategory(shipDate) {
        if (!shipDate)
            return 'monthly';
        const date = this.parseExcelDate(shipDate);
        if (!date)
            return 'monthly';
        const daysUntilShip = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilShip <= 7 ? 'daily' : 'monthly';
    }
    determinePriority(shipDate) {
        const category = this.determineCategory(shipDate);
        if (category === 'daily')
            return 'urgent';
        const date = this.parseExcelDate(shipDate);
        if (!date)
            return 'normal';
        const daysUntilShip = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilShip < 0)
            return 'urgent';
        if (daysUntilShip <= 3)
            return 'urgent';
        if (daysUntilShip <= 7)
            return 'high';
        if (daysUntilShip <= 14)
            return 'normal';
        return 'low';
    }
    validateMTO(mto) {
        const errors = [];
        if (!mto.internal_id) {
            errors.push('Internal ID is required');
        }
        if (!mto.po_line_id) {
            errors.push('PO Line ID is required');
        }
        if (!mto.reference_number) {
            errors.push('Reference number is required');
        }
        if (!mto.display_name) {
            errors.push('Display name is required');
        }
        if (!mto.quantity || mto.quantity < 1) {
            errors.push('Valid quantity is required');
        }
        if (!mto.bag_base_pid) {
            errors.push('Base product ID is required');
        }
        // Check if at least one spot is filled
        const hasSpots = [
            mto.spot1, mto.spot2, mto.spot3,
            mto.spot4, mto.spot5, mto.spot6
        ].some(spot => spot && spot.toString().trim());
        if (!hasSpots) {
            errors.push('At least one customization spot is required');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    groupBy(data, key) {
        return data.reduce((acc, item) => {
            const value = item[key] || 'unknown';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
    calculateCompletionRate(data) {
        if (data.length === 0)
            return 0;
        const completed = data.filter((m) => m.status === 'shipped').length;
        return Math.round((completed / data.length) * 100);
    }
    async calculateAverageProductionTime(data) {
        const completedMTOs = data.filter((m) => m.status === 'shipped' && m.created_at && m.updated_at);
        if (completedMTOs.length === 0)
            return 0;
        const totalTime = completedMTOs.reduce((sum, mto) => {
            const start = new Date(mto.created_at).getTime();
            const end = new Date(mto.updated_at).getTime();
            return sum + (end - start);
        }, 0);
        // Return average time in days
        return Math.round(totalTime / completedMTOs.length / (1000 * 60 * 60 * 24));
    }
    getEmptyStatistics() {
        return {
            total: 0,
            byStatus: {},
            byProductionStage: {},
            byPriority: {},
            byCategory: {},
            dailyCount: 0,
            monthlyCount: 0,
            urgentCount: 0,
            completionRate: 0,
            averageProductionTime: 0,
        };
    }
    // Smart MTO Processing Helper Methods
    /**
     * Create or get PO record
     */
    async createOrGetPO(poNumber, brandId, factoryId) {
        let { data: po } = await this.supabase
            .from('purchase_orders')
            .select('*')
            .eq('po_number', poNumber)
            .single();
        if (!po) {
            const { data: newPO, error } = await this.supabase
                .from('purchase_orders')
                .insert({
                po_number: poNumber,
                brand_id: brandId,
                factory_id: factoryId,
                status: 'not_started',
                order_date: new Date().toISOString().split('T')[0],
                total_mtos: 0
            })
                .select()
                .single();
            if (error)
                throw new error_middleware_1.AppError(error.message, 400);
            po = newPO;
        }
        return po;
    }
    /**
     * Smart MTO enrichment - adds intelligence to parsed Excel data
     */
    async smartEnrichMTOs(parsedMTOs, brandId, factoryId) {
        const enrichedMTOs = [];
        for (const parsedMTO of parsedMTOs) {
            try {
                // Smart categorization based on ship date
                const category = this.determineCategory(parsedMTO.expected_ship_date);
                const priority = this.determinePriority(parsedMTO.expected_ship_date);
                // Enhanced spot processing with vocabulary mapping
                const enrichedSpots = await this.processAndEnrichSpots(parsedMTO.spots, brandId, factoryId);
                const enrichedMTO = {
                    ...parsedMTO,
                    production_category: category,
                    priority: priority,
                    spots: enrichedSpots,
                    status: 'pending',
                    is_replacement: false,
                    is_rush: this.isRushOrder(parsedMTO.expected_ship_date),
                    tags: this.generateSmartTags(parsedMTO, enrichedSpots),
                    custom_fields: {
                        originalSpotCount: parsedMTO.spots?.length || 0,
                        enrichedAt: new Date().toISOString(),
                        analysisVersion: '2.0'
                    }
                };
                enrichedMTOs.push(enrichedMTO);
            }
            catch (error) {
                logger_1.logger.error(`Failed to enrich MTO ${parsedMTO.internal_id}:`, error);
                // Add with minimal enrichment as fallback
                enrichedMTOs.push({
                    ...parsedMTO,
                    production_category: 'monthly',
                    priority: 'normal',
                    status: 'pending',
                    is_replacement: false,
                    is_rush: false,
                    spots: parsedMTO.spots || []
                });
            }
        }
        return enrichedMTOs;
    }
    /**
     * Process spots with intelligent vocabulary mapping
     */
    async processAndEnrichSpots(spots, brandId, factoryId) {
        if (!spots || spots.length === 0)
            return [];
        const enrichedSpots = [];
        for (const spot of spots) {
            try {
                // Get or create vocabulary mapping for this SKU
                const vocabularyMapping = await this.vocabularyService.findOrCreateMapping(spot.sku, brandId, factoryId, spot.patch_ref);
                const enrichedSpot = {
                    position: spot.position,
                    sku: spot.sku,
                    patch_ref: spot.patch_ref,
                    description: vocabularyMapping?.factory_description || spot.patch_ref || `Patch ${spot.sku}`,
                    visual_location: vocabularyMapping?.patch_position || this.inferVisualLocation(spot.position),
                    material_code: vocabularyMapping?.factory_material_code,
                    patch_type: vocabularyMapping?.patch_type || 'embroidery',
                    complexity_level: vocabularyMapping?.complexity_level || 'medium',
                    production_time_minutes: vocabularyMapping?.production_time_minutes || this.estimateProductionTime(spot.patch_ref)
                };
                enrichedSpots.push(enrichedSpot);
            }
            catch (error) {
                logger_1.logger.error(`Failed to enrich spot ${spot.sku}:`, error);
                // Fallback to basic spot data
                enrichedSpots.push({
                    position: spot.position,
                    sku: spot.sku,
                    patch_ref: spot.patch_ref,
                    description: spot.patch_ref || `Patch ${spot.sku}`,
                    visual_location: this.inferVisualLocation(spot.position)
                });
            }
        }
        return enrichedSpots;
    }
    /**
     * Bulk create MTOs with flexible spots stored as JSONB
     */
    async bulkCreateMTOsWithSpots(enrichedMTOs, poId, userId) {
        const savedMTOs = [];
        // Process in batches to avoid database limits
        const batchSize = 50;
        for (let i = 0; i < enrichedMTOs.length; i += batchSize) {
            const batch = enrichedMTOs.slice(i, i + batchSize);
            const insertData = batch.map(mto => ({
                po_id: poId,
                internal_id: mto.internal_id,
                po_line_id: mto.po_line_id,
                display_name: mto.display_name,
                reference_number: mto.reference_number,
                quantity: mto.quantity,
                bag_base_pid: mto.bag_base_pid,
                expected_ship_date: mto.expected_ship_date,
                actual_ship_date: mto.actual_ship_date,
                order_submit_date: mto.order_submit_date,
                so_date: mto.so_date,
                shopify_order_date: mto.shopify_order_date,
                sales_order_number: mto.sales_order_number,
                cpsd: mto.cpsd,
                po_line_tracking: mto.po_line_tracking,
                awb: mto.awb,
                master_carton: mto.master_carton,
                vendor_po_status: mto.vendor_po_status,
                production_category: mto.production_category,
                priority: mto.priority,
                status: mto.status,
                is_rush: mto.is_rush,
                is_replacement: mto.is_replacement,
                spots_data: mto.spots, // Store flexible spots as JSONB
                tags: mto.tags,
                custom_fields: mto.custom_fields,
                created_by: userId
            }));
            const { data: batchResult, error } = await this.supabase
                .from('mtos')
                .insert(insertData)
                .select();
            if (error) {
                logger_1.logger.error(`Failed to insert MTO batch ${i}-${i + batchSize}:`, error);
                throw new error_middleware_1.AppError(error.message, 400);
            }
            savedMTOs.push(...(batchResult || []));
        }
        // Update PO with MTO count
        await this.supabase
            .from('purchase_orders')
            .update({ total_mtos: savedMTOs.length })
            .eq('id', poId);
        logger_1.logger.info(`Successfully saved ${savedMTOs.length} MTOs to database`);
        return savedMTOs;
    }
    /**
     * Auto-populate all related systems based on MTO analysis
     */
    async autoPopulateAllSystems(savedMTOs, brandId, factoryId, userId) {
        logger_1.logger.info('Starting auto-population of all systems...');
        // 1. Auto-populate inventory from all detected spots
        const inventoryResults = await this.inventoryService.autoPopulateFromMTOs(savedMTOs, brandId, factoryId);
        // 2. Create vocabulary mappings for new SKUs and translate spots
        const vocabularyResults = await this.processVocabularyForMTOs(savedMTOs, brandId, factoryId);
        // 3. Generate barcodes for all spots and MTOs
        const barcodeResults = await this.generateComprehensiveBarcodes(savedMTOs);
        return {
            inventory: inventoryResults,
            vocabulary: vocabularyResults,
            barcodes: barcodeResults
        };
    }
    /**
     * Process vocabulary mappings and translations for MTO spots
     */
    async processVocabularyForMTOs(mtos, brandId, factoryId) {
        try {
            const vocabularyMap = new Map();
            let created = 0;
            let translated = 0;
            for (const mto of mtos) {
                if (mto.spots_data && Array.isArray(mto.spots_data)) {
                    for (const spot of mto.spots_data) {
                        if (spot.sku && !vocabularyMap.has(spot.sku)) {
                            // Check if vocabulary exists for this SKU
                            const { data: existing } = await this.supabase
                                .from('vocabulary_mappings')
                                .select('*')
                                .eq('brand_id', brandId)
                                .eq('factory_id', factoryId)
                                .eq('brand_sku', spot.sku)
                                .single();
                            if (existing) {
                                // Use existing vocabulary
                                vocabularyMap.set(spot.sku, existing);
                                spot.factory_description = existing.factory_description;
                                spot.factory_sku = existing.factory_sku;
                                spot.production_instructions = existing.special_instructions;
                                translated++;
                            }
                            else {
                                // Create new vocabulary mapping
                                const newMapping = {
                                    brand_id: brandId,
                                    factory_id: factoryId,
                                    brand_sku: spot.sku,
                                    brand_description: spot.patch_ref || spot.description,
                                    factory_sku: `FAC-${spot.sku}`, // Default factory SKU
                                    factory_description: spot.patch_ref || `Factory: ${spot.description}`,
                                    patch_type: this.detectPatchType(spot.patch_ref),
                                    patch_position: this.inferVisualLocation(spot.position),
                                    complexity_level: 'medium',
                                    production_time_minutes: 15,
                                    active: true,
                                    verified: false,
                                    usage_count: 1
                                };
                                const { data: inserted } = await this.supabase
                                    .from('vocabulary_mappings')
                                    .insert(newMapping)
                                    .select()
                                    .single();
                                if (inserted) {
                                    vocabularyMap.set(spot.sku, inserted);
                                    created++;
                                }
                            }
                        }
                    }
                }
            }
            logger_1.logger.info(`Vocabulary processing complete: ${created} created, ${translated} translated`);
            return { created, translated, mappings: Array.from(vocabularyMap.values()) };
        }
        catch (error) {
            logger_1.logger.error('Error processing vocabulary:', error);
            return { created: 0, translated: 0, error: error.message };
        }
    }
    /**
     * Detect patch type from description
     */
    detectPatchType(description) {
        if (!description)
            return 'embroidery';
        const desc = description.toLowerCase();
        if (desc.includes('letter'))
            return 'letter';
        if (desc.includes('icon'))
            return 'icon';
        if (desc.includes('logo'))
            return 'logo';
        if (desc.includes('text'))
            return 'text';
        if (desc.includes('emoji'))
            return 'emoji';
        return 'embroidery';
    }
    /**
     * Generate comprehensive barcodes for all aspects of MTOs
     */
    async generateComprehensiveBarcodes(mtos) {
        try {
            const barcodes = [];
            for (const mto of mtos) {
                // 1. MTO main barcode
                barcodes.push({
                    mto_id: mto.id,
                    type: 'mto',
                    value: `MTO:${mto.internal_id}|PO:${mto.po_id}`,
                    metadata: { display_name: mto.display_name }
                });
                // 2. Each spot barcode
                if (mto.spots_data && Array.isArray(mto.spots_data)) {
                    for (const spot of mto.spots_data) {
                        barcodes.push({
                            mto_id: mto.id,
                            type: 'spot',
                            value: `MTO:${mto.internal_id}|SPOT:${spot.position}|SKU:${spot.sku}`,
                            spot_number: spot.position,
                            metadata: { patch_ref: spot.patch_ref }
                        });
                    }
                }
                // 3. Sales order barcode if exists
                if (mto.excel_data?.sales_order_number) {
                    barcodes.push({
                        mto_id: mto.id,
                        type: 'sales_order',
                        value: `SO:${mto.excel_data.sales_order_number}|MTO:${mto.internal_id}`
                    });
                }
                // 4. Reference barcode
                if (mto.reference_number) {
                    barcodes.push({
                        mto_id: mto.id,
                        type: 'reference',
                        value: `REF:${mto.reference_number}`
                    });
                }
                // 5. Bag base PID barcode
                if (mto.excel_data?.bag_base_pid || mto.bag_base_pid) {
                    const basePid = mto.excel_data?.bag_base_pid || mto.bag_base_pid;
                    barcodes.push({
                        mto_id: mto.id,
                        type: 'base_product',
                        value: `BASE:${basePid}|QTY:${mto.quantity}`
                    });
                }
            }
            // Bulk insert barcodes
            if (barcodes.length > 0) {
                const { data: inserted, error } = await this.supabase
                    .from('barcodes')
                    .insert(barcodes)
                    .select();
                if (error) {
                    logger_1.logger.error('Error creating barcodes:', error);
                    return { created: 0, error: error.message };
                }
                logger_1.logger.info(`Created ${inserted?.length || 0} barcodes`);
                return { created: inserted?.length || 0 };
            }
            return { created: 0 };
        }
        catch (error) {
            logger_1.logger.error('Error generating barcodes:', error);
            return { created: 0, error: error.message };
        }
    }
    /**
     * Generate comprehensive analysis report
     */
    generateSmartAnalysisReport(savedMTOs, autoPopulationResults, excelAnalysis) {
        const totalMTOs = savedMTOs.length;
        const uniqueSpots = new Set();
        // Count unique spots across all MTOs
        savedMTOs.forEach(mto => {
            if (mto.spots_data) {
                mto.spots_data.forEach((spot) => uniqueSpots.add(spot.sku));
            }
        });
        const dailyProduction = savedMTOs.filter(m => m.production_category === 'daily').length;
        const monthlyProduction = savedMTOs.filter(m => m.production_category === 'monthly').length;
        const urgentItems = savedMTOs.filter(m => m.priority === 'urgent').length;
        // Analyze spot patterns
        const spotPatterns = {};
        savedMTOs.forEach(mto => {
            const spotCount = mto.spots_data?.length || 0;
            const key = `${spotCount}-spots`;
            spotPatterns[key] = (spotPatterns[key] || 0) + 1;
        });
        return {
            upload: {
                totalMTOs,
                uniqueSpots: uniqueSpots.size,
                dailyProduction,
                monthlyProduction,
                urgentItems,
                spotPatterns
            },
            excel: {
                qualityScore: excelAnalysis.qualityScore,
                detectedSpots: excelAnalysis.detectedSpots,
                totalRows: excelAnalysis.totalRows
            },
            autoPopulation: {
                inventoryItems: autoPopulationResults.inventory?.created || 0,
                vocabularyMappings: autoPopulationResults.vocabulary?.created || 0,
                barcodesGenerated: autoPopulationResults.barcodes?.created || 0
            },
            summary: {
                successRate: Math.round((totalMTOs / excelAnalysis.totalRows) * 100),
                systemsPopulated: ['inventory', 'vocabulary', 'barcodes'],
                completedAt: new Date().toISOString()
            }
        };
    }
    /**
     * Infer visual location based on spot position
     */
    inferVisualLocation(position) {
        const locationMap = {
            1: 'Front Center',
            2: 'Front Left',
            3: 'Front Right',
            4: 'Back Center',
            5: 'Back Left',
            6: 'Back Right',
            7: 'Side Left',
            8: 'Side Right',
            9: 'Handle Left',
            10: 'Handle Right'
        };
        return locationMap[position] || `Position ${position}`;
    }
    /**
     * Estimate production time based on patch reference
     */
    estimateProductionTime(patchRef) {
        if (!patchRef)
            return 15; // Default 15 minutes
        const ref = patchRef.toLowerCase();
        // Icon patches (simple)
        if (ref.includes('icon'))
            return 10;
        // Letter patches (medium)
        if (ref.includes('letter') || ref.includes(' - '))
            return 15;
        // Complex text or designs
        if (ref.length > 20)
            return 25;
        // Default medium complexity
        return 15;
    }
    /**
     * Check if order is rush based on ship date
     */
    isRushOrder(shipDate) {
        if (!shipDate)
            return false;
        const date = new Date(shipDate);
        if (isNaN(date.getTime()))
            return false;
        const daysUntilShip = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilShip <= 3;
    }
    /**
     * Generate smart tags for MTOs
     */
    generateSmartTags(mto, spots) {
        const tags = [];
        // Add production category tag
        tags.push(mto.production_category || 'monthly');
        // Add priority tag
        tags.push(mto.priority || 'normal');
        // Add spot count tag
        tags.push(`${spots.length}-spots`);
        // Add rush tag if applicable
        if (mto.is_rush)
            tags.push('rush');
        // Add product type tags
        if (mto.display_name) {
            const name = mto.display_name.toLowerCase();
            if (name.includes('tote'))
                tags.push('tote-bag');
            if (name.includes('custom'))
                tags.push('custom');
            if (name.includes('medium'))
                tags.push('medium-size');
            if (name.includes('large'))
                tags.push('large-size');
        }
        return tags;
    }
    /**
     * Create header mapping for flexible column detection
     * Enhanced to handle your exact column names and any format
     */
    createHeaderMap(headers) {
        const map = {};
        // Enhanced mappings to handle YOUR EXACT column names
        const mappings = {
            // Internal ID variations
            'internal_id': ['internal id', 'internal_id', 'internalid', 'item_id', 'sku_id', 'product_id', 'item id'],
            // PO Line ID variations
            'po_line_id': ['po line id', 'po_line_id', 'polineid', 'line_number', 'line number', 'po line', 'line_item', 'line id'],
            // Display Name - FIXED to catch "Display Name" exactly
            'display_name': ['display name', 'display_name', 'displayname', 'product_name', 'product name', 'name', 'description', 'item_name', 'item name', 'product description', 'title', 'product title'],
            // Reference Number variations
            'reference_number': ['reference #', 'reference_#', 'reference number', 'reference_number', 'ref', 'reference', 'label', 'ref_number', 'ref_no', 'reference_no', 'product_code', 'code'],
            // Quantity variations
            'quantity': ['quantity', 'qty', 'amount', 'total_quantity', 'total quantity', 'units', 'count', 'pieces', 'pcs', 'order_quantity', 'order quantity', 'ordered', 'order_qty'],
            // Expected Ship Date variations
            'expected_ship_date': ['expected ship date', 'expected_ship_date', 'expectedshipdate', 'ship_date', 'ship date', 'expected ship', 'delivery_date', 'delivery date', 'delivery', 'requested_date', 'requested date', 'target_date', 'target date'],
            // Actual Ship Date
            'actual_ship_date': ['actual ship date', 'actual_ship_date', 'actualshipdate', 'shipped date', 'shipped_date'],
            // Sales Order Number
            'sales_order_number': ['sales order #', 'sales_order_#', 'sales order number', 'sales_order_number', 'so #', 'so_#', 'so number'],
            // Bag Base PID
            'bag_base_pid': ['bag base pid', 'bag_base_pid', 'bagbasepid', 'base pid', 'base_pid', 'base product'],
            // SKU as fallback
            'sku': ['sku', 'style#', 'style_number', 'style', 'item', 'po#', 'po_number'],
            // Spot columns - YOUR EXACT format "Spot 1", "Spot 2", etc.
            'spot1': ['spot 1', 'spot_1', 'spot1', 'patch 1', 'patch_1', 'patch1', 'embroidery 1', 'embroidery_1', 'logo 1', 'logo_1'],
            'spot2': ['spot 2', 'spot_2', 'spot2', 'patch 2', 'patch_2', 'patch2', 'embroidery 2', 'embroidery_2', 'logo 2', 'logo_2'],
            'spot3': ['spot 3', 'spot_3', 'spot3', 'patch 3', 'patch_3', 'patch3', 'embroidery 3', 'embroidery_3', 'logo 3', 'logo_3'],
            'spot4': ['spot 4', 'spot_4', 'spot4', 'patch 4', 'patch_4', 'patch4', 'embroidery 4', 'embroidery_4', 'logo 4', 'logo_4'],
            'spot5': ['spot 5', 'spot_5', 'spot5', 'patch 5', 'patch_5', 'patch5', 'embroidery 5', 'embroidery_5', 'logo 5', 'logo_5'],
            'spot6': ['spot 6', 'spot_6', 'spot6', 'patch 6', 'patch_6', 'patch6', 'embroidery 6', 'embroidery_6', 'logo 6', 'logo_6'],
            // Spot patch references - YOUR format "Spot X - Patch Ref"
            'spot1_ref': ['spot 1 - patch ref', 'spot_1_-_patch_ref', 'spot 1 patch ref', 'spot_1_patch_ref', 'spot 1 ref', 'spot1_ref'],
            'spot2_ref': ['spot 2 - patch ref', 'spot_2_-_patch_ref', 'spot 2 patch ref', 'spot_2_patch_ref', 'spot 2 ref', 'spot2_ref'],
            'spot3_ref': ['spot 3 - patch ref', 'spot_3_-_patch_ref', 'spot 3 patch ref', 'spot_3_patch_ref', 'spot 3 ref', 'spot3_ref'],
            'spot4_ref': ['spot 4 - patch ref', 'spot_4_-_patch_ref', 'spot 4 patch ref', 'spot_4_patch_ref', 'spot 4 ref', 'spot4_ref'],
            'spot5_ref': ['spot 5 - patch ref', 'spot_5_-_patch_ref', 'spot 5 patch ref', 'spot_5_patch_ref', 'spot 5 ref', 'spot5_ref'],
            'spot6_ref': ['spot 6 - patch ref', 'spot_6_-_patch_ref', 'spot 6 patch ref', 'spot_6_patch_ref', 'spot 6 ref', 'spot6_ref'],
            // Additional important columns from your Excel
            'po_line_tracking': ['po line tracking #', 'po_line_tracking_#', 'po line tracking number', 'tracking #', 'tracking_#'],
            'po_line_carton': ['po line carton #', 'po_line_carton_#', 'carton #', 'carton_#', 'master carton'],
            'order_submit_date': ['order submit date', 'order_submit_date', 'submit date', 'submitted'],
            'shopify_order_date': ['shopify order date/time', 'shopify_order_date', 'shopify date', 'order date'],
            'cpsd': ['cpsd', 'customer promised ship date'],
            'order_type': ['order type', 'order_type', 'type'],
            'po_line_invoice': ['po line invoice #', 'po_line_invoice_#', 'invoice #', 'invoice_#']
        };
        // Process each header with better normalization
        headers.forEach((header, index) => {
            if (!header || header.toString().trim() === '')
                return;
            // Normalize header: lowercase, trim, but preserve spaces for matching
            const normalizedHeader = header.toString().toLowerCase().trim();
            const underscoreHeader = normalizedHeader.replace(/[\s\-]+/g, '_');
            const noSpaceHeader = normalizedHeader.replace(/[\s\-]+/g, '');
            // Find matching field
            for (const [field, variations] of Object.entries(mappings)) {
                // Check if already mapped
                if (field in map)
                    continue;
                // Try exact match with normalized header
                if (variations.some(variation => normalizedHeader === variation ||
                    underscoreHeader === variation.replace(/[\s\-]+/g, '_') ||
                    noSpaceHeader === variation.replace(/[\s\-]+/g, ''))) {
                    map[field] = index;
                    logger_1.logger.info(`Mapped column "${header}" at index ${index} to field "${field}"`);
                    break;
                }
            }
        });
        // Log which important fields were NOT found
        const requiredFields = ['internal_id', 'display_name', 'quantity'];
        requiredFields.forEach(field => {
            if (!(field in map) || map[field] === -1) {
                logger_1.logger.warn(`Required field "${field}" not found in headers`);
            }
        });
        // Set default values for missing mappings
        Object.keys(mappings).forEach(field => {
            if (!(field in map)) {
                map[field] = -1; // Not found
            }
        });
        return map;
    }
    /**
     * Get column value using header mapping
     */
    getColumnValue(row, headerMap, field) {
        const colIndex = headerMap[field];
        if (colIndex === -1 || colIndex === undefined || colIndex >= row.length) {
            return null;
        }
        const value = row[colIndex];
        // Return null for empty values
        if (value === undefined || value === null || value === '') {
            return null;
        }
        // Handle string values
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        }
        return value;
    }
    /**
     * Capture ALL Excel columns into JSONB for complete data preservation
     */
    captureAllExcelData(row, headers, headerMap, metadata) {
        const excelData = { ...metadata };
        // Store all columns with their original header names
        headers.forEach((header, index) => {
            if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
                // Normalize header name for storage (but preserve original)
                const normalizedKey = header.toString()
                    .trim()
                    .replace(/[^a-zA-Z0-9\s_-]/g, '') // Remove special chars except spaces, underscores, hyphens
                    .replace(/\s+/g, '_') // Replace spaces with underscores
                    .toLowerCase();
                // Store with normalized key
                excelData[normalizedKey] = row[index];
                // Also store original header name mapping
                if (!excelData.original_headers) {
                    excelData.original_headers = {};
                }
                excelData.original_headers[normalizedKey] = header;
            }
        });
        // Add mapped fields for easy access
        excelData.mapped_fields = {
            internal_id: this.getColumnValue(row, headerMap, 'internal_id'),
            po_line_id: this.getColumnValue(row, headerMap, 'po_line_id'),
            display_name: this.getColumnValue(row, headerMap, 'display_name'),
            reference_number: this.getColumnValue(row, headerMap, 'reference_number'),
            quantity: this.getColumnValue(row, headerMap, 'quantity'),
            expected_ship_date: this.getColumnValue(row, headerMap, 'expected_ship_date'),
            actual_ship_date: this.getColumnValue(row, headerMap, 'actual_ship_date'),
            sales_order_number: this.getColumnValue(row, headerMap, 'sales_order_number'),
            bag_base_pid: this.getColumnValue(row, headerMap, 'bag_base_pid'),
            po_line_tracking: this.getColumnValue(row, headerMap, 'po_line_tracking'),
            po_line_carton: this.getColumnValue(row, headerMap, 'po_line_carton'),
            order_submit_date: this.getColumnValue(row, headerMap, 'order_submit_date'),
            shopify_order_date: this.getColumnValue(row, headerMap, 'shopify_order_date'),
            cpsd: this.getColumnValue(row, headerMap, 'cpsd'),
            order_type: this.getColumnValue(row, headerMap, 'order_type'),
            po_line_invoice: this.getColumnValue(row, headerMap, 'po_line_invoice')
        };
        // Store spots separately for clarity
        excelData.spots = {};
        for (let i = 1; i <= 6; i++) {
            const spotSku = this.getColumnValue(row, headerMap, `spot${i}`);
            const spotRef = this.getColumnValue(row, headerMap, `spot${i}_ref`);
            if (spotSku || spotRef) {
                excelData.spots[`spot${i}`] = {
                    sku: spotSku,
                    patch_ref: spotRef
                };
            }
        }
        // Store Tracker columns if they exist (even though we don't use them for vocabulary)
        for (let i = 1; i <= 6; i++) {
            const trackerHeader = headers.find(h => h && h.toLowerCase().includes(`tracker`) && h.includes(`${i}`));
            if (trackerHeader) {
                const trackerIndex = headers.indexOf(trackerHeader);
                if (trackerIndex !== -1 && row[trackerIndex]) {
                    if (!excelData.tracker_customizations) {
                        excelData.tracker_customizations = {};
                    }
                    excelData.tracker_customizations[`spot${i}`] = row[trackerIndex];
                }
            }
        }
        // Count total columns captured
        excelData.total_columns = headers.length;
        excelData.non_empty_columns = Object.keys(excelData).filter(k => !['original_headers', 'mapped_fields', 'spots', 'tracker_customizations', ...Object.keys(metadata)].includes(k)).length;
        return excelData;
    }
    /**
     * Perform comprehensive auto-population after MTO upload
     */
    async performAutoPopulation(savedMTOs, factoryId) {
        try {
            logger_1.logger.info('Starting auto-population process...');
            const results = {
                inventory: { created: 0, skipped: 0 },
                barcodes: { created: 0, skipped: 0 },
                vocabulary: { created: 0, skipped: 0 }
            };
            // Auto-populate inventory
            const uniqueSKUs = new Set();
            savedMTOs.forEach(mto => {
                if (mto.spots_data && Array.isArray(mto.spots_data)) {
                    mto.spots_data.forEach((spot) => {
                        if (spot.sku)
                            uniqueSKUs.add(spot.sku);
                    });
                }
            });
            for (const sku of uniqueSKUs) {
                const { data: existing } = await this.supabase
                    .from('inventory')
                    .select('id')
                    .eq('sku', sku)
                    .single();
                if (!existing) {
                    await this.supabase
                        .from('inventory')
                        .insert({
                        sku,
                        name: `Auto-created ${sku}`,
                        category: 'patch',
                        current_stock: 1000,
                        factory_id: factoryId
                    });
                    results.inventory.created++;
                }
                else {
                    results.inventory.skipped++;
                }
            }
            // Generate barcodes for all MTOs
            for (const mto of savedMTOs) {
                await this.createMTOBarcodes(mto.id, mto);
                results.barcodes.created++;
            }
            logger_1.logger.info(`Auto-population completed: ${results.inventory.created} inventory items, ${results.barcodes.created} barcodes`);
            return results;
        }
        catch (error) {
            logger_1.logger.error('Auto-population failed:', error);
            throw error;
        }
    }
}
exports.MTOService = MTOService;
//# sourceMappingURL=mto.service.js.map