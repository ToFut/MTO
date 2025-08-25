export declare class DefectService {
    private supabase;
    getDefects(filters: any): Promise<{
        data: any[];
        total: number;
    }>;
    getDefectById(id: string): Promise<any>;
    reportDefect(defectData: any): Promise<{
        defect: any;
        replacement: any;
    } | {
        defect: any;
        replacement?: undefined;
    }>;
    updateDefectStatus(id: string, status: string, notes: string, userId: string): Promise<any>;
    createReplacementMTO(defectId: string, isRush: boolean, notes: string, userId: string): Promise<any>;
    updateDefect(id: string, updates: any): Promise<any>;
    deleteDefect(id: string): Promise<boolean>;
    getDefectQueue(filters: any): Promise<any[]>;
    assignDefect(id: string, assignedTo: string, assignedBy: string): Promise<any>;
    getDefectStatistics(filters: any): Promise<{
        total: number;
        resolved: number;
        pending: number;
        byType: {};
    }>;
    getDefectTimeline(id: string): Promise<any[]>;
    addQCPhotos(id: string, photos: string[]): Promise<any>;
    exportDefectsToExcel(filters: any): Promise<any>;
    generateAQLReport(filters: any): Promise<{
        passed: number;
        failed: number;
        defectRate: number;
    }>;
}
//# sourceMappingURL=defect.service.d.ts.map