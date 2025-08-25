const fs = require('fs');
const XLSX = require('xlsx');

// Create a test Excel file with various date formats
const workbook = XLSX.utils.book_new();
const data = [];

// Add header row
data.push([
  'Internal ID',
  'Style#',
  'Factory',
  'Description',
  'Fabrication',
  'Label',
  'Delivery Date',
  'PO#',
  'Total Quantity',
  'Spot 1', 'Spot 2', 'Spot 3', 'Spot 4', 'Spot 5', 'Spot 6'
]);

// Add test rows with different date formats
const testDates = [
  new Date('2025-03-15'), // Standard date
  44271, // Excel serial number for 2021-03-17
  45678, // Excel serial number for 2025-01-30
  '2025-04-20', // String date
  new Date('2025-12-31'), // End of year
  '', // Empty date
  null, // Null date
];

const timestamp = Date.now();
for (let i = 0; i < 100; i++) {
  const dateValue = testDates[i % testDates.length];
  data.push([
    `TEST-${timestamp}-${i}`, // Unique ID with timestamp
    `STYLE-${timestamp}-${i}`,
    'Factory A',
    `Test Product ${i}`,
    'Cotton',
    `Label ${i}`,
    dateValue,
    'PO-2025-001',
    100 + i, // Vary quantities too
    20, 15, 15, 20, 15, 15
  ]);
}

const worksheet = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(workbook, worksheet, 'MTOs');

// Write the file
const outputPath = '/Users/segevbin/Desktop/Customization/mto-dashboard/MTO-System/backend/test-large-mtos.xlsx';
XLSX.writeFile(workbook, outputPath);

console.log(`Created test file with ${data.length - 1} MTOs at: ${outputPath}`);
console.log('Test dates include:');
console.log('- Standard Date objects');
console.log('- Excel serial numbers (44271, 45678)');
console.log('- String dates');
console.log('- Empty and null values');