export interface POLineItem {
    itemNumber: string;
    pid: string;
    design: string;
    factory: string;
    customization: string;
    qty: number;
    htsCode: string;
    pkgCode: string;
    pkgCost: number;
    firstCost: number;
    fobCost: number;
    extFob: number;
}
export interface BaublePOData {
    poNumber: string;
    orderDate: Date;
    customer: string;
    totalAmount: number;
    totalQty: number;
    requestedShipDate: Date;
    vendorInfo: {
        name: string;
        address: string;
    };
    shipToInfo: {
        name: string;
        address: string;
    };
    lineItems: POLineItem[];
    mtoData?: any[];
}
export declare class POParserService {
    /**
     * Parse Bauble Bar PO format
     */
    parseBaublePO(fileBuffer: Buffer): Promise<BaublePOData>;
    /**
     * Extract PO header information
     */
    private extractPOHeader;
    /**
     * Extract vendor information
     */
    private extractVendorInfo;
    /**
     * Extract ship to information
     */
    private extractShipToInfo;
    /**
     * Extract line items from PO
     */
    private extractLineItems;
    /**
     * Parse individual line item
     */
    private parseLineItem;
    /**
     * Extract MTO data section if present
     */
    private extractMTOData;
    /**
     * Convert PO line items to MTO format
     */
    convertPOToMTOs(poData: BaublePOData, brandId: string, factoryId: string): any[];
    /**
     * Parse customization text to spot data
     */
    private parseCustomizationToSpots;
    /**
     * Normalize MTO data field names
     */
    private normalizeMTOData;
    /**
     * Determine production category based on ship date
     */
    private determineCategory;
    /**
     * Determine priority based on ship date
     */
    private determinePriority;
}
//# sourceMappingURL=po-parser.service.d.ts.map