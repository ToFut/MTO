import React, { useState, useRef, useEffect } from 'react'
import { 
  Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertTriangle, 
  X, Eye, Package, AlertCircle, TrendingUp, Clock, Building2, Calendar,
  Zap, RefreshCw, FileText, Loader2, Info, ChevronDown
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { mtoService } from '../../services/mto.service'
import { useAuth } from '../../contexts/AuthContext'
import UploadResults from '../../components/upload/UploadResults'

interface UploadType {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  fields?: {
    poNumber?: boolean
    factoryId?: boolean
    isReplacement?: boolean
    originalMtoId?: boolean
    rushDays?: boolean
  }
}

const uploadTypes: UploadType[] = [
  {
    id: 'mto',
    name: 'Standard MTO',
    description: 'Upload regular Made-to-Order items',
    icon: Package,
    color: 'bg-blue-500',
    fields: { poNumber: false, factoryId: true }
  },
  {
    id: 'po',
    name: 'Purchase Order',
    description: 'Upload Bauble Bar or standard PO format',
    icon: FileText,
    color: 'bg-green-500',
    fields: { poNumber: true, factoryId: true }
  },
  {
    id: 'replacement',
    name: 'Replacement MTO',
    description: 'Upload replacement items for defective MTOs',
    icon: RefreshCw,
    color: 'bg-orange-500',
    fields: { isReplacement: true, originalMtoId: true, factoryId: true }
  },
  {
    id: 'rush',
    name: 'Rush Order',
    description: 'Upload urgent orders requiring expedited production',
    icon: Zap,
    color: 'bg-red-500',
    fields: { rushDays: true, factoryId: true }
  }
]

interface UploadProgress {
  file?: File
  uploadType?: string
  progress: number
  status: 'idle' | 'parsing' | 'preview' | 'uploading' | 'success' | 'error'
  message?: string
  results?: {
    totalRows: number
    successfulMTOs: number
    errors: string[]
    poNumber?: string
    workspaceName?: string
    inventoryCreated?: number
    barcodesGenerated?: number
    spotsDetected?: number
  }
  previewData?: {
    headers: string[]
    rows: any[][]
    validCount: number
    errorCount: number
    errors: Array<{ row: number; message: string }>
    spots: number
    summary: {
      totalMTOs: number
      uniqueProducts: number
      totalQuantity: number
      dateRange: { earliest: string; latest: string }
      urgentCount?: number
      dailyCount?: number
      monthlyCount?: number
    }
  }
}

const Upload: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')
  const [selectedType, setSelectedType] = useState<UploadType>(uploadTypes[0])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  })
  const [uploadHistory, setUploadHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Form fields
  const [poNumber, setPoNumber] = useState('')
  const [factoryId, setFactoryId] = useState('')
  const [rushDays, setRushDays] = useState('3')
  const [originalMtoId, setOriginalMtoId] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeTab === 'history') {
      fetchUploadHistory()
    }
  }, [activeTab])

  const fetchUploadHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await mtoService.getUploadHistory({
        brandId: user?.companyId || undefined,
        limit: 20,
        offset: 0
      })
      setUploadHistory(response.data || [])
    } catch (error) {
      console.error('Failed to fetch upload history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const parseExcelFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array', cellDates: true })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        setUploadProgress({
          progress: 0,
          status: 'error',
          message: 'Please select a valid Excel file (.xlsx or .xls)'
        })
        return
      }
      
      setUploadProgress({
        file,
        uploadType: selectedType.id,
        progress: 0,
        status: 'parsing',
        message: 'Reading Excel file...'
      })

      try {
        // For PO type, use smart preview
        if (selectedType.id === 'po' && poNumber) {
          const previewResult = await mtoService.previewUpload(
            file,
            poNumber,
            factoryId || undefined,
            user?.companyId || undefined
          )
          
          setUploadProgress({
            file,
            uploadType: selectedType.id,
            progress: 0,
            status: 'preview',
            previewData: {
              headers: [],
              rows: previewResult.mtos.slice(0, 10).map((mto: any) => [
                mto.internal_id,
                mto.po_line_id,
                mto.display_name,
                mto.quantity,
                mto.expected_ship_date,
                mto.spot_count
              ]),
              validCount: previewResult.mtoCount,
              errorCount: previewResult.warnings?.length || 0,
              errors: previewResult.warnings?.map((w: string, i: number) => ({ 
                row: i + 1, 
                message: w 
              })) || [],
              spots: previewResult.analysis.detectedSpots,
              summary: {
                totalMTOs: previewResult.mtoCount,
                uniqueProducts: previewResult.impact.inventoryItemsToCreate,
                totalQuantity: previewResult.mtos.reduce((sum: number, m: any) => sum + m.quantity, 0),
                dateRange: {
                  earliest: previewResult.mtos[0]?.expected_ship_date || 'N/A',
                  latest: previewResult.mtos[previewResult.mtos.length - 1]?.expected_ship_date || 'N/A'
                },
                urgentCount: previewResult.summary.urgentCount,
                dailyCount: previewResult.summary.dailyCount,
                monthlyCount: previewResult.summary.monthlyCount
              }
            }
          })
        } else {
          // Parse Excel file for preview (standard MTO)
        const data = await parseExcelFile(file)
        
        if (!data || data.length < 2) {
          throw new Error('Excel file is empty or has no data rows')
        }

        const headers = data[0] as string[]
          const rows = data.slice(1, Math.min(11, data.length))
        
        // Analyze the data
        const errors: Array<{ row: number; message: string }> = []
        let validCount = 0
        let totalSpots = 0
        const products = new Set<string>()
        let totalQuantity = 0
        const dates: string[] = []

        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          if (!row || row.length === 0) continue
          
            const displayNameIdx = headers.findIndex(h => 
              h?.toLowerCase().includes('display') || 
              h?.toLowerCase().includes('name') ||
              h?.toLowerCase().includes('product')
            )
            const quantityIdx = headers.findIndex(h => 
              h?.toLowerCase().includes('quantity') || 
              h?.toLowerCase().includes('qty')
            )
            const dateIdx = headers.findIndex(h => 
              h?.toLowerCase().includes('ship') && 
              h?.toLowerCase().includes('date')
            )
            
          if (displayNameIdx === -1 || !row[displayNameIdx]) {
            errors.push({ row: i + 1, message: 'Missing display name' })
          } else {
            validCount++
            products.add(row[displayNameIdx])
          }
          
          // Count spots
          headers.forEach((header, idx) => {
            if (header?.toLowerCase().includes('spot') && row[idx]) {
              totalSpots++
            }
          })
          
          if (quantityIdx !== -1 && row[quantityIdx]) {
            totalQuantity += parseInt(row[quantityIdx]) || 1
          }
          
          if (dateIdx !== -1 && row[dateIdx]) {
            dates.push(row[dateIdx])
          }
        }

        dates.sort()
        
        setUploadProgress({
          file,
            uploadType: selectedType.id,
          progress: 0,
          status: 'preview',
          previewData: {
            headers,
            rows,
            validCount,
            errorCount: errors.length,
              errors: errors.slice(0, 5),
            spots: totalSpots,
            summary: {
              totalMTOs: data.length - 1,
              uniqueProducts: products.size,
              totalQuantity,
              dateRange: {
                earliest: dates[0] || 'N/A',
                latest: dates[dates.length - 1] || 'N/A'
              }
            }
          }
        })
        }
      } catch (error: any) {
        setUploadProgress({
          file,
          uploadType: selectedType.id,
          progress: 0,
          status: 'error',
          message: `Failed to parse Excel file: ${error.message}`
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!uploadProgress.file) return

    setUploadProgress(prev => ({ ...prev, status: 'uploading', progress: 10 }))

    try {
      let result: any
      
      // Choose upload method based on type
      if (selectedType.id === 'po' && poNumber) {
        // Smart upload for PO
        result = await mtoService.smartUpload(
          uploadProgress.file,
          poNumber,
          factoryId || undefined,
          user?.companyId || undefined,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, progress: Math.min(90, progress) }))
          }
        )
      } else {
        // Standard upload for other types
        result = await mtoService.uploadExcel(uploadProgress.file, (progress) => {
        setUploadProgress(prev => ({ ...prev, progress: Math.min(90, progress) }))
      })
      }

      const successCount = result.created || (Array.isArray(result) ? result.length : 0)
      const errors = result.errors || []
      
      setUploadProgress({
        file: uploadProgress.file,
        uploadType: selectedType.id,
        progress: 100,
        status: 'success',
        message: 'Upload completed successfully!',
        results: {
          totalRows: uploadProgress.previewData?.summary.totalMTOs || 0,
          successfulMTOs: successCount,
          errors: errors.map((e: any) => typeof e === 'string' ? e : `Row ${e.row}: ${e.message || e.errors?.join(', ')}`),
          poNumber: result.po?.po_number || poNumber,
          workspaceName: result.workspace?.name,
          inventoryCreated: result.summary?.inventoryItemsCreated || result.autoPopulation?.inventory?.created || 0,
          barcodesGenerated: result.summary?.barcodesGenerated || result.autoPopulation?.barcodes?.created || 0,
          spotsDetected: result.summary?.spotsDetected || uploadProgress.previewData?.spots || 0
        }
      })

      // Refresh history
      if (activeTab === 'history') {
        fetchUploadHistory()
      }
    } catch (error: any) {
      setUploadProgress({
        file: uploadProgress.file,
        uploadType: selectedType.id,
        progress: 0,
        status: 'error',
        message: `Upload failed: ${error.message}`
      })
    }
  }

  const resetUpload = () => {
    setUploadProgress({ progress: 0, status: 'idle' })
    setPoNumber('')
    setFactoryId('')
    setRushDays('3')
    setOriginalMtoId('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Center</h1>
        <p className="text-gray-600">Upload and manage your purchase orders and MTO files</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UploadIcon size={16} />
                New Upload
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Upload History
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'upload' ? (
          <div className="p-6">
            {/* Upload Type Selection */}
            {uploadProgress.status === 'idle' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Upload Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {uploadTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedType.id === type.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`${type.color} rounded-lg inline-flex p-3 text-white mb-3`}>
                            <Icon size={24} />
                          </div>
                          <h4 className="font-medium text-gray-900">{type.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Additional Fields Based on Type */}
                {selectedType.fields && Object.keys(selectedType.fields).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Additional Information</h4>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                      >
                        {showAdvanced ? 'Hide' : 'Show'} Options
                        <ChevronDown size={14} className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {(showAdvanced || selectedType.fields.poNumber || selectedType.fields.rushDays || selectedType.fields.originalMtoId) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedType.fields.poNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Purchase Order Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={poNumber}
                              onChange={(e) => setPoNumber(e.target.value)}
                              placeholder="e.g., PO-2025-001"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        )}
                        
                        {selectedType.fields.factoryId && showAdvanced && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Factory (Optional)
                            </label>
                            <select
                              value={factoryId}
                              onChange={(e) => setFactoryId(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Auto-select</option>
                              <option value="factory-1">GZ Totes Factory</option>
                              <option value="factory-2">Vietnam Factory</option>
                              <option value="factory-3">Thailand Factory</option>
                            </select>
                          </div>
                        )}
                        
                        {selectedType.fields.rushDays && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rush Delivery (Days) <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={rushDays}
                              onChange={(e) => setRushDays(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="1">1 Day (Critical)</option>
                              <option value="2">2 Days (Urgent)</option>
                              <option value="3">3 Days (Rush)</option>
                              <option value="5">5 Days (Priority)</option>
                            </select>
                          </div>
                        )}
                        
                        {selectedType.fields.originalMtoId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Original MTO ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={originalMtoId}
                              onChange={(e) => setOriginalMtoId(e.target.value)}
                              placeholder="e.g., MTO-2025-001"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload {selectedType.name} File
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your Excel file here, or click to browse
                  </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                    disabled={selectedType.id === 'po' && !poNumber}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                    Select Excel File
              </button>
                  {selectedType.id === 'po' && !poNumber && (
                    <p className="text-sm text-red-500 mt-2">
                      Please enter PO number before selecting file
                    </p>
                  )}
            </div>
            </div>
          )}

            {/* Preview Section */}
          {uploadProgress.status === 'preview' && uploadProgress.previewData && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900">File Preview</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        {uploadProgress.file?.name} • {uploadProgress.previewData.summary.totalMTOs} rows detected
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Valid MTOs</p>
                    <p className="text-2xl font-bold text-green-600">
                      {uploadProgress.previewData.validCount}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Spots</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {uploadProgress.previewData.spots}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {uploadProgress.previewData.summary.totalQuantity}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Errors</p>
                    <p className="text-2xl font-bold text-red-600">
                      {uploadProgress.previewData.errorCount}
                    </p>
                  </div>
                </div>

                {/* Priority Breakdown (if available) */}
                {uploadProgress.previewData.summary.urgentCount !== undefined && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">Priority Breakdown</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-orange-700">Urgent Orders:</span>
                        <span className="font-bold text-orange-900 ml-2">
                          {uploadProgress.previewData.summary.urgentCount}
                        </span>
                    </div>
                    <div>
                        <span className="text-orange-700">Daily Production:</span>
                        <span className="font-bold text-orange-900 ml-2">
                          {uploadProgress.previewData.summary.dailyCount}
                        </span>
                    </div>
                    <div>
                        <span className="text-orange-700">Monthly Production:</span>
                        <span className="font-bold text-orange-900 ml-2">
                          {uploadProgress.previewData.summary.monthlyCount}
                      </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Preview Table */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h4 className="font-medium text-gray-900">Data Preview (First 10 rows)</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {(uploadProgress.previewData.headers.slice(0, 6) || 
                            ['Internal ID', 'PO Line', 'Display Name', 'Quantity', 'Ship Date', 'Spots']
                          ).map((header, idx) => (
                            <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {uploadProgress.previewData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {row.slice(0, 6).map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Errors */}
                {uploadProgress.previewData.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Validation Issues</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      {uploadProgress.previewData.errors.map((error, idx) => (
                        <li key={idx}>Row {error.row}: {error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Confirm Upload
                  </button>
              </div>
            </div>
          )}

            {/* Uploading State */}
          {uploadProgress.status === 'uploading' && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Uploading...</h3>
                <p className="text-sm text-gray-500 mb-4">{uploadProgress.message}</p>
                <div className="w-full max-w-xs mx-auto">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                    />
              </div>
                  <p className="text-sm text-gray-500 mt-2">{uploadProgress.progress}%</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {uploadProgress.status === 'success' && uploadProgress.results && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Successful!</h3>
                <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto mb-6">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">MTOs Created:</dt>
                      <dd className="font-medium text-gray-900">{uploadProgress.results.successfulMTOs}</dd>
                    </div>
                    {uploadProgress.results.spotsDetected && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Spots Detected:</dt>
                        <dd className="font-medium text-gray-900">{uploadProgress.results.spotsDetected}</dd>
                      </div>
                    )}
                    {(uploadProgress.results.inventoryCreated || 0) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Inventory Items:</dt>
                        <dd className="font-medium text-gray-900">{uploadProgress.results.inventoryCreated}</dd>
                      </div>
                    )}
                    {(uploadProgress.results.barcodesGenerated || 0) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Barcodes Generated:</dt>
                        <dd className="font-medium text-gray-900">{uploadProgress.results.barcodesGenerated}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="flex gap-3 justify-center">
              <button
                onClick={resetUpload}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                    Upload Another
              </button>
                  <a
                    href="/brand/mtos"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    View MTOs
                  </a>
                </div>
            </div>
          )}

            {/* Error State */}
          {uploadProgress.status === 'error' && (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Failed</h3>
                <p className="text-sm text-red-600 mb-6">{uploadProgress.message}</p>
              <button
                onClick={resetUpload}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          )}
          </div>
        ) : (
          /* History Tab */
          <div className="p-6">
            {historyLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : uploadHistory.length > 0 ? (
              <div className="space-y-4">
                {uploadHistory.map((item) => (
                  <div key={item.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.po?.po_number || item.name || 'Upload'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.total_mtos || 0} MTOs • {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        <button className="text-indigo-600 hover:text-indigo-500">
                          <Eye size={16} />
                        </button>
                      </div>
        </div>
      </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upload History</h3>
                <p className="text-sm text-gray-500">Your upload history will appear here</p>
        </div>
            )}
        </div>
        )}
      </div>
    </div>
  )
}

export default Upload