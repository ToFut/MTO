import React, { useState, useRef } from 'react'
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertTriangle, X } from 'lucide-react'

interface UploadProgress {
  file?: File
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  message?: string
  results?: {
    totalRows: number
    successfulMTOs: number
    errors: string[]
  }
}

const Upload: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        progress: 0,
        status: 'idle'
      })
    }
  }

  const handleUpload = async () => {
    if (!uploadProgress.file) return

    setUploadProgress(prev => ({ ...prev, status: 'uploading', progress: 10 }))

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev.progress >= 90) {
          clearInterval(progressInterval)
          // Simulate completion
          setTimeout(() => {
            setUploadProgress({
              file: prev.file,
              progress: 100,
              status: 'success',
              message: 'Upload completed successfully!',
              results: {
                totalRows: 45,
                successfulMTOs: 43,
                errors: ['Row 12: Missing required field "display_name"', 'Row 28: Invalid date format']
              }
            })
          }, 500)
          return prev
        }
        return { ...prev, progress: prev.progress + 15 }
      })
    }, 500)
  }

  const resetUpload = () => {
    setUploadProgress({ progress: 0, status: 'idle' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sampleData = [
    ['Internal ID', 'PO Line ID', 'Expected Ship Date', 'Display Name', 'Reference Number', 'Quantity', 'Spot 1', 'Spot 2'],
    ['37483586', '6', '2024-03-15', 'Custom Tote Bag - 14oz Natural Lined - Medium', 'md6a4z3j45we9', '1', '129559', '137234'],
    ['37483587', '7', '2024-03-16', 'Custom Tote Bag - 14oz Natural Lined - Large', 'lg7b5x4k56we8', '2', '128687', '128698'],
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload PO/MTO</h1>
        <p className="text-gray-600">Upload Excel files to create purchase orders and MTOs.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="max-w-2xl mx-auto">
          {uploadProgress.status === 'idle' && !uploadProgress.file && (
            <div className="text-center">
              <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Excel File</h3>
              <p className="text-gray-600 mb-4">
                Choose an Excel file (.xlsx or .xls) containing your PO/MTO data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Choose File
              </button>
            </div>
          )}

          {uploadProgress.file && uploadProgress.status === 'idle' && (
            <div className="text-center">
              <FileSpreadsheet size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
              <p className="text-gray-600 mb-2">{uploadProgress.file.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                Size: {(uploadProgress.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Upload & Process
                </button>
                <button
                  onClick={resetUpload}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {uploadProgress.status === 'uploading' && (
            <div className="text-center">
              <UploadIcon size={48} className="mx-auto text-blue-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">{uploadProgress.progress}% complete</p>
            </div>
          )}

          {uploadProgress.status === 'success' && (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Successful!</h3>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <div className="text-sm text-green-800">
                  <p><strong>Total Rows:</strong> {uploadProgress.results?.totalRows}</p>
                  <p><strong>Successful MTOs:</strong> {uploadProgress.results?.successfulMTOs}</p>
                  <p><strong>Errors:</strong> {uploadProgress.results?.errors.length || 0}</p>
                </div>
              </div>
              {uploadProgress.results?.errors && uploadProgress.results.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Errors encountered:</h4>
                  <ul className="text-sm text-yellow-700 text-left space-y-1">
                    {uploadProgress.results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={resetUpload}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Upload Another File
              </button>
            </div>
          )}

          {uploadProgress.status === 'error' && (
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Error</h3>
              <p className="text-red-600 mb-4">{uploadProgress.message}</p>
              <button
                onClick={resetUpload}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sample Format */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Expected Excel Format</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {sampleData[0].map((header, index) => (
                  <th key={index} className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.slice(1).map((row, index) => (
                <tr key={index} className="bg-white">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-sm text-gray-900">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Required columns:</strong> Internal ID, Display Name, Reference Number, Quantity</p>
          <p><strong>Optional columns:</strong> Spot 1-6, Expected Ship Date, PO Line ID</p>
        </div>
      </div>
    </div>
  )
}

export default Upload