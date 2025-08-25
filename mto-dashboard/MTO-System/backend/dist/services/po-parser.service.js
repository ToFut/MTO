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
exports.POParserService = void 0;
const XLSX = __importStar(require("xlsx"));
const logger_1 = require("../config/logger");
class POParserService {
    /**
     * Parse Bauble Bar PO format
     */
    async parseBaublePO(fileBuffer) {
        try {
            logger_1.logger.info('Parsing Bauble Bar PO format...');
            const workbook = XLSX.read(fileBuffer, {
                type: 'buffer',
                cellDates: true,
                raw: false,
                cellText: true
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Convert to 2D array
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: '',
                blankrows: false
            });
            // Parse PO header information
            const poData = this.extractPOHeader(rawData);
            // Parse line items
            poData.lineItems = this.extractLineItems(rawData);
            // Parse MTO data if present
            poData.mtoData = this.extractMTOData(rawData);
            logger_1.logger.info(`Parsed PO ${poData.poNumber} with ${poData.lineItems.length} line items`);
            return poData;
        }
        catch (error) {
            logger_1.logger.error('Failed to parse Bauble PO:', error);
            throw new Error(`PO parsing failed: ${error.message}`);
        }
    }
    /**
     * Extract PO header information
     */
    extractPOHeader(rawData) {
        const poData = {};
        // Find PO number and date
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i];
            if (!row)
                continue;
            // Look for PO number pattern
            const poMatch = row.join(' ').match(/#?(PO\d+)/i);
            if (poMatch) {
                poData.poNumber = poMatch[1];
                // Date is usually next to PO number
                const dateStr = row.find(cell => /\d{1,2}\/\d{1,2}\/\d{4}/.test(cell));
                if (dateStr) {
                    poData.orderDate = new Date(dateStr);
                }
            }
            // Look for customer
            if (row.some(cell => cell?.toString().toLowerCase().includes('customer'))) {
                const customerIndex = row.findIndex(cell => cell?.toString().toLowerCase().includes('customer'));
                if (row[customerIndex + 1]) {
                    poData.customer = row[customerIndex + 1];
                }
            }
            // Look for totals
            if (row.some(cell => cell?.toString().toLowerCase().includes('total'))) {
                const totalMatch = row.join(' ').match(/\$?([\d,]+\.?\d*)/);
                if (totalMatch) {
                    poData.totalAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
                }
            }
            // Look for total quantity
            if (row.some(cell => cell?.toString().toLowerCase().includes('total qty'))) {
                const qtyMatch = row.join(' ').match(/(\d+)/);
                if (qtyMatch) {
                    poData.totalQty = parseInt(qtyMatch[1]);
                }
            }
            // Look for requested ship date
            if (row.some(cell => cell?.toString().toLowerCase().includes('requested ship'))) {
                const dateMatch = row.join(' ').match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
                if (dateMatch) {
                    poData.requestedShipDate = new Date(dateMatch[1]);
                }
            }
        }
        // Extract vendor info
        poData.vendorInfo = this.extractVendorInfo(rawData);
        // Extract ship to info
        poData.shipToInfo = this.extractShipToInfo(rawData);
        return poData;
    }
    /**
     * Extract vendor information
     */
    extractVendorInfo(rawData) {
        const vendorInfo = { name: '', address: '' };
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row.some(cell => cell?.toString().toLowerCase().includes('vendor'))) {
                // Next few rows likely contain vendor details
                for (let j = i + 1; j < Math.min(i + 5, rawData.length); j++) {
                    const vendorRow = rawData[j];
                    if (vendorRow && vendorRow.some(cell => cell && cell.toString().trim())) {
                        if (!vendorInfo.name) {
                            vendorInfo.name = vendorRow.find(cell => cell && cell.toString().trim());
                        }
                        else {
                            vendorInfo.address += vendorRow.filter(cell => cell).join(' ') + ' ';
                        }
                    }
                }
                break;
            }
        }
        return vendorInfo;
    }
    /**
     * Extract ship to information
     */
    extractShipToInfo(rawData) {
        const shipInfo = { name: '', address: '' };
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row.some(cell => cell?.toString().toLowerCase().includes('ship') &&
                (cell?.toString().toLowerCase().includes('to') ||
                    cell?.toString().toLowerCase().includes('bulk')))) {
                // Next few rows likely contain shipping details
                for (let j = i + 1; j < Math.min(i + 5, rawData.length); j++) {
                    const shipRow = rawData[j];
                    if (shipRow && shipRow.some(cell => cell && cell.toString().trim())) {
                        if (!shipInfo.name) {
                            shipInfo.name = shipRow.find(cell => cell && cell.toString().trim());
                        }
                        else {
                            shipInfo.address += shipRow.filter(cell => cell).join(' ') + ' ';
                        }
                    }
                }
                break;
            }
        }
        return shipInfo;
    }
    /**
     * Extract line items from PO
     */
    extractLineItems(rawData) {
        const lineItems = [];
        // Find header row for items
        let headerRowIndex = -1;
        let headers = [];
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row.some(cell => cell?.toString().toLowerCase().includes('item')) &&
                row.some(cell => cell?.toString().toLowerCase().includes('pid')) &&
                row.some(cell => cell?.toString().toLowerCase().includes('qty'))) {
                headerRowIndex = i;
                headers = row.map(h => h?.toString().toLowerCase().trim() || '');
                break;
            }
        }
        if (headerRowIndex === -1) {
            logger_1.logger.warn('Could not find item headers in PO');
            return lineItems;
        }
        // Parse each line item
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            // Stop if we hit another section or empty rows
            if (!row || row.every(cell => !cell) ||
                row.some(cell => cell?.toString().toLowerCase().includes('total'))) {
                break;
            }
            const lineItem = this.parseLineItem(row, headers);
            if (lineItem) {
                lineItems.push(lineItem);
            }
        }
        return lineItems;
    }
    /**
     * Parse individual line item
     */
    parseLineItem(row, headers) {
        try {
            const lineItem = {};
            // Map based on header positions
            headers.forEach((header, index) => {
                const value = row[index];
                if (!value)
                    return;
                if (header.includes('item')) {
                    lineItem.itemNumber = value.toString();
                }
                else if (header.includes('pid')) {
                    lineItem.pid = value.toString();
                }
                else if (header.includes('design')) {
                    lineItem.design = value.toString();
                }
                else if (header.includes('factory')) {
                    lineItem.factory = value.toString();
                }
                else if (header.includes('customiz')) {
                    lineItem.customization = value.toString();
                }
                else if (header.includes('qty')) {
                    lineItem.qty = parseInt(value) || 0;
                }
                else if (header.includes('hts')) {
                    lineItem.htsCode = value.toString();
                }
                else if (header.includes('pkg') && header.includes('code')) {
                    lineItem.pkgCode = value.toString();
                }
                else if (header.includes('fob') && header.includes('cost')) {
                    lineItem.fobCost = parseFloat(value.toString().replace(/[$,]/g, '')) || 0;
                }
                else if (header.includes('ext') && header.includes('fob')) {
                    lineItem.extFob = parseFloat(value.toString().replace(/[$,]/g, '')) || 0;
                }
            });
            // Validate minimum required fields
            if (lineItem.pid && lineItem.qty) {
                return lineItem;
            }
            return null;
        }
        catch (error) {
            logger_1.logger.warn('Failed to parse line item:', error);
            return null;
        }
    }
    /**
     * Extract MTO data section if present
     */
    extractMTOData(rawData) {
        const mtoData = [];
        // Look for MTO section marker
        let mtoStartIndex = -1;
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row.some(cell => cell?.toString().includes('MTO') ||
                cell?.toString().includes('Internal ID'))) {
                mtoStartIndex = i;
                break;
            }
        }
        if (mtoStartIndex === -1) {
            logger_1.logger.info('No MTO section found in PO');
            return mtoData;
        }
        // Parse MTO data
        const mtoHeaders = rawData[mtoStartIndex];
        for (let i = mtoStartIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.every(cell => !cell))
                break;
            const mtoItem = {};
            mtoHeaders.forEach((header, index) => {
                if (header && row[index]) {
                    const key = header.toString().toLowerCase().replace(/\s+/g, '_');
                    mtoItem[key] = row[index];
                }
            });
            if (Object.keys(mtoItem).length > 0) {
                mtoData.push(mtoItem);
            }
        }
        return mtoData;
    }
    /**
     * Convert PO line items to MTO format
     */
    convertPOToMTOs(poData, brandId, factoryId) {
        const mtos = [];
        poData.lineItems.forEach((item, index) => {
            // Create MTO for each line item
            const mto = {
                internal_id: `${poData.poNumber}-${item.itemNumber || index + 1}`,
                po_line_id: item.itemNumber || `LINE-${index + 1}`,
                display_name: item.design || `${item.customization} - ${item.pid}`,
                reference_number: item.pid,
                quantity: item.qty,
                bag_base_pid: item.pid,
                // Parse customization to spots
                spots: this.parseCustomizationToSpots(item.customization),
                // Dates
                expected_ship_date: poData.requestedShipDate,
                order_submit_date: poData.orderDate,
                // Metadata
                brand_id: brandId,
                factory_id: factoryId,
                production_category: this.determineCategory(poData.requestedShipDate),
                priority: this.determinePriority(poData.requestedShipDate),
                status: 'pending',
                production_stage: 'receive',
                // Additional PO data
                po_customer: poData.customer,
                hts_code: item.htsCode,
                packaging_code: item.pkgCode,
                fob_cost: item.fobCost,
                ext_fob: item.extFob
            };
            mtos.push(mto);
        });
        // If MTO data section exists, merge it
        if (poData.mtoData && poData.mtoData.length > 0) {
            mtos.forEach((mto, index) => {
                if (poData.mtoData[index]) {
                    Object.assign(mto, this.normalizeMTOData(poData.mtoData[index]));
                }
            });
        }
        return mtos;
    }
    /**
     * Parse customization text to spot data
     */
    parseCustomizationToSpots(customization) {
        const spots = [];
        if (!customization)
            return spots;
        // Parse patterns like "1-3 Custom Icon"
        const match = customization.match(/(\d+)-(\d+)\s*(.*)/);
        if (match) {
            const spotNum = parseInt(match[1]);
            const customType = match[3] || 'Custom';
            spots.push({
                position: spotNum,
                sku: `CUSTOM-${spotNum}`,
                patch_ref: customType,
                description: customization
            });
        }
        return spots;
    }
    /**
     * Normalize MTO data field names
     */
    normalizeMTOData(mtoItem) {
        const normalized = {};
        Object.entries(mtoItem).forEach(([key, value]) => {
            const normalizedKey = key
                .replace(/\s+/g, '_')
                .toLowerCase()
                .replace(/^mto_/, '');
            normalized[normalizedKey] = value;
        });
        return normalized;
    }
    /**
     * Determine production category based on ship date
     */
    determineCategory(shipDate) {
        if (!shipDate)
            return 'monthly';
        const daysUntilShip = Math.ceil((shipDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilShip <= 7 ? 'daily' : 'monthly';
    }
    /**
     * Determine priority based on ship date
     */
    determinePriority(shipDate) {
        if (!shipDate)
            return 'normal';
        const daysUntilShip = Math.ceil((shipDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
}
exports.POParserService = POParserService;
//# sourceMappingURL=po-parser.service.js.map