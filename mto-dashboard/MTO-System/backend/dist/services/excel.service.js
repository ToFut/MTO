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
exports.ExcelService = void 0;
const XLSX = __importStar(require("xlsx"));
const logger_1 = require("../config/logger");
/**
 * Smart Excel Analysis Service
 * Intelligently analyzes Excel files to detect MTO structure and extract data
 */
class ExcelService {
    /**
     * Phase 1: Analyze Excel structure and detect patterns
     */
    async analyzeExcelStructure(fileBuffer) {
        try {
            logger_1.logger.info('Starting smart Excel structure analysis...');
            // Read the workbook
            const workbook = XLSX.read(fileBuffer, {
                type: 'buffer',
                cellDates: true,
                dateNF: 'yyyy-mm-dd'
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Convert to 2D array for analysis
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: null,
                raw: false
            });
            // Analyze structure
            const analysis = this.performStructuralAnalysis(rawData);
            logger_1.logger.info(`Excel analysis complete: ${analysis.totalRows} rows, ${analysis.detectedSpots} spots detected`);
            return analysis;
        }
        catch (error) {
            logger_1.logger.error('Excel analysis failed:', error);
            throw new Error(`Excel analysis failed: ${error.message}`);
        }
    }
    /**
     * Phase 2: Extract MTOs from analyzed Excel structure
     */
    async extractMTOsFromExcel(analysisResult, fileBuffer) {
        try {
            if (!fileBuffer) {
                throw new Error('File buffer required for MTO extraction');
            }
            logger_1.logger.info('Starting MTO extraction from Excel...');
            // Re-read workbook with optimized settings
            const workbook = XLSX.read(fileBuffer, {
                type: 'buffer',
                cellDates: true,
                cellText: false
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Convert to structured data based on analysis
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: null
            });
            // Extract MTOs using smart mapping
            const mtos = this.extractMTOsFromRows(rawData, analysisResult);
            logger_1.logger.info(`Extracted ${mtos.length} MTOs from Excel`);
            return mtos;
        }
        catch (error) {
            logger_1.logger.error('MTO extraction failed:', error);
            throw new Error(`MTO extraction failed: ${error.message}`);
        }
    }
    /**
     * Smart structural analysis of Excel data
     */
    performStructuralAnalysis(rawData) {
        if (!rawData || rawData.length === 0) {
            throw new Error('Empty Excel file');
        }
        // Detect if first row is header
        const hasHeaders = this.detectHeaders(rawData);
        const dataStartRow = hasHeaders ? 1 : 0;
        const totalRows = rawData.length - dataStartRow;
        // Analyze first few data rows to understand structure
        const sampleRows = rawData.slice(dataStartRow, Math.min(dataStartRow + 10, rawData.length));
        // Detect column patterns
        const columnMapping = this.detectColumnPatterns(rawData[0], hasHeaders);
        // Detect spots dynamically
        const spotAnalysis = this.detectSpots(sampleRows, columnMapping);
        // Calculate quality score
        const qualityScore = this.calculateQualityScore(columnMapping, spotAnalysis, totalRows);
        return {
            totalRows,
            detectedSpots: spotAnalysis.detectedSpots,
            columnMapping,
            spotColumns: spotAnalysis.spotColumns,
            hasHeaders,
            suggestedMapping: this.suggestOptimalMapping(columnMapping, spotAnalysis),
            qualityScore
        };
    }
    /**
     * Detect if first row contains headers
     */
    detectHeaders(rawData) {
        if (!rawData[0] || !rawData[1])
            return false;
        const firstRow = rawData[0];
        const secondRow = rawData[1];
        // Check for header indicators
        let headerScore = 0;
        for (let i = 0; i < Math.min(firstRow.length, 10); i++) {
            const first = firstRow[i];
            const second = secondRow[i];
            if (first && typeof first === 'string') {
                // Common header patterns
                if (first.toLowerCase().includes('id') ||
                    first.toLowerCase().includes('name') ||
                    first.toLowerCase().includes('ref') ||
                    first.toLowerCase().includes('sku') ||
                    first.toLowerCase().includes('spot')) {
                    headerScore += 2;
                }
                // Text in first row, number/date in second
                if (second && (typeof second === 'number' || second instanceof Date)) {
                    headerScore += 1;
                }
            }
        }
        return headerScore >= 3;
    }
    /**
     * Smart column pattern detection
     */
    detectColumnPatterns(headerRow, hasHeaders) {
        const mapping = {};
        if (!headerRow)
            return mapping;
        for (let i = 0; i < headerRow.length; i++) {
            const header = hasHeaders ? headerRow[i] : `Column_${i}`;
            if (!header)
                continue;
            const headerStr = header.toString().toLowerCase().trim();
            // Core field mapping with fuzzy matching
            if (this.matchesPattern(headerStr, ['internal', 'id', 'mto_id', 'line_id'])) {
                mapping[`col_${i}`] = 'internal_id';
            }
            else if (this.matchesPattern(headerStr, ['po_line', 'line', 'po line id'])) {
                mapping[`col_${i}`] = 'po_line_id';
            }
            else if (this.matchesPattern(headerStr, ['ship', 'expected', 'ship_date'])) {
                mapping[`col_${i}`] = 'expected_ship_date';
            }
            else if (this.matchesPattern(headerStr, ['actual', 'shipped', 'actual_ship'])) {
                mapping[`col_${i}`] = 'actual_ship_date';
            }
            else if (this.matchesPattern(headerStr, ['display', 'product', 'name', 'title'])) {
                mapping[`col_${i}`] = 'display_name';
            }
            else if (this.matchesPattern(headerStr, ['reference', 'ref', 'ref_num', 'reference_number'])) {
                mapping[`col_${i}`] = 'reference_number';
            }
            else if (this.matchesPattern(headerStr, ['quantity', 'qty', 'amount'])) {
                mapping[`col_${i}`] = 'quantity';
            }
            else if (this.matchesPattern(headerStr, ['base', 'bag', 'product_id', 'base_pid'])) {
                mapping[`col_${i}`] = 'bag_base_pid';
            }
            else if (this.matchesPattern(headerStr, ['awb', 'tracking', 'waybill'])) {
                mapping[`col_${i}`] = 'awb';
            }
            else if (this.matchesPattern(headerStr, ['master', 'carton', 'master_carton'])) {
                mapping[`col_${i}`] = 'master_carton';
            }
            else if (headerStr.includes('spot') || headerStr.match(/\d+/) ||
                this.matchesPattern(headerStr, ['sku', 'patch', 'icon', 'design'])) {
                // This might be a spot column - analyze further
                mapping[`col_${i}`] = 'spot_candidate';
            }
        }
        return mapping;
    }
    /**
     * Smart spot detection with flexible positioning
     */
    detectSpots(sampleRows, columnMapping) {
        const spotColumns = [];
        // Find potential spot columns
        const spotCandidates = [];
        Object.entries(columnMapping).forEach(([colKey, mapping]) => {
            if (mapping === 'spot_candidate') {
                const colIndex = parseInt(colKey.replace('col_', ''));
                spotCandidates.push(colIndex);
            }
        });
        // If no obvious spot candidates, analyze data patterns
        if (spotCandidates.length === 0) {
            spotCandidates.push(...this.findSpotsByDataPattern(sampleRows));
        }
        // Group consecutive columns as spot pairs (SKU + Reference)
        let position = 1;
        for (let i = 0; i < spotCandidates.length; i++) {
            const currentCol = spotCandidates[i];
            const nextCol = spotCandidates[i + 1];
            // Check if this column contains SKU-like data
            const hasSpotData = sampleRows.some(row => row[currentCol] && this.looksLikeSKU(row[currentCol]));
            if (hasSpotData) {
                const spotColumn = {
                    position: position++,
                    skuColumn: `col_${currentCol}`
                };
                // Check if next column is reference/patch description
                if (nextCol && nextCol === currentCol + 1) {
                    const hasRefData = sampleRows.some(row => row[nextCol] && this.looksLikePatchRef(row[nextCol]));
                    if (hasRefData) {
                        spotColumn.refColumn = `col_${nextCol}`;
                        i++; // Skip next column as it's the reference
                    }
                }
                spotColumns.push(spotColumn);
            }
        }
        return {
            detectedSpots: spotColumns.length,
            spotColumns
        };
    }
    /**
     * Find spots by analyzing data patterns when headers don't help
     */
    findSpotsByDataPattern(sampleRows) {
        const candidates = [];
        if (!sampleRows.length)
            return candidates;
        const maxCols = Math.max(...sampleRows.map(row => row.length));
        for (let col = 0; col < maxCols; col++) {
            let skuCount = 0;
            let totalValues = 0;
            for (const row of sampleRows) {
                if (row[col] != null) {
                    totalValues++;
                    if (this.looksLikeSKU(row[col])) {
                        skuCount++;
                    }
                }
            }
            // If >50% of values look like SKUs, it's probably a spot column
            if (totalValues > 0 && (skuCount / totalValues) > 0.5) {
                candidates.push(col);
            }
        }
        return candidates;
    }
    /**
     * Check if a value looks like a SKU
     */
    looksLikeSKU(value) {
        if (!value)
            return false;
        const str = value.toString().trim();
        // SKU patterns: numbers, short alphanumeric codes
        return (/^\d{4,8}$/.test(str) || // 4-8 digit numbers (common for SKUs)
            /^[A-Z0-9]{3,12}$/.test(str) || // Alphanumeric codes
            /^[a-z0-9]{3,12}$/i.test(str) // Case insensitive alphanumeric
        );
    }
    /**
     * Check if a value looks like a patch reference
     */
    looksLikePatchRef(value) {
        if (!value)
            return false;
        const str = value.toString().trim().toLowerCase();
        // Patch reference patterns
        return (str.includes('icon') ||
            str.includes('letter') ||
            str.includes('patch') ||
            str.includes('design') ||
            /\d+\s+\w+/.test(str) || // "63 Camera Icon" pattern
            str.split(' ').length > 1 // Multi-word descriptions
        );
    }
    /**
     * Pattern matching helper
     */
    matchesPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern) ||
            text.replace(/[_\s-]/g, '').includes(pattern.replace(/[_\s-]/g, '')));
    }
    /**
     * Extract MTOs from rows using detected structure
     */
    extractMTOsFromRows(rawData, analysis) {
        const mtos = [];
        const startRow = analysis.hasHeaders ? 1 : 0;
        for (let rowIndex = startRow; rowIndex < rawData.length; rowIndex++) {
            const row = rawData[rowIndex];
            if (!row || !this.isValidDataRow(row))
                continue;
            try {
                const mto = this.extractMTOFromRow(row, analysis, rowIndex);
                if (mto) {
                    mtos.push(mto);
                }
            }
            catch (error) {
                logger_1.logger.warn(`Failed to extract MTO from row ${rowIndex + 1}:`, error);
            }
        }
        return mtos;
    }
    /**
     * Extract single MTO from row
     */
    extractMTOFromRow(row, analysis, rowIndex) {
        // Extract core fields
        const mto = {
            originalRowIndex: rowIndex,
            confidence: 0.8 // Base confidence
        };
        // Map standard columns
        Object.entries(analysis.columnMapping).forEach(([colKey, fieldName]) => {
            const colIndex = parseInt(colKey.replace('col_', ''));
            const value = row[colIndex];
            if (value != null && fieldName !== 'spot_candidate') {
                if (fieldName.includes('date')) {
                    mto[fieldName] = this.parseDate(value);
                }
                else if (fieldName === 'quantity') {
                    mto[fieldName] = parseInt(value) || 1;
                }
                else {
                    mto[fieldName] = value.toString().trim();
                }
            }
        });
        // Extract spots using detected spot columns
        mto.spots = [];
        analysis.spotColumns.forEach(spotCol => {
            const skuColIndex = parseInt(spotCol.skuColumn.replace('col_', ''));
            const refColIndex = spotCol.refColumn ? parseInt(spotCol.refColumn.replace('col_', '')) : null;
            const sku = row[skuColIndex];
            if (sku) {
                const spot = {
                    position: spotCol.position,
                    sku: sku.toString().trim()
                };
                if (refColIndex && row[refColIndex]) {
                    spot.patch_ref = row[refColIndex].toString().trim();
                }
                mto.spots.push(spot);
            }
        });
        // Validate required fields
        if (!mto.internal_id && !mto.reference_number) {
            // Try to generate from available data
            mto.internal_id = mto.po_line_id || `ROW_${rowIndex}`;
        }
        if (!mto.display_name && mto.spots.length > 0) {
            mto.display_name = `Custom Product - ${mto.spots.length} spots`;
        }
        // Set defaults
        mto.quantity = mto.quantity || 1;
        mto.reference_number = mto.reference_number || mto.internal_id || `REF_${rowIndex}`;
        mto.display_name = mto.display_name || 'Unknown Product';
        return mto;
    }
    /**
     * Check if row contains valid data
     */
    isValidDataRow(row) {
        // Row is valid if it has at least one non-empty value
        return row.some(cell => cell != null && cell.toString().trim() !== '');
    }
    /**
     * Smart date parsing
     */
    parseDate(value) {
        if (!value)
            return null;
        if (value instanceof Date)
            return value;
        if (typeof value === 'number') {
            // Excel date serial number
            const excelEpoch = new Date(1900, 0, 1);
            const msPerDay = 24 * 60 * 60 * 1000;
            return new Date(excelEpoch.getTime() + (value - 2) * msPerDay);
        }
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }
    /**
     * Calculate quality score for the analysis
     */
    calculateQualityScore(columnMapping, spotAnalysis, totalRows) {
        let score = 0;
        // Core fields present
        const coreFields = ['internal_id', 'reference_number', 'display_name'];
        coreFields.forEach(field => {
            if (Object.values(columnMapping).includes(field)) {
                score += 20;
            }
        });
        // Spots detected
        if (spotAnalysis.detectedSpots > 0) {
            score += Math.min(spotAnalysis.detectedSpots * 5, 30);
        }
        // Sufficient data rows
        if (totalRows >= 10)
            score += 10;
        else if (totalRows >= 1)
            score += 5;
        return Math.min(score, 100);
    }
    /**
     * Suggest optimal column mapping
     */
    suggestOptimalMapping(columnMapping, spotAnalysis) {
        const suggested = { ...columnMapping };
        // Add spot column suggestions
        spotAnalysis.spotColumns.forEach((spotCol, index) => {
            suggested[spotCol.skuColumn] = `spot${spotCol.position}_sku`;
            if (spotCol.refColumn) {
                suggested[spotCol.refColumn] = `spot${spotCol.position}_ref`;
            }
        });
        return suggested;
    }
    /**
     * Validate Excel file before processing
     */
    async validateExcelFile(fileBuffer) {
        const errors = [];
        const warnings = [];
        try {
            // Try to read the file
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                errors.push('No worksheets found in Excel file');
            }
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (data.length === 0) {
                errors.push('Excel file is empty');
            }
            else if (data.length === 1) {
                warnings.push('Only one row found - make sure file contains data rows');
            }
            else if (data.length > 10000) {
                warnings.push('Large file detected - processing may take longer');
            }
            // Check for minimum required data
            const sampleRow = data[1] || data[0]; // Skip potential header
            if (!sampleRow || sampleRow.length < 3) {
                errors.push('Insufficient columns found - need at least 3 columns for basic MTO data');
            }
        }
        catch (error) {
            errors.push(`Unable to read Excel file: ${error.message}`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.ExcelService = ExcelService;
//# sourceMappingURL=excel.service.js.map