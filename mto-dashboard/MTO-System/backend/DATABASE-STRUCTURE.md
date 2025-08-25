# MTO System Database Structure - Complete Field Guide

## 📊 Database Tables Overview

### 1️⃣ **COMPANIES TABLE** (Brands & Factories)
```sql
companies
├── id (UUID) - Primary key: "11111111-1111-1111-1111-111111111111"
├── name (VARCHAR) - Company name: "Bauble Bar" or "All Brands Unlimited"
├── type (VARCHAR) - Either: "brand" or "factory"
├── code (VARCHAR) - Unique code: "BB001" or "ABU001"
├── address (TEXT) - Full address: "123 Fashion Ave, NY 10001"
├── contact_email (VARCHAR) - "orders@baublebar.com"
├── contact_phone (VARCHAR) - "+1-555-0123"
├── active (BOOLEAN) - true/false
├── settings (JSONB) - {"currency": "USD", "timezone": "EST"}
├── metadata (JSONB) - {"logo_url": "...", "capacity": 5000}
├── created_at (TIMESTAMP) - "2025-01-15 10:30:00"
└── updated_at (TIMESTAMP) - "2025-01-15 10:30:00"
```

**Sample Records:**
| id | name | type | code | contact_email | active |
|---|---|---|---|---|---|
| 11111111-... | Bauble Bar | brand | BB001 | orders@baublebar.com | true |
| 22222222-... | All Brands Unlimited | factory | ABU001 | production@abu.com | true |

---

### 2️⃣ **USERS TABLE** (System Users)
```sql
users
├── id (UUID) - "aaaa1111-..."
├── email (VARCHAR) - "john@baublebar.com"
├── password_hash (VARCHAR) - "$2b$10$..." (bcrypt hash)
├── full_name (VARCHAR) - "John Smith"
├── role (VARCHAR) - "admin" / "brand_user" / "factory_user"
├── company_id (UUID) - Links to companies.id
├── permissions (JSONB) - {"can_upload": true, "can_delete": false}
├── active (BOOLEAN) - true
├── last_login (TIMESTAMP) - "2025-01-20 14:30:00"
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Sample Records:**
| email | full_name | role | company_id |
|---|---|---|---|
| admin@mto.com | System Admin | admin | NULL |
| sarah@baublebar.com | Sarah Johnson | brand_user | 11111111-... |
| mike@abu.com | Mike Chen | factory_user | 22222222-... |

---

### 3️⃣ **WORKSPACES TABLE** (Production Groups)
```sql
workspaces
├── id (UUID) - "ws-001-..."
├── name (VARCHAR) - "BB Monthly Production - March 2025"
├── brand_id (UUID) - Links to companies.id (brand)
├── factory_id (UUID) - Links to companies.id (factory)
├── po_id (UUID) - Links to purchase_orders.id
├── type (VARCHAR) - "production" / "sample" / "rush"
├── status (VARCHAR) - "active" / "completed" / "paused"
├── production_category (VARCHAR) - "daily" / "weekly" / "monthly"
├── start_date (DATE) - "2025-03-01"
├── target_completion_date (DATE) - "2025-03-30"
├── actual_completion_date (DATE) - NULL or "2025-03-28"
├── total_mtos (INTEGER) - 150
├── completed_mtos (INTEGER) - 75
├── pending_mtos (INTEGER) - 75
├── defective_mtos (INTEGER) - 2
├── auto_assign (BOOLEAN) - true
├── priority_level (INTEGER) - 1 (1-5, higher = priority)
├── settings (JSONB) - {"notifications": true}
├── created_by (UUID) - User who created
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Sample Records:**
| name | brand | factory | category | total_mtos | status |
|---|---|---|---|---|---|
| BB Daily Rush - Jan 20 | Bauble Bar | ABU | daily | 15 | active |
| BB Weekly Batch W3 | Bauble Bar | ABU | weekly | 45 | active |
| BB Monthly Feb 2025 | Bauble Bar | ABU | monthly | 200 | active |

---

