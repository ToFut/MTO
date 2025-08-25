import React, { useState } from 'react'
import { FileSpreadsheet, Upload as UploadIcon, CheckCircle, AlertTriangle } from 'lucide-react'

const UploadTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStatus('idle')
      setMessage(`Selected: ${selectedFile.name}`)
    }
  }

  const testUpload = async () => {
    if (!file) {
      setMessage('Please select a file first')
      return
    }

    setStatus('uploading')
    setMessage('Testing upload...')

    try {
      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Not authenticated. Please log in.')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Direct API call with fetch
      const response = await fetch('http://localhost:5010/api/mtos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed')
      }

      setStatus('success')
      setMessage(`Success! Created ${data.data?.length || data.created || 0} MTOs`)
      console.log('Upload response:', data)
    } catch (error: any) {
      setStatus('error')
      setMessage(`Error: ${error.message}`)
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Test (Debug)</h2>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            File: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        <button
          onClick={testUpload}
          disabled={!file || status === 'uploading'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {status === 'uploading' ? 'Uploading...' : 'Test Upload'}
        </button>

        {message && (
          <div className={`p-3 rounded-md ${
            status === 'success' ? 'bg-green-50 text-green-800' :
            status === 'error' ? 'bg-red-50 text-red-800' :
            status === 'uploading' ? 'bg-blue-50 text-blue-800' :
            'bg-gray-50 text-gray-800'
          }`}>
            <div className="flex items-center gap-2">
              {status === 'success' && <CheckCircle size={20} />}
              {status === 'error' && <AlertTriangle size={20} />}
              {status === 'uploading' && <UploadIcon size={20} className="animate-pulse" />}
              {status === 'idle' && <FileSpreadsheet size={20} />}
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• API Endpoint: http://localhost:5010/api/mtos/upload</p>
          <p>• Auth Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
          <p>• Backend Status: Testing...</p>
        </div>
      </div>
    </div>
  )
}

export default UploadTest