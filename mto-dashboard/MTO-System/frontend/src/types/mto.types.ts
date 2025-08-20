export interface MTO {
  id: string
  poId: string
  
  // Core IDs
  internalId: string
  poLineId: string
  
  // Dates
  expectedShipDate: Date | null
  actualShipDate: Date | null
  orderSubmitDate: Date | null
  soDate: Date | null
  shopifyOrderDate: Date | null
  cpsd: Date | null
  
  // Tracking
  poLineTracking: string | null
  awb: string | null
  masterCarton: string | null
  vendorPoStatus: string | null
  salesOrderNumber: string | null
  
  // Product Info
  displayName: string
  referenceNumber: string
  quantity: number
  bagBasePid: string
  productCategory: string | null
  size: string | null
  color: string | null
  material: string | null
  
  // Spots (1-6)
  spot1: string | null
  spot2: string | null
  spot3: string | null
  spot4: string | null
  spot5: string | null
  spot6: string | null
  
  // Spot Patch References
  spot1PatchRef: string | null
  spot2PatchRef: string | null
  spot3PatchRef: string | null
  spot4PatchRef: string | null
  spot5PatchRef: string | null
  spot6PatchRef: string | null
  
  // Status
  status: MTOStatus
  productionStage: ProductionStage | null
  productionCategory: 'daily' | 'monthly'
  priority: Priority
  progress: number
  
  // QC
  qcStatus: string | null
  qcDate: Date | null
  qcNotes: string | null
  qcPhotos: string[]
  
  // Defect
  isReplacement: boolean
  isRush: boolean
  defectType: DefectType | null
  defectDescription: string | null
  parentMtoId: string | null
  
  // Chat
  chatEnabled: boolean
  unreadMessages: number
  
  // Metadata
  tags: string[]
  notes: string | null
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string | null
}

export type MTOStatus = 
  | 'pending' 
  | 'proceed' 
  | 'in_production'
  | 'qc' 
  | 'shipping' 
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type ProductionStage = 
  | 'receive' 
  | 'cutting' 
  | 'sewing' 
  | 'embroidery' 
  | 'qc' 
  | 'packing' 
  | 'ready'

export type DefectType = 
  | 'missing' 
  | 'defect_bag' 
  | 'production_defect' 
  | 'embroidery_defect'
  | 'wrong_patch'
  | 'damaged'

export type Priority = 'urgent' | 'high' | 'normal' | 'low'

export interface CreateMTODto {
  poId: string
  internalId: string
  poLineId: string
  displayName: string
  referenceNumber: string
  quantity: number
  bagBasePid: string
  expectedShipDate?: Date
  spot1?: string
  spot2?: string
  spot3?: string
  spot4?: string
  spot5?: string
  spot6?: string
  spot1PatchRef?: string
  spot2PatchRef?: string
  spot3PatchRef?: string
  spot4PatchRef?: string
  spot5PatchRef?: string
  spot6PatchRef?: string
  priority?: Priority
  productionCategory?: 'daily' | 'monthly'
  notes?: string
}

export interface UpdateMTODto extends Partial<CreateMTODto> {
  status?: MTOStatus
  productionStage?: ProductionStage
  actualShipDate?: Date
  awb?: string
  masterCarton?: string
  qcStatus?: string
  qcNotes?: string
  progress?: number
}

export interface MTOFilter {
  page?: number
  limit?: number
  search?: string
  status?: MTOStatus | MTOStatus[]
  productionStage?: ProductionStage
  productionCategory?: 'daily' | 'monthly'
  priority?: Priority
  poId?: string
  startDate?: Date
  endDate?: Date
  isReplacement?: boolean
  isRush?: boolean
  hasDefect?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}