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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextGenExcelService = void 0;
const XLSX = __importStar(require("xlsx"));
const logger_1 = require("../config/logger");
/**
 * Next-Generation Excel Parser Service
 * Handles ANY Excel format with complete column detection
 */
class NextGenExcelService {
    /**
     * Parse Excel with COMPLETE column detection
     */
    async parseExcel(fileBuffer) {
        try {
            logger_1.logger.info('Starting Next-Gen Excel parsing...');
            // Read workbook with all data preserved
            const workbook = XLSX.read(fileBuffer, {
                type: 'buffer',
                cellDates: true,
                raw: false,
                dateNF: 'mm/dd/yy'
            });
            const results = {
                sheets: [],
                totalRows: 0,
                totalColumns: 0,
                headers: [],
                data: [],
                columnMapping: {},
                errors: []
            };
            // Process each sheet
            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                // Get ALL data including all columns
                const fullData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    raw: false
                });
                if (fullData.length === 0)
                    continue;
                // Find header row (scan first 10 rows)
                const headerInfo = this.findHeaderRow(fullData);
                const headers = fullData[headerInfo.rowIndex];
                logger_1.logger.info(`Found ${headers.length} columns in sheet ${sheetName}`);
                logger_1.logger.info('Headers found:', headers);
                // Create comprehensive column mapping
                const columnMap = this.createComprehensiveMapping(headers);
                // Parse data rows
                const dataRows = fullData.slice(headerInfo.rowIndex + 1);
                const parsedMTOs = [];
                for (let i = 0; i < dataRows.length; i++) {
                    const row = dataRows[i];
                    if (this.isEmptyRow(row))
                        continue;
                    try {
                        const mto = this.parseRow(row, headers, columnMap, i);
                        parsedMTOs.push(mto);
                    }
                    catch (error) {
                        results.errors.push({
                            row: i + headerInfo.rowIndex + 2,
                            error: error.message
                        });
                    }
                }
                results.sheets.push({
                    name: sheetName,
                    headers: headers,
                    headerRow: headerInfo.rowIndex,
                    dataRows: parsedMTOs.length,
                    totalColumns: headers.length
                });
                results.totalRows += parsedMTOs.length;
                results.totalColumns = Math.max(results.totalColumns, headers.length);
                results.headers = headers;
                results.data.push(...parsedMTOs);
                results.columnMapping = columnMap;
            }
            logger_1.logger.info(`Parsed ${results.totalRows} rows with ${results.totalColumns} columns`);
            return results;
        }
        catch (error) {
            logger_1.logger.error('Next-Gen Excel parsing failed:', error);
            throw error;
        }
    }
    /**
     * Find the actual header row by analyzing patterns
     */
    findHeaderRow(data) {
        let bestRow = 0;
        let bestScore = 0;
        // Check first 10 rows for headers
        for (let i = 0; i < Math.min(10, data.length); i++) {
            const row = data[i];
            if (!row || row.length === 0)
                continue;
            let score = 0;
            // Count text cells
            const textCells = row.filter(cell => cell && typeof cell === 'string' && cell.trim() !== '').length;
            // High text ratio = likely header
            if (textCells > row.length * 0.5) {
                score += textCells;
            }
            // Check for known header keywords
            const headerKeywords = [
                'internal id', 'po line', 'display name', 'reference',
                'quantity', 'expected', 'actual', 'spot', 'tracking',
                'order', 'date', 'sales', 'cpsd', 'bag base'
            ];
            row.forEach(cell => {
                if (cell && typeof cell === 'string') {
                    const cellLower = cell.toLowerCase();
                    headerKeywords.forEach(keyword => {
                        if (cellLower.includes(keyword)) {
                            score += 2;
                        }
                    });
                }
            });
            if (score > bestScore) {
                bestScore = score;
                bestRow = i;
            }
        }
        logger_1.logger.info(`Header row detected at index ${bestRow} with confidence ${bestScore}`);
        return { rowIndex: bestRow, confidence: bestScore };
    }
    /**
     * Create COMPREHENSIVE column mapping for ALL columns
     */
    createComprehensiveMapping(headers) {
        const mapping = {};
        headers.forEach((header, index) => {
            if (!header)
                return;
            const normalized = header.toString().toLowerCase().trim();
            // EXACT matches for your columns
            const exactMappings = {
                'internal id': 'internal_id',
                'po line id': 'po_line_id',
                'display name': 'display_name',
                'reference #': 'reference_number',
                'quantity': 'quantity',
                'expected ship date': 'expected_ship_date',
                'actual ship date': 'actual_ship_date',
                'po line tracking #': 'po_line_tracking',
                'po line carton #': 'po_line_carton',
                'po line invoice #': 'po_line_invoice',
                'order submit date': 'order_submit_date',
                'so date': 'so_date',
                'shopify order date/time': 'shopify_order_date',
                'sales order #': 'sales_order_number',
                'cpsd': 'cpsd',
                'bag base pid': 'bag_base_pid',
                'order type': 'order_type',
                'awb': 'awb',
                'master carton': 'master_carton',
                'vendor po status': 'vendor_po_status',
                'vendor po comments': 'vendor_po_comments',
                'production po comments': 'production_po_comments',
                // Spot columns
                'spot 1': 'spot1',
                'spot 2': 'spot2',
                'spot 3': 'spot3',
                'spot 4': 'spot4',
                'spot 5': 'spot5',
                'spot 6': 'spot6',
                // Spot patch references
                'spot 1 - patch ref': 'spot1_patch_ref',
                'spot 2 - patch ref': 'spot2_patch_ref',
                'spot 3 - patch ref': 'spot3_patch_ref',
                'spot 4 - patch ref': 'spot4_patch_ref',
                'spot 5 - patch ref': 'spot5_patch_ref',
                'spot 6 - patch ref': 'spot6_patch_ref',
                // Replacement columns
                'mto vendor replacement expected ship date': 'replacement_expected_ship_date',
                'mto vendor replacement actual ship date': 'replacement_actual_ship_date',
                'po line mto replacement tracking #': 'replacement_tracking'
            };
            // Try exact match
            if (exactMappings[normalized]) {
                mapping[exactMappings[normalized]] = index;
                logger_1.logger.info(`Mapped column "${header}" at index ${index} to "${exactMappings[normalized]}"`);
            }
            else {
                // Store unmapped columns too
                const cleanKey = normalized.replace(/[^a-z0-9]/g, '_');
                mapping[`custom_${cleanKey}`] = index;
            }
        });
        // Log what we found
        const found = Object.keys(mapping).filter(k => !k.startsWith('custom_'));
        logger_1.logger.info(`Mapped ${found.length} known columns out of ${headers.length} total`);
        logger_1.logger.info('Found columns:', found);
        return mapping;
    }
    /**
     * Parse a single row with ALL data preserved
     */
    parseRow(row, headers, columnMap, rowIndex) {
        const mto = {
            _rowIndex: rowIndex,
            _rawData: {},
            spots_data: []
        };
        // Store ALL columns
        headers.forEach((header, index) => {
            if (header && row[index] !== undefined && row[index] !== '') {
                const key = header.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
                mto._rawData[key] = row[index];
            }
        });
        // Map known fields
        mto.internal_id = this.getValue(row, columnMap, 'internal_id') || `AUTO-${rowIndex}`;
        mto.po_line_id = this.getValue(row, columnMap, 'po_line_id');
        // DISPLAY NAME with multiple fallbacks
        mto.display_name = this.getValue(row, columnMap, 'display_name') ||
            this.getValue(row, columnMap, 'reference_number') ||
            this.getValue(row, columnMap, 'bag_base_pid') ||
            this.getValue(row, columnMap, 'sales_order_number') ||
            `MTO-${mto.internal_id}`;
        mto.reference_number = this.getValue(row, columnMap, 'reference_number');
        mto.quantity = parseInt(this.getValue(row, columnMap, 'quantity')) || 1;
        mto.expected_ship_date = this.getValue(row, columnMap, 'expected_ship_date');
        mto.actual_ship_date = this.getValue(row, columnMap, 'actual_ship_date');
        mto.bag_base_pid = this.getValue(row, columnMap, 'bag_base_pid');
        mto.sales_order_number = this.getValue(row, columnMap, 'sales_order_number');
        // Extract spots
        for (let i = 1; i <= 6; i++) {
            const sku = this.getValue(row, columnMap, `spot${i}`);
            const patchRef = this.getValue(row, columnMap, `spot${i}_patch_ref`);
            if (sku) {
                mto.spots_data.push({
                    position: i,
                    sku: sku,
                    patch_ref: patchRef,
                    description: patchRef || `Spot ${i}: ${sku}`
                });
            }
        }
        // Store all other fields
        mto.po_line_tracking = this.getValue(row, columnMap, 'po_line_tracking');
        mto.awb = this.getValue(row, columnMap, 'awb');
        mto.master_carton = this.getValue(row, columnMap, 'master_carton');
        mto.vendor_po_status = this.getValue(row, columnMap, 'vendor_po_status');
        mto.order_submit_date = this.getValue(row, columnMap, 'order_submit_date');
        mto.shopify_order_date = this.getValue(row, columnMap, 'shopify_order_date');
        mto.cpsd = this.getValue(row, columnMap, 'cpsd');
        mto.order_type = this.getValue(row, columnMap, 'order_type');
        return mto;
    }
    /**
     * Get value from row using column mapping
     */
    getValue(row, columnMap, field) {
        const index = columnMap[field];
        if (index === undefined || index === -1)
            return null;
        const value = row[index];
        if (value === undefined || value === null || value === '')
            return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        }
        return value;
    }
    /**
     * Check if row is empty
     */
    isEmptyRow(row) {
        if (!row || row.length === 0)
            return true;
        return row.every(cell => cell === null || cell === undefined || cell === '');
    }
    /**
     * Generate preview with ALL columns shown
     */
    async generatePreview(fileBuffer, limit = 10) {
        const parsed = await this.parseExcel(fileBuffer);
        return {
            totalRows: parsed.totalRows,
            totalColumns: parsed.totalColumns,
            headers: parsed.headers, // ALL headers
            columnMapping: parsed.columnMapping,
            validMTOs: parsed.data.filter(m => m.display_name).length,
            totalSpots: parsed.data.reduce((sum, m) => sum + (m.spots_data?.length || 0), 0),
            totalQuantity: parsed.data.reduce((sum, m) => sum + (m.quantity || 0), 0),
            errors: parsed.errors.length,
            dataPreview: parsed.data.slice(0, limit).map(mto => ({
                ...mto._rawData, // Show ALL original columns
                _parsed: {
                    internal_id: mto.internal_id,
                    display_name: mto.display_name,
                    spots: mto.spots_data.length
                }
            })),
            validationIssues: parsed.errors.slice(0, 10)
        };
    }
}
exports.NextGenExcelService = NextGenExcelService;
exports.default = new NextGenExcelService();
//# sourceMappingURL=next-gen-excel.service.js.map