### 4️⃣ **PURCHASE_ORDERS TABLE**
```sql
purchase_orders
├── id (UUID) - "po-001-..."
├── po_number (VARCHAR) - "PO1233562"
├── brand_id (UUID) - Links to companies (brand)
├── factory_id (UUID) - Links to companies (factory)
├── workspace_id (UUID) - Links to workspace
├── status (VARCHAR) - "draft" / "assigned" / "in_production" / "completed"
├── production_category (VARCHAR) - "daily" / "weekly" / "monthly"
├── order_date (DATE) - "2025-01-15"
├── requested_ship_date (DATE) - "2025-02-15"
├── assigned_by (UUID) - Admin who assigned
├── assigned_at (TIMESTAMP) - When assigned to factory
├── total_mtos (INTEGER) - 45
├── total_quantity (INTEGER) - 250
├── total_amount (DECIMAL) - 15750.00
├── customer_code (VARCHAR) - "ECOM"
├── vendor_info (JSONB) - {"name": "ABU", "contact": "..."}
├── ship_to_info (JSONB) - {"address": "...", "method": "Air"}
├── original_file_url (TEXT) - Link to uploaded Excel
├── metadata (JSONB) - Additional data
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

### 5️⃣ **MTOS TABLE** (Main Production Items)
```sql
mtos
├── id (UUID) - Primary key
├── workspace_id (UUID) - Links to workspace
├── po_id (UUID) - Links to purchase_order
├── brand_id (UUID) - Links to brand company
├── factory_id (UUID) - Links to factory company
│
├── === CORE FIELDS ===
├── internal_id (VARCHAR) - "38591622" (from Excel)
├── po_line_id (VARCHAR) - "7"
├── display_name (VARCHAR) - "Custom Icon Tote - 14oz Natural Lined - Large"
├── reference_number (VARCHAR) - "mekanly047h8a"
├── quantity (INTEGER) - 1
│
├── === STATUS FIELDS ===
├── status (VARCHAR) - "pending" / "in_production" / "completed" / "shipped"
├── production_stage (VARCHAR) - "receive" / "cutting" / "sewing" / "customization" / "qc" / "packing"
├── production_category (VARCHAR) - "daily" / "weekly" / "monthly"
├── priority (VARCHAR) - "urgent" / "high" / "normal" / "low"
│
├── === DATE FIELDS ===
├── expected_ship_date (DATE) - "2025-08-20"
├── actual_ship_date (DATE) - NULL or actual date
├── shopify_order_date (TIMESTAMP) - "2025-08-20 14:18:00"
├── cpsd (DATE) - Customer promised ship date: "2025-09-10"
│
├── === TRACKING FIELDS ===
├── sales_order_number (VARCHAR) - "SO2594588"
├── shopify_order_number (VARCHAR) - "#2914230"
├── po_line_tracking (VARCHAR) - "1Z999AA1234567890"
│
├── === CUSTOMIZATION DATA ===
├── spots_data (JSONB) - Array of customization spots:
│   [
│     {
│       "position": 1,
│       "sku": "138263",
│       "patch_ref": "10019",
│       "description": "Custom Icon Tote Name Patch - Green Script"
│     },
│     {
│       "position": 2,
│       "sku": "131749",
│       "patch_ref": "gargy",
│       "description": "Matcha Tote Patch"
│     }
│   ]
│
├── === EXCEL DATA (All original fields) ===
├── excel_data (JSONB) - Stores ALL fields from Excel:
│   {
│     "bag_base_pid": "130559",
│     "customization_text": "KM",
│     "product_color": "Green",
│     "product_size": "Large",
│     "hts_code": "4202.12.4000",
│     "po_purchase_price": 28.70,
│     "vendor_mto_base_color": "GREEN",
│     "vendor_mto_letter_color": "Red",
│     "packaging_code": "Care+Logo Labels",
│     ... (all other Excel fields)
│   }
│
├── assigned_to (UUID) - Factory worker assigned
├── assigned_at (TIMESTAMP) - When assigned
├── created_by (UUID) - User who created
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Sample MTO Records:**
| internal_id | display_name | category | status | spots |
|---|---|---|---|---|
| 38591622 | Custom Icon Tote - Large | monthly | pending | 6 spots |
| 38403699 | Merino Wool Throw - Pink | monthly | in_production | 0 spots |
| 38575818 | Alpha Initial Tote - Medium | daily | urgent | 1 spot (KM) |

---

### 6️⃣ **INVENTORY TABLE** (Auto-populated from MTOs)
```sql
inventory
├── id (UUID)
├── sku (VARCHAR) - "138263" (unique)
├── name (VARCHAR) - "Green Script Name Patch"
├── category (VARCHAR) - "patch" / "base" / "material"
├── current_stock (INTEGER) - 1000
├── reserved_stock (INTEGER) - 45
├── available_stock (INTEGER) - 955 (auto-calculated)
├── reorder_level (INTEGER) - 100
├── factory_id (UUID) - Which factory stocks this
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

### 7️⃣ **BRAND_FACTORY_ASSIGNMENTS TABLE** (Admin manages)
```sql
brand_factory_assignments
├── id (UUID)
├── brand_id (UUID) - Links to brand company
├── factory_id (UUID) - Links to factory company
├── active (BOOLEAN) - true
├── assigned_by (UUID) - Admin who created
├── assignment_type (VARCHAR) - "standard" / "preferred" / "exclusive"
├── capacity_allocation (INTEGER) - 60 (percentage)
├── priority_level (INTEGER) - 1 (1-5)
├── settings (JSONB) - {"auto_assign": true}
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Sample Assignments:**
| Brand | Factory | Type | Capacity | Priority |
|---|---|---|---|---|
| Bauble Bar | ABU | preferred | 60% | 1 |
| Bauble Bar | Factory Two | standard | 40% | 2 |

---

## 🔄 Data Flow Example

### When Brand Uploads Excel:

1. **Excel Row** (from your sample):
```
Internal ID: 38591622
Display Name: Custom Icon Tote - 14oz Natural Lined - Large
Spots: 138263, 131749, 128678, 129595, 129585, 129568
Ship Date: 8/20/2025
```

2. **Creates Purchase Order**:
```json
{
  "po_number": "PO1233562",
  "brand_id": "11111111-...",
  "status": "assigned",
  "production_category": "monthly"
}
```

3. **Creates Workspace**:
```json
{
  "name": "BB Monthly Production - Aug 2025",
  "brand_id": "11111111-...",
  "factory_id": "22222222-...",
  "production_category": "monthly",
  "total_mtos": 45
}
```

4. **Creates MTO**:
```json
{
  "internal_id": "38591622",
  "display_name": "Custom Icon Tote - 14oz Natural Lined - Large",
  "spots_data": [
    {"position": 1, "sku": "138263", "description": "Green Script Patch"},
    {"position": 2, "sku": "131749", "description": "Matcha Patch"}
  ],
  "excel_data": {/* all original Excel fields */}
}
```

5. **Auto-populates Inventory**:
```json
{
  "sku": "138263",
  "name": "Green Script Patch",
  "current_stock": 1000
}
```

---

## 📱 Dashboard Views

### Brand sees:
- Their workspaces grouped by category (daily/weekly/monthly)
- Progress of each workspace
- MTO statuses

### Factory sees:
- Assigned workspaces from different brands
- Production schedule
- Pending work by priority

### Admin sees:
- All brands and factories
- Can create assignments
- Full system overview

This is the complete database structure with all fields and how they interconnect!