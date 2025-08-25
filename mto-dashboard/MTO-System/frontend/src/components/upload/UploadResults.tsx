import React from 'react';
import { CheckCircle, XCircle, AlertCircle, FileSpreadsheet, Package, AlertTriangle } from 'lucide-react';

interface UploadResultsProps {
  results: {
    success: boolean;
    created: number;
    errors: Array<{
      row?: number;
      sheet?: string;
      errors: string[];
    }>;
    mtos?: any[];
    excelAnalysis?: {
      totalRows: number;
      validRows: number;
      errorRows: number;
      detectedSpots: number;
      qualityScore: number;
      sheetsProcessed?: number;
    };
    message?: string;
  };
  onClose?: () => void;
  onViewMTOs?: () => void;
}

export const UploadResults: React.FC<UploadResultsProps> = ({ results, onClose, onViewMTOs }) => {
  const hasErrors = results.errors && results.errors.length > 0;
  const hasWarnings = results.excelAnalysis && results.excelAnalysis.qualityScore < 80;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {results.success && results.created > 0 ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : hasErrors ? (
            <XCircle className="w-8 h-8 text-red-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          )}
          <h2 className="text-xl font-semibold">
            {results.success && results.created > 0 
              ? 'Upload Successful' 
              : hasErrors 
              ? 'Upload Failed' 
              : 'Upload Completed with Issues'}
          </h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Total Rows</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {results.excelAnalysis?.totalRows || 0}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">MTOs Created</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {results.created || 0}
          </p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">Errors</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {results.errors?.length || 0}
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Quality Score</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {results.excelAnalysis?.qualityScore || 0}%
          </p>
        </div>
      </div>

      {/* Additional Analysis */}
      {results.excelAnalysis && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Upload Analysis</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sheets Processed:</span>
              <span className="ml-2 font-medium">{results.excelAnalysis.sheetsProcessed || 1}</span>
            </div>
            <div>
              <span className="text-gray-600">Detected Spots:</span>
              <span className="ml-2 font-medium">{results.excelAnalysis.detectedSpots}</span>
            </div>
            <div>
              <span className="text-gray-600">Valid Rows:</span>
              <span className="ml-2 font-medium">{results.excelAnalysis.validRows || results.created}</span>
            </div>
            <div>
              <span className="text-gray-600">Error Rows:</span>
              <span className="ml-2 font-medium">{results.excelAnalysis.errorRows || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {hasErrors && (
        <div className="border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-red-900 mb-3">Error Details</h3>
          <div className="max-h-48 overflow-y-auto">
            {results.errors.slice(0, 10).map((error, idx) => (
              <div key={idx} className="text-sm mb-2 pb-2 border-b border-red-100 last:border-0">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-medium">
                    {error.sheet && `Sheet: ${error.sheet} | `}
                    Row {error.row || idx + 1}:
                  </span>
                  <span className="text-gray-600">
                    {error.errors.join(', ')}
                  </span>
                </div>
              </div>
            ))}
            {results.errors.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                ... and {results.errors.length - 10} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {results.created > 0 && onViewMTOs && (
          <button
            onClick={onViewMTOs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Created MTOs
          </button>
        )}
        {hasErrors && (
          <button
            onClick={() => {
              // Export errors to CSV
              const csv = results.errors.map(e => 
                `${e.sheet || 'Main'},${e.row},${e.errors.join(';')}`
              ).join('\n');
              const blob = new Blob([`Sheet,Row,Errors\n${csv}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'upload-errors.csv';
              a.click();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Export Errors
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadResults;