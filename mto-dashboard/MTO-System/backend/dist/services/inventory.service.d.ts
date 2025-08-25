export declare class InventoryService {
    private supabase;
    getInventoryItems(filters: any): Promise<{
        data: any[];
        total: number;
    }>;
    getInventoryItemById(id: string): Promise<any>;
    createInventoryItem(itemData: any): Promise<any>;
    updateInventoryItem(id: string, updates: any): Promise<any>;
    updateStock(id: string, quantity: number, operation: string, userId: string): Promise<any>;
    deleteInventoryItem(id: string): Promise<boolean>;
    getShortageAlerts(filters: any): Promise<any[]>;
    /**
     * Smart auto-populate inventory from MTOs with intelligent analysis
     */
    autoPopulateFromMTOs(mtos: any[], brandId: string, factoryId: string): Promise<any>;
    allocateToMTO(inventoryId: string, mtoId: string, quantity: number, userId: string): Promise<{
        allocated: boolean;
    }>;
    getInventoryStatistics(companyId: string): Promise<{
        total: number;
        shortage: number;
        allocated: number;
    }>;
    getInventoryMovements(id: string): Promise<any[]>;
    bulkUploadInventory(file: any, companyId: string, userId: string): Promise<{
        created: number;
        items: any[];
    }>;
    exportInventoryToExcel(filters: any): Promise<any>;
    getReorderSuggestions(companyId: string): Promise<any[]>;
    /**
     * Analyze inventory item for intelligent categorization
     */
    private analyzeInventoryItem;
    /**
     * Calculate inventory priority based on MTO and spot characteristics
     */
    private calculateInventoryPriority;
    /**
     * Generate shortage alerts for high-priority items
     */
    private generateShortageAlerts;
}
//# sourceMappingURL=inventory.service.d.ts.map