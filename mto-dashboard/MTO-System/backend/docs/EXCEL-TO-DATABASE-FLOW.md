# Excel Upload to Database Population Flow

## 📤 Complete Data Flow: Excel → Database → All Systems

### STEP 1: Excel Upload
When a brand uploads an Excel file with your format:

```excel
Internal ID | PO Line ID | Expected Ship Date | Display Name | Reference # | Quantity | Spot 1 | Spot 2 | ... | Customization Text | HTS Code | FOB Cost | ...
38591622    | 7          | 8/20/2025         | Custom Tote  | mekanly047  | 1        | 138263 | 131749 | ... | KM                 | 4202.12  | 54.25    | ...
```

---

## 🔄 STEP 2: Data Distribution Process

### 2.1 **Excel Parser Service** (`po-parser.service.ts` / `excel.service.ts`)
```typescript
// The service reads ALL columns from Excel
const parsedData = {
  // Core fields mapped directly
  internal_id: row['Internal ID'],           // → mtos.internal_id
  po_line_id: row['PO Line ID'],            // → mtos.po_line_id
  display_name: row['Display Name'],        // → mtos.display_name
  reference_number: row['Reference #'],      // → mtos.reference_number
  quantity: row['Quantity'],                // → mtos.quantity
  
  // Date fields
  expected_ship_date: row['Expected Ship Date'],     // → mtos.expected_ship_date
  actual_ship_date: row['Actual Ship Date'],         // → mtos.actual_ship_date
  shopify_order_date: row['Shopify Order Date/Time'], // → mtos.shopify_order_date
  cpsd: row['CPSD'],                                 // → mtos.cpsd
  
  // ALL other Excel fields go into JSONB
  excel_data: {
    // Every single column from Excel stored here
    sales_order_number: row['Sales Order #'],
    po_line_tracking: row['PO Line Tracking #'],
    po_line_carton: row['PO Line Carton #'],
    vendor_po_comments: row['Vendor PO Comments'],
    production_po_comments: row['Production PO Comments'],
    order_type: row['Order Type'],
    po_line_invoice: row['PO Line Invoice #'],
    order_submit_date: row['Order Submit Date'],
    so_date: row['SO Date'],
    bag_base_pid: row['Bag Base PID'],
    customization_text: row['Customization Text'],
    product_size: row['Product Size'],
    product_color: row['Product Color'],
    packaging_code: row['Packaging Code'],
    hts_code: row['HTS Code'],
    mto_labor_cost: row['MTO Labor Cost'],
    po_purchase_price: row['PO Purchase Price'],
    po_ext_fob: row['PO Ext FOB'],
    vendor_name: row['Vendor'],
    vendor_mto_base_color: row['Vendor MTO Base Color'],
    vendor_mto_letter_color: row['Vendor MTO Letter Color'],
    mto_production_lt: row['MTO Production LT'],
    expected_production_lt: row['Expected Production LT'],
    days_late: row['Days Late?'],
    shopify_order_number: row['Shopify Order #'],
    // ... ALL other columns
  },
  
  // Spots parsed into structured array
  spots_data: [
    { position: 1, sku: row['Spot 1'], patch_ref: row['Spot 1 - Patch Ref'] },
    { position: 2, sku: row['Spot 2'], patch_ref: row['Spot 2 - Patch Ref'] },
    { position: 3, sku: row['Spot 3'], patch_ref: row['Spot 3 - Patch Ref'] },
    { position: 4, sku: row['Spot 4'], patch_ref: row['Spot 4 - Patch Ref'] },
    { position: 5, sku: row['Spot 5'], patch_ref: row['Spot 5 - Patch Ref'] },
    { position: 6, sku: row['Spot 6'], patch_ref: row['Spot 6 - Patch Ref'] }
  ]
}
```

---

## 📊 STEP 3: Database Population

### 3.1 **Purchase Orders Table**
```sql
INSERT INTO purchase_orders (
  po_number,        -- Extracted from Excel filename or header
  brand_id,         -- From logged-in user's company
  factory_id,       -- Selected by brand or assigned by admin
  total_amount,     -- SUM of all PO Ext FOB from Excel
  customer_code,    -- From Excel 'PO CUSTOMER TYPE'
  vendor_info,      -- JSONB: {name: 'Vendor', address: 'Vendor Address'}
  ship_to_info,     -- JSONB: {address: 'Ship To Address', method: 'Air'}
  production_category -- Determined by ship dates (daily/weekly/monthly)
)
```

### 3.2 **Workspaces Table**
```sql
INSERT INTO workspaces (
  name,               -- "BB Monthly Production - Aug 2025"
  brand_id,           -- From PO
  factory_id,         -- From PO
  po_id,              -- Link to PO created above
  production_category,-- 'daily', 'weekly', or 'monthly'
  total_mtos,         -- COUNT of Excel rows
  target_completion_date -- Latest expected_ship_date from Excel
)
```

