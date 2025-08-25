export declare class ShipmentService {
    private supabase;
    getShipments(filters: any): Promise<{
        data: any[];
        total: number;
    }>;
    getShipmentById(id: string): Promise<any>;
    createShipment(shipmentData: any): Promise<any>;
    updateShipment(id: string, updates: any): Promise<any>;
    updateShipmentStatus(id: string, status: string, location: string, notes: string, userId: string): Promise<any>;
    trackAWB(awb: string): Promise<any>;
    createMasterCarton(cartonData: any): Promise<any>;
    getMasterCarton(cartonNumber: string): Promise<any>;
    generatePackingList(shipmentId: string): Promise<Buffer<ArrayBuffer>>;
    generateShippingLabels(shipmentId: string): Promise<Buffer<ArrayBuffer>>;
    deleteShipment(id: string): Promise<boolean>;
    getDeliveryStatus(id: string): Promise<{
        delivery_status: any;
    }>;
    confirmDelivery(id: string, confirmationData: any): Promise<any>;
    getShipmentTimeline(id: string): Promise<any[]>;
    getShippingStatistics(filters: any): Promise<{
        total: number;
        delivered: number;
        inTransit: number;
        pending: number;
    }>;
    exportShipmentsToExcel(filters: any): Promise<any>;
}
//# sourceMappingURL=shipment.service.d.ts.map