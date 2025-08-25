export declare class SyncService {
    private supabase;
    getSyncStatus(companyId: string): Promise<{
        connected: boolean;
        lastSync: Date;
        status: string;
    }>;
    syncWithNetSuite(options: any): Promise<{
        success: boolean;
        synced: number;
        errors: any[];
    }>;
    getSyncHistory(companyId: string, filters: any): Promise<{
        data: any[];
        total: number;
    }>;
    getSyncErrors(companyId: string): Promise<any[]>;
    retrySync(syncId: string, userId: string): Promise<{
        success: boolean;
    }>;
    configureSyncSettings(companyId: string, settings: any): Promise<any>;
    getSyncMappings(companyId: string): Promise<any[]>;
    updateSyncMapping(mappingId: string, mappingData: any, userId: string): Promise<any>;
    testConnection(system: string, companyId: string): Promise<{
        connected: boolean;
        message: string;
    }>;
    scheduleSync(scheduleData: any): Promise<any>;
    getScheduledSyncs(companyId: string): Promise<any[]>;
    deleteScheduledSync(scheduleId: string, userId: string): Promise<boolean>;
    getSyncStatistics(companyId: string): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    exportSyncReport(companyId: string, filters: any): Promise<any>;
}
//# sourceMappingURL=sync.service.d.ts.map