### 3.3 **MTOs Table** (All Excel data preserved)
```sql
INSERT INTO mtos (
  -- Direct mapped fields
  internal_id,        -- Excel: Internal ID
  po_line_id,         -- Excel: PO Line ID
  display_name,       -- Excel: Display Name
  reference_number,   -- Excel: Reference #
  quantity,           -- Excel: Quantity
  
  -- Dates
  expected_ship_date, -- Excel: Expected Ship Date
  actual_ship_date,   -- Excel: Actual Ship Date
  shopify_order_date, -- Excel: Shopify Order Date/Time
  cpsd,              -- Excel: CPSD
  
  -- JSONB storage for ALL Excel columns
  excel_data,        -- Contains EVERYTHING from Excel
  spots_data,        -- Array of spot customizations
  
  -- System fields
  workspace_id,      -- Link to workspace
  po_id,            -- Link to PO
  brand_id,         -- From user
  factory_id,       -- From assignment
  status,           -- 'pending' initially
  production_category -- daily/weekly/monthly
)
```

---

## 🔄 STEP 4: Auto-Population to Other Systems

### 4.1 **Inventory Table** (Auto-created from spots)
```typescript
// For each unique SKU in spots
for (const spot of mto.spots_data) {
  INSERT INTO inventory (
    sku: spot.sku,           // "138263"
    name: spot.description,   // "Green Script Patch"
    category: 'patch',
    current_stock: 0,         // Will be updated by factory
    factory_id: mto.factory_id
  )
}
```

### 4.2 **Vocabulary Mappings** (SKU translations)
```typescript
// Auto-create mappings for brand-factory communication
INSERT INTO vocabulary_mappings (
  brand_id,
  factory_id,
  brand_sku: spot.sku,              // "138263"
  brand_description: spot.patch_ref, // "10019"
  factory_description: "Patch 138263 - Green Script",
  patch_type: 'embroidery',
  complexity_level: 'medium'
)
```

### 4.3 **Barcodes Table** (For tracking)
```typescript
// Generate barcodes for each MTO and spot
INSERT INTO barcodes (
  mto_id,
  type: 'line',
  value: `PO:${po_number}|LINE:${po_line_id}|REF:${reference_number}`
)

// For each spot
INSERT INTO barcodes (
  mto_id,
  type: 'spot',
  spot_number: 1,
  value: `PO:${po_number}|SPOT:1|SKU:138263`
)
```

### 4.4 **Production Schedule** (Optional auto-scheduling)
```typescript
// Auto-schedule based on priority
INSERT INTO production_schedule (
  workspace_id,
  mto_id,
  scheduled_date: calculateProductionDate(mto.expected_ship_date),
  estimated_duration_minutes: mto.spots_data.length * 15, // 15 min per spot
  status: 'scheduled'
)
```

---

## 📱 STEP 5: How Each User Sees the Data

### **Brand Dashboard** sees:
```javascript
// Original Excel data preserved
{
  internal_id: "38591622",
  display_name: "Custom Icon Tote",
  status: "in_production",
  spots: 6,
  // Can access ALL original Excel fields via excel_data
  original_data: {
    shopify_order: "#2914230",
    customer_so: "SO2594588",
    po_purchase_price: 54.25,
    // ... all Excel columns
  }
}
```

### **Factory Dashboard** sees:
```javascript
// Production-focused view
{
  internal_id: "38591622",
  display_name: "Custom Icon Tote",
  quantity: 1,
  spots_to_apply: [
    "Green Script Patch",
    "Matcha Patch",
    // ...
  ],
  due_date: "2025-08-20",
  // Financial data hidden
  // But has access to production-relevant Excel fields
  packaging_code: "Care+Logo Labels",
  product_color: "Green",
  customization_text: "KM"
}
```

### **Admin Dashboard** sees:
```javascript
// Everything including financial data
{
  // All MTO data
  // All Excel fields
  // Financial information
  // Cross-brand analytics
}
```

---

## 🔍 STEP 6: Data Retrieval

### When querying MTOs, the original Excel data is always available:

```typescript
// Backend service
async getMTOById(id: string) {
  const mto = await supabase
    .from('mtos')
    .select('*')
    .eq('id', id)
    .single();
  
  return {
    ...mto,
    // Merge core fields with Excel data
    ...mto.excel_data,
    // Spots as array
    spots: mto.spots_data,
    // Original Excel columns accessible
    shopify_order: mto.excel_data.shopify_order_number,
    vendor_comments: mto.excel_data.vendor_po_comments,
    hts_code: mto.excel_data.hts_code,
    // ... any Excel field
  };
}
```

---

## ✅ Summary: Nothing is Lost!

1. **Core fields** → Stored in dedicated columns for fast queries
2. **ALL Excel fields** → Preserved in `excel_data` JSONB
3. **Spots** → Structured in `spots_data` array
4. **Auto-population** → Creates inventory, vocabulary, barcodes
5. **Original data** → Always accessible via `mto.excel_data.field_name`

This design ensures:
- ✅ No Excel data is lost
- ✅ Fast queries on important fields
- ✅ Flexible storage for any Excel format
- ✅ Auto-population to all related systems
- ✅ Each user sees relevant data based on their role