interface BrandFactoryAssignment {
    id: string;
    brand_id: string;
    factory_id: string;
    assigned_by: string;
    status: 'active' | 'inactive' | 'suspended';
    capabilities: string[];
    production_capacity: number;
    quality_rating: number;
    preferred_for_categories: string[];
    notes?: string;
    assigned_at: string;
    updated_at: string;
}
interface CreateAssignmentData {
    brand_id: string;
    factory_id: string;
    assigned_by: string;
    capabilities?: string[];
    production_capacity?: number;
    quality_rating?: number;
    preferred_for_categories?: string[];
    notes?: string;
}
interface AssignmentFilters {
    brand_id?: string;
    factory_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
}
export declare class AssignmentService {
    createAssignment(data: CreateAssignmentData): Promise<BrandFactoryAssignment>;
    getAssignments(filters?: AssignmentFilters): Promise<any[]>;
    getAssignmentById(id: string): Promise<BrandFactoryAssignment | null>;
    updateAssignment(id: string, updateData: Partial<CreateAssignmentData & {
        status: string;
    }>): Promise<BrandFactoryAssignment>;
    deleteAssignment(id: string): Promise<void>;
    getAvailableFactoriesForBrand(brandId: string): Promise<{
        id: any;
        name: any;
        code: any;
        email: any;
        contact_person: any;
        address: any;
        settings: any;
        active: any;
        created_at: any;
    }[]>;
    getAssignedFactoriesForBrand(brandId: string): Promise<any[]>;
    getBrandsForFactory(factoryId: string): Promise<any[]>;
}
export declare const assignmentService: AssignmentService;
export {};
//# sourceMappingURL=assignment.service.d.ts.map