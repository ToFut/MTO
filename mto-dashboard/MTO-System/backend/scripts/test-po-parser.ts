import { POParserService } from '../src/services/po-parser.service';
import * as XLSX from 'xlsx';
import { logger } from '../src/config/logger';

// Sample PO data structure (mimicking your Bauble Bar PO)
function createSamplePOExcel(): Buffer {
  const data = [
    ['Bauble Bar, Inc.'],
    ['Send Invoice and Packing Slip To Receiving@BaubleBar.com; Invoices@BaubleBar.com;'],
    ['PO@BaubleBar.com'],
    ['Purchase Order'],
    ['#PO1218545', '8/8/2025'],
    ['Customer:', 'CUST307 BaubleBar Ecomm Testing'],
    ['Requirements:', 'None'],
    ['TOTAL', '$21,098.25'],
    ['Total Qty', '835'],
    ['Requested Ship Date:', '8/19/2025'],
    [],
    ['Vendor'],
    ['All Brands Unlimited LLC'],
    ['7610 Beverly Blvd'],
    ['Suite 013'],
    ['Los Angeles CA 90048 United States'],
    [],
    ['Ship Samples To'],
    ['Attn: Production'],
    ['40 W 25th St 12th Fl'],
    ['New York NY 10010'],
    [],
    ['Ship Bulk To'],
    ['Contract Manufacturer : All Brands'],
    [],
    ['Shipping Method'],
    ['Moved to MTO Shelves'],
    [],
    // Header row for items
    ['Item', 'PID', 'Design', 'Factory', 'Customization', 'Qty', 'HTS Code', 'Pkg Code', 'Pkg Cost', 'First Cost', 'FOB Cost', 'Ext FOB'],
    // Line items
    ['89211-35', '13669', 'LFBB48', 'Natural-Mini', '1-3 Custom Icon Tote - 14oz Natural Lined - Small', 500, '4202.12.4000', 'Polybag', '$0', '$23.95', '$23.95', '$838.25'],
    ['89211-8', '13393', 'LFBB48', 'Natural', '2-2 Custom Icon Tote - 14oz Natural Lined - Medium', 300, '4202.12.4000', 'Polybag', '$0', '$24.95', '$24.95', '$12475'],
    ['88001-9', '13055', 'LFBB44', 'White-14oz', '1-Custom Icon Tote - 14oz Natural Lined - Large', 35, '4202.12.4000', 'Polybag', '$0', '$25.95', '$25.95', '$7785'],
    [],
    ['QTY Total', '835', '', '', '', '', '', '', '', '', 'Total', '$21,098.25']
  ];

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PO1218545');
  
  // Write to buffer
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function testPOParser() {
  console.log('=== Testing PO Parser Service ===\n');
  
  try {
    const poParser = new POParserService();
    
    // Create sample PO Excel
    const buffer = createSamplePOExcel();
    console.log('✓ Created sample PO Excel buffer');
    
    // Parse the PO
    const poData = await poParser.parseBaublePO(buffer);
    
    console.log('\n=== Parsed PO Data ===');
    console.log('PO Number:', poData.poNumber);
    console.log('Order Date:', poData.orderDate);
    console.log('Customer:', poData.customer);
    console.log('Total Amount:', poData.totalAmount);
    console.log('Total Qty:', poData.totalQty);
    console.log('Requested Ship Date:', poData.requestedShipDate);
    console.log('Vendor:', poData.vendorInfo);
    console.log('Ship To:', poData.shipToInfo);
    console.log('\nLine Items:', poData.lineItems.length);
    
    poData.lineItems.forEach((item, index) => {
      console.log(`\n  Item ${index + 1}:`);
      console.log(`    PID: ${item.pid}`);
      console.log(`    Design: ${item.design}`);
      console.log(`    Customization: ${item.customization}`);
      console.log(`    Qty: ${item.qty}`);
      console.log(`    FOB Cost: $${item.fobCost}`);
    });
    
    // Convert to MTOs
    console.log('\n=== Converting to MTOs ===');
    const mtos = poParser.convertPOToMTOs(
      poData,
      'brand-id-123',
      'factory-id-456'
    );
    
    console.log(`\nGenerated ${mtos.length} MTOs:`);
    mtos.forEach((mto, index) => {
      console.log(`\nMTO ${index + 1}:`);
      console.log(`  Internal ID: ${mto.internal_id}`);
      console.log(`  Display Name: ${mto.display_name}`);
      console.log(`  Quantity: ${mto.quantity}`);
      console.log(`  Priority: ${mto.priority}`);
      console.log(`  Category: ${mto.production_category}`);
      console.log(`  Spots: ${mto.spots.length}`);
      if (mto.spots.length > 0) {
        mto.spots.forEach((spot: any) => {
          console.log(`    - Position ${spot.position}: ${spot.description}`);
        });
      }
    });
    
    console.log('\n✅ PO Parser test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPOParser();