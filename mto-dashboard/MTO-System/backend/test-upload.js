const XLSX = require('xlsx');

// Create a test Excel file with the structure we expect
const testData = [
  ['Internal ID', 'PO Line ID', 'Display Name', 'Reference #', 'Quantity', 'Expected Ship Date', 'Spot 1', 'Spot 2', 'Bag Base PID', 'Sales Order #', 'CPSD'],
  ['TEST001', 'PL001', 'Test Product 1', 'REF001', 10, '2025-09-01', 'SKU1', 'SKU2', 'BAG001', 'SO001', '2025-08-30'],
  ['TEST002', 'PL002', 'Test Product 2', 'REF002', 5, '2025-09-02', 'SKU3', 'SKU4', 'BAG002', 'SO002', '2025-08-31']
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(testData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'MTOs');

// Save test file
XLSX.writeFile(wb, 'test-mto.xlsx');
console.log('Created test-mto.xlsx with 11 columns and 2 data rows');