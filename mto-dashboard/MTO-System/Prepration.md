# MTO Platform - Complete Development Guidelines
## Full Implementation Guide for Autonomous Development

---

# 📚 TABLE OF CONTENTS

1. [Project Setup & Configuration](#1-project-setup--configuration)
2. [Database Setup with Supabase](#2-database-setup-with-supabase)
3. [Frontend Implementation](#3-frontend-implementation)
4. [Backend API Development](#4-backend-api-development)
5. [Feature Implementation Guide](#5-feature-implementation-guide)
6. [Testing & Quality Assurance](#6-testing--quality-assurance)
7. [Deployment Guide](#7-deployment-guide)
8. [Post-Launch Operations](#8-post-launch-operations)

---
# MTO Platform - Complete System Architecture & Implementation Guide
## Full Project Structure, Database, Components & Supabase Setup

---

# 🏗️ COMPLETE PROJECT STRUCTURE

```
mto-platform/
│
├── 📁 frontend/                    # Next.js Application (Vercel)
│   ├── 📁 app/                     # App Router (Next.js 14)
│   │   ├── 📁 (auth)/              # Authentication Routes
│   │   │   ├── 📁 login/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 register/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── 📁 (dashboard)/         # Protected Dashboard Routes
│   │   │   ├── 📁 brand/           # Brand Portal
│   │   │   │   ├── 📁 dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 upload/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 pos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [poId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── 📁 mtos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [mtoId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── 📁 vocabulary/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── upload/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── mapping/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── 📁 inventory/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 defects/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 shipping/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── 📁 sync/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── 📁 factory/         # Factory Portal
│   │   │   │   ├── 📁 workboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 production/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 inventory/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 defects/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 vocabulary/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── 📁 shipping/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── 📁 admin/           # Admin Panel
│   │   │   │   ├── 📁 users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 companies/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 oversight/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── 📁 reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── layout.tsx          # Dashboard Layout
│   │   │
│   │   ├── 📁 api/                 # API Routes
│   │   │   ├── 📁 webhook/
│   │   │   │   └── route.ts
│   │   │   └── 📁 upload/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx              # Root Layout
│   │   ├── page.tsx                # Home Page
│   │   └── globals.css             # Global Styles
│   │
│   ├── 📁 components/              # React Components
│   │   ├── 📁 mto/                 # MTO Components
│   │   │   ├── MTOCompactCard.tsx
│   │   │   ├── MTODetailModal.tsx
│   │   │   ├── MTOTable.tsx
│   │   │   ├── MTOStatusFlow.tsx
│   │   │   ├── MTOSpotView.tsx
│   │   │   ├── MTOWorkboard.tsx
│   │   │   ├── MTOBulkActions.tsx
│   │   │   └── MTOExcelUploader.tsx
│   │   │
│   │   ├── 📁 vocabulary/          # Vocabulary Management
│   │   │   ├── VocabularyUploader.tsx
│   │   │   ├── VocabularyMapper.tsx
│   │   │   ├── PatchLibrary.tsx
│   │   │   ├── SpotTranslator.tsx
│   │   │   ├── IconWall.tsx
│   │   │   └── SKUMatcher.tsx
│   │   │
│   │   ├── 📁 barcode/             # Barcode System
│   │   │   ├── BarcodeGenerator.tsx
│   │   │   ├── BarcodeScanner.tsx
│   │   │   ├── SpotBarcode.tsx
│   │   │   ├── LineBarcode.tsx
│   │   │   ├── MasterBarcode.tsx
│   │   │   ├── POBarcode.tsx
│   │   │   └── BulkPrint.tsx
│   │   │
│   │   ├── 📁 defect/              # Defect Management
│   │   │   ├── DefectScanner.tsx
│   │   │   ├── DefectWorkflow.tsx
│   │   │   ├── ReplacementMTO.tsx
│   │   │   ├── DefectQueue.tsx
│   │   │   └── QCPhotoUpload.tsx
│   │   │
│   │   ├── 📁 inventory/           # Inventory Management
│   │   │   ├── InventoryDashboard.tsx
│   │   │   ├── StockTracker.tsx
│   │   │   ├── MaterialAllocation.tsx
│   │   │   ├── ShortageAlerts.tsx
│   │   │   └── AutoPopulator.tsx
│   │   │
│   │   ├── 📁 shipping/            # Shipping & Tracking
│   │   │   ├── AWBTracker.tsx
│   │   │   ├── MasterCartonView.tsx
│   │   │   ├── ShipmentStatus.tsx
│   │   │   ├── DeliveryTracking.tsx
│   │   │   └── PackingList.tsx
│   │   │
│   │   ├── 📁 sync/                # Integration & Sync
│   │   │   ├── NetSuiteSync.tsx
│   │   │   ├── SyncStatus.tsx
│   │   │   ├── DataFlow.tsx
│   │   │   ├── ErrorLog.tsx
│   │   │   └── SyncScheduler.tsx
│   │   │
│   │   ├── 📁 chat/                # Communication
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── QCPhotoShare.tsx
│   │   │   └── ChatRoom.tsx
│   │   │
│   │   ├── 📁 analytics/           # Analytics & Reports
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TopProducts.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   ├── ZipAnalytics.tsx
│   │   │   ├── AQLReport.tsx
│   │   │   └── ExportReport.tsx
│   │   │
│   │   ├── 📁 ui/                  # UI Components (Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   └── 📁 shared/              # Shared Components
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Footer.tsx
│   │       ├── LanguageToggle.tsx
│   │       ├── NotificationCenter.tsx
│   │       ├── UserMenu.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── 📁 lib/                     # Libraries & Utilities
│   │   ├── 📁 types/               # TypeScript Types
│   │   │   ├── mto.ts
│   │   │   ├── vocabulary.ts
│   │   │   ├── inventory.ts
│   │   │   ├── barcode.ts
│   │   │   ├── defect.ts
│   │   │   ├── shipment.ts
│   │   │   ├── chat.ts
│   │   │   ├── user.ts
│   │   │   └── database.ts
│   │   │
│   │   ├── 📁 supabase/            # Supabase Configuration
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── auth.ts
│   │   │
│   │   ├── 📁 utils/               # Utility Functions
│   │   │   ├── excel-parser.ts
│   │   │   ├── csv-parser.ts
│   │   │   ├── barcode-generator.ts
│   │   │   ├── awb-tracker.ts
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   ├── date-helpers.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── 📁 hooks/               # React Hooks
│   │   │   ├── useMTOs.ts
│   │   │   ├── useVocabulary.ts
│   │   │   ├── useInventory.ts
│   │   │   ├── useDefects.ts
│   │   │   ├── useRealtime.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useUpload.ts
│   │   │   ├── useBarcode.ts
│   │   │   └── useChat.ts
│   │   │
│   │   └── 📁 translations/        # i18n Translations
│   │       ├── en.json
│   │       ├── cn.json
│   │       ├── vn.json
│   │       ├── kh.json
│   │       ├── th.json
│   │       ├── es.json
│   │       ├── fr.json
│   │       ├── de.json
│   │       ├── ja.json
│   │       └── ko.json
│   │
│   ├── 📁 public/                  # Static Assets
│   │   ├── 📁 images/
│   │   ├── 📁 icons/
│   │   └── 📁 fonts/
│   │
│   ├── 📁 styles/                  # Additional Styles
│   │   └── components.css
│   │
│   ├── .env.local                  # Environment Variables
│   ├── .gitignore
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── 📁 backend/                     # Express.js API (Railway)
│   ├── 📁 src/
│   │   ├── 📁 config/              # Configuration
│   │   │   ├── database.ts
│   │   │   ├── supabase.ts
│   │   │   ├── redis.ts
│   │   │   ├── socket.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── 📁 controllers/         # Route Controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── mto.controller.ts
│   │   │   ├── po.controller.ts
│   │   │   ├── vocabulary.controller.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── barcode.controller.ts
│   │   │   ├── defect.controller.ts
│   │   │   ├── shipment.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── sync.controller.ts
│   │   │   └── analytics.controller.ts
│   │   │
│   │   ├── 📁 services/            # Business Logic
│   │   │   ├── auth.service.ts
│   │   │   ├── mto.service.ts
│   │   │   ├── po.service.ts
│   │   │   ├── vocabulary.service.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── barcode.service.ts
│   │   │   ├── defect.service.ts
│   │   │   ├── shipment.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   ├── excel.service.ts
│   │   │   └── netsuite.service.ts
│   │   │
│   │   ├── 📁 routes/              # API Routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── mto.routes.ts
│   │   │   ├── po.routes.ts
│   │   │   ├── vocabulary.routes.ts
│   │   │   ├── inventory.routes.ts
│   │   │   ├── barcode.routes.ts
│   │   │   ├── defect.routes.ts
│   │   │   ├── shipment.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── sync.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 middleware/          # Express Middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── logging.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   │
│   │   ├── 📁 models/              # Data Models
│   │   │   ├── mto.model.ts
│   │   │   ├── po.model.ts
│   │   │   ├── vocabulary.model.ts
│   │   │   ├── inventory.model.ts
│   │   │   └── user.model.ts
│   │   │
│   │   ├── 📁 validators/          # Request Validation
│   │   │   ├── mto.validator.ts
│   │   │   ├── po.validator.ts
│   │   │   └── common.validator.ts
│   │   │
│   │   ├── 📁 jobs/                # Background Jobs
│   │   │   ├── email.job.ts
│   │   │   ├── inventory-sync.job.ts
│   │   │   ├── awb-tracker.job.ts
│   │   │   ├── report-generator.job.ts
│   │   │   └── cleanup.job.ts
│   │   │
│   │   ├── 📁 utils/               # Utilities
│   │   │   ├── logger.ts
│   │   │   ├── helpers.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── app.ts                  # Express App
│   │   └── server.ts               # Server Entry Point
│   │
│   ├── 📁 tests/                   # Tests
│   │   ├── 📁 unit/
│   │   ├── 📁 integration/
│   │   └── 📁 e2e/
│   │
│   ├── .env                        # Environment Variables
│   ├── .gitignore
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── 📁 supabase/                    # Supabase Configuration
│   ├── 📁 migrations/              # Database Migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_companies_users.sql
│   │   ├── 003_purchase_orders.sql
│   │   ├── 004_mtos.sql
│   │   ├── 005_vocabulary.sql
│   │   ├── 006_inventory.sql
│   │   ├── 007_barcodes.sql
│   │   ├── 008_defects.sql
│   │   ├── 009_shipments.sql
│   │   ├── 010_chat.sql
│   │   ├── 011_notifications.sql
│   │   ├── 012_analytics.sql
│   │   ├── 013_functions.sql
│   │   ├── 014_triggers.sql
│   │   ├── 015_indexes.sql
│   │   └── 016_rls_policies.sql
│   │
│   ├── 📁 functions/               # Database Functions
│   │   ├── create_replacement_mto.sql
│   │   ├── translate_vocabulary.sql
│   │   ├── generate_barcode.sql
│   │   ├── check_inventory.sql
│   │   └── update_po_progress.sql
│   │
│   ├── 📁 seed/                    # Seed Data
│   │   ├── companies.sql
│   │   ├── users.sql
│   │   └── sample_data.sql
│   │
│   └── config.toml                 # Supabase Config
│
├── 📁 docs/                        # Documentation
│   ├── 📁 api/
│   ├── 📁 user-guides/
│   ├── 📁 deployment/
│   └── README.md
│
├── 📁 scripts/                     # Utility Scripts
│   ├── deploy.sh
│   ├── backup.sh
│   ├── migrate.sh
│   └── test.sh
│
├── .gitignore
├── README.md
├── package.json                    # Root Package
└── docker-compose.yml              # Docker Config
```

---

# 💾 COMPLETE DATABASE SCHEMA (SUPABASE)

## Core Tables Structure

```sql
-- ============================================
-- 1. COMPANIES & USERS
-- ============================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('brand', 'factory')),
    code VARCHAR(50) UNIQUE,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    settings JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('admin', 'brand_manager', 'factory_operator', 'viewer')),
    company_id UUID REFERENCES companies(id),
    language VARCHAR(5) DEFAULT 'en',
    avatar_url TEXT,
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PURCHASE ORDERS
-- ============================================

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    brand_id UUID REFERENCES companies(id),
    factory_id UUID REFERENCES companies(id),
    status VARCHAR(50) DEFAULT 'not_started',
    production_stage VARCHAR(50),
    progress INT DEFAULT 0,
    order_date DATE,
    xf_date DATE,
    expected_ship_date DATE,
    actual_ship_date DATE,
    total_mtos INT DEFAULT 0,
    completed_mtos INT DEFAULT 0,
    defective_mtos INT DEFAULT 0,
    original_file_url TEXT,
    netsuite_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MTOS (COMPLETE STRUCTURE FROM EXCEL)
-- ============================================

CREATE TABLE mtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id),
    
    -- Excel Columns A-B
    internal_id VARCHAR(100),
    po_line_id VARCHAR(50),
    
    -- Excel Columns C-D
    expected_ship_date DATE,
    actual_ship_date DATE,
    
    -- Excel Columns E-G
    po_line_tracking VARCHAR(100),
    awb VARCHAR(100),
    master_carton VARCHAR(100),
    
    -- Excel Column H
    vendor_po_status VARCHAR(50),
    
    -- Excel Columns I-L
    order_submit_date DATE,
    so_date DATE,
    shopify_order_date TIMESTAMPTZ,
    sales_order_number VARCHAR(100),
    
    -- Excel Column M
    cpsd DATE,
    
    -- Excel Columns N-P
    display_name VARCHAR(500),
    reference_number VARCHAR(100),
    quantity INT DEFAULT 1,
    
    -- Excel Columns Q-V (6 Spots)
    spot1 VARCHAR(100),
    spot2 VARCHAR(100),
    spot3 VARCHAR(100),
    spot4 VARCHAR(100),
    spot5 VARCHAR(100),
    spot6 VARCHAR(100),
    
    -- Excel Column W
    bag_base_pid VARCHAR(100),
    
    -- Excel Columns X-AC (Patch References)
    spot1_patch_ref VARCHAR(255),
    spot2_patch_ref VARCHAR(255),
    spot3_patch_ref VARCHAR(255),
    spot4_patch_ref VARCHAR(255),
    spot5_patch_ref VARCHAR(255),
    spot6_patch_ref VARCHAR(255),
    
    -- Additional Fields
    product_category VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    material VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    production_stage VARCHAR(50),
    production_category VARCHAR(50) DEFAULT 'monthly',
    priority VARCHAR(20) DEFAULT 'normal',
    progress INT DEFAULT 0,
    
    -- QC Fields
    qc_status VARCHAR(50),
    qc_date DATE,
    qc_notes TEXT,
    qc_photos TEXT[],
    
    -- Defect Fields
    is_replacement BOOLEAN DEFAULT false,
    is_rush BOOLEAN DEFAULT false,
    defect_type VARCHAR(50),
    defect_description TEXT,
    parent_mto_id UUID REFERENCES mtos(id),
    
    -- Chat
    chat_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(po_id, po_line_id)
);

-- ============================================
-- 4. VOCABULARY MAPPING
-- ============================================

CREATE TABLE vocabulary_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES companies(id),
    factory_id UUID REFERENCES companies(id),
    
    -- Brand Side
    brand_sku VARCHAR(100) NOT NULL,
    brand_pid VARCHAR(100),
    brand_description TEXT,
    brand_category VARCHAR(100),
    brand_subcategory VARCHAR(100),
    
    -- Factory Side
    factory_patch_id VARCHAR(100) NOT NULL,
    factory_patch_ref VARCHAR(255),
    factory_description TEXT,
    factory_material_code VARCHAR(100),
    
    -- Visual Details
    patch_type VARCHAR(50),
    patch_size VARCHAR(50),
    patch_position VARCHAR(20),
    color_codes JSONB,
    
    -- Images
    patch_image_url TEXT,
    patch_thumbnail_url TEXT,
    design_file_url TEXT,
    
    -- Production
    thread_colors TEXT[],
    stitch_count INT,
    production_time_minutes INT,
    complexity_level VARCHAR(20),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,
    tags TEXT[],
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ
# 1. PROJECT SETUP & CONFIGURATION

## 1.1 Initial Repository Setup

### Create Project Structure
```bash
# Create main project directory
mkdir mto-platform && cd mto-platform

# Initialize git repository
git init
git branch -M mainCompiled with problems:
×
ERROR in ./src/index.tsx 7:0-24
Module not found: Error: Can't resolve './App' in '/Users/segevbin/Desktop/Peak1031 V1/frontend/src'

# Create project structure
mkdir -p frontend backend supabase docs scripts
```

### Initialize Package Manager
```bash
# Create root package.json for monorepo
cat > package.json << 'EOF'
{
  "name": "mto-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "start": "concurrently \"npm run start:frontend\" \"npm run start:backend\"",
    "start:frontend": "cd frontend && npm run start",
    "start:backend": "cd backend && npm run start",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

npm install
```

## 1.2 Frontend Setup (Next.js)

### Create Next.js Application
```bash
cd frontend

# Initialize Next.js with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias="@/*"

# Install all required dependencies
npm install \
  @supabase/supabase-js \
  @supabase/auth-helpers-nextjs \
  @supabase/auth-helpers-react \
  @tanstack/react-query \
  @tanstack/react-table \
  zustand \
  react-hook-form \
  zod \
  @hookform/resolvers \
  xlsx \
  papaparse \
  qrcode \
  react-qr-scanner \
  recharts \
  date-fns \
  lucide-react \
  framer-motion \
  sonner \
  clsx \
  tailwind-merge \
  class-variance-authority \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  @radix-ui/react-checkbox \
  @radix-ui/react-switch \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-scroll-area \
  cmdk \
  socket.io-client \
  js-cookie \
  @vercel/analytics

# Install dev dependencies
npm install -D \
  @types/qrcode \
  @types/papaparse \
  @types/js-cookie \
  prettier \
  eslint-config-prettier \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  jest-environment-jsdom
```

### Configure Next.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'your-supabase-project.supabase.co',
      'api.qrserver.com'
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### Configure TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Configure Tailwind CSS
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

## 1.3 Backend Setup (Express.js)

### Initialize Backend
```bash
cd ../backend

# Initialize package.json
npm init -y

# Install production dependencies
npm install \
  express \
  cors \
  helmet \
  morgan \
  compression \
  dotenv \
  @supabase/supabase-js \
  multer \
  xlsx \
  csv-parse \
  papaparse \
  qrcode \
  joi \
  express-validator \
  bull \
  ioredis \
  node-cron \
  winston \
  winston-daily-rotate-file \
  jsonwebtoken \
  bcryptjs \
  axios \
  @sendgrid/mail \
  twilio \
  socket.io

# Install dev dependencies
npm install -D \
  @types/node \
  @types/express \
  @types/cors \
  @types/multer \
  @types/bcryptjs \
  @types/jsonwebtoken \
  nodemon \
  typescript \
  ts-node \
  jest \
  supertest \
  @types/jest \
  @types/supertest
```

### Configure TypeScript for Backend
```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Configure Backend Scripts
```json
// backend/package.json - add these scripts
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

## 1.4 Environment Configuration

### Frontend Environment Variables
```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_SCANNER=true
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

### Backend Environment Variables
```bash
# backend/.env
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis (for Railway deployment)
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@mto-platform.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# NetSuite (Optional)
NETSUITE_ACCOUNT_ID=xxxxx
NETSUITE_CONSUMER_KEY=xxxxx
NETSUITE_CONSUMER_SECRET=xxxxx
NETSUITE_TOKEN_ID=xxxxx
NETSUITE_TOKEN_SECRET=xxxxx

# AWS S3 (Optional for file storage)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
S3_BUCKET=mto-uploads
```

---

# 2. DATABASE SETUP WITH SUPABASE

## 2.1 Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter project details:
   - Organization: Your Organization
   - Project name: `mto-platform`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier for development

## 2.2 Database Schema Setup

### Run Complete Schema Migration
```sql
-- Create this file: supabase/migrations/001_complete_schema.sql
-- Then run it in Supabase SQL Editor

-- Copy the ENTIRE database schema from the previous documentation
-- This includes all tables, indexes, functions, triggers, and RLS policies
```

## 2.3 Configure Row Level Security (RLS)

### Enable RLS on All Tables
```sql
-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies
```sql
-- Companies: Users can view their own company
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- MTOs: Users can view MTOs for their company
CREATE POLICY "Users can view company MTOs" ON mtos
    FOR SELECT USING (
        po_id IN (
            SELECT id FROM purchase_orders 
            WHERE brand_id IN (SELECT company_id FROM users WHERE id = auth.uid())
               OR factory_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

-- Add similar policies for all tables
```

## 2.4 Configure Realtime Subscriptions

### Enable Realtime for Tables
```sql
-- In Supabase Dashboard > Database > Replication
-- Enable replication for these tables:
-- - mtos
-- - chat_messages
-- - notifications
-- - inventory
-- - defects
```

## 2.5 Create Initial Data

### Seed Initial Companies and Users
```sql
-- Insert test companies
INSERT INTO companies (name, type, code) VALUES
    ('BaubleBar', 'brand', 'BB001'),
    ('Factory One', 'factory', 'F001'),
    ('Factory Two', 'factory', 'F002');

-- Create test users (use Supabase Auth)
-- Go to Authentication > Users > Invite User
```

---

# 3. FRONTEND IMPLEMENTATION

## 3.1 Project Structure Setup

### Create Complete Folder Structure
```bash
cd frontend

# Create all directories
mkdir -p app/{(auth)/{login,register},(dashboard)/{brand/{dashboard,upload,pos,mtos,vocabulary,inventory,defects,shipping,analytics,sync},factory/{workboard,production,inventory,defects,vocabulary,shipping},admin/{users,companies,oversight,reports}},api/webhook}

mkdir -p components/{mto,vocabulary,barcode,defect,inventory,shipping,sync,chat,analytics,ui,shared}

mkdir -p lib/{types,supabase,utils,hooks,translations}

mkdir -p public/images
```

## 3.2 Core Configuration Files

### Configure Supabase Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Configure Providers
```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## 3.3 Type Definitions

### Complete MTO Type Definition
```typescript
// lib/types/mto.ts
export interface MTO {
  // System fields
  id: string
  po_id: string
  
  // Excel Column A-B: Core IDs
  internal_id: string // "37483586"
  po_line_id: string // "6", "12"
  
  // Excel Column C-D: Ship Dates
  expected_ship_date: Date | null
  actual_ship_date: Date | null
  
  // Excel Column E-G: Tracking
  po_line_tracking: string | null
  awb: string | null
  master_carton: string | null
  
  // Excel Column H: Status
  vendor_po_status: string | null
  
  // Excel Column I-L: Order Dates
  order_submit_date: Date | null
  so_date: Date | null
  shopify_order_date: Date | null
  sales_order_number: string | null // "SO2508459"
  
  // Excel Column M: CPSD
  cpsd: Date | null
  
  // Excel Column N-P: Product Info
  display_name: string // "Custom Tote Bag - 14oz Natural Lined - Medium"
  reference_number: string // "md6a4z3j45we9"
  quantity: number
  
  // Excel Column Q-V: 6 Spots
  spot1: string | null // "129559"
  spot2: string | null // "137234"
  spot3: string | null // "128687"
  spot4: string | null // "128698"
  spot5: string | null // "128954"
  spot6: string | null
  
  // Excel Column W: Base Product
  bag_base_pid: string // "133938"
  
  // Excel Column X-AC: Spot Patch References
  spot1_patch_ref: string | null // "63 Camera Icon"
  spot2_patch_ref: string | null // "171 Music Notes Icon"
  spot3_patch_ref: string | null // "17 Spicy Margarita Icon"
  spot4_patch_ref: string | null // "30 Airplane Icon"
  spot5_patch_ref: string | null // "38 H - Classic Letter"
  spot6_patch_ref: string | null
  
  // Additional fields
  product_category: string | null
  status: MTOStatus
  production_stage: ProductionStage | null
  production_category: 'daily' | 'monthly'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  
  // Defect handling
  is_replacement: boolean
  is_rush: boolean
  defect_type: DefectType | null
  parent_mto_id: string | null
  
  // Metadata
  created_at: Date
  updated_at: Date
}

export type MTOStatus = 'pending' | 'proceed' | 'qc' | 'shipping' | 'shipped'
export type ProductionStage = 'receive' | 'cutting' | 'sewing' | 'embroidery' | 'qc' | 'packing' | 'ready'
export type DefectType = 'missing' | 'defect_bag' | 'production_defect' | 'embroidery_defect'
```

## 3.4 Component Implementation

### MTO Compact Card Component
```tsx
// components/mto/MTOCompactCard.tsx
// Use the complete implementation from previous documentation
```

### Excel Parser Utility
```typescript
// lib/utils/excel-parser.ts
import * as XLSX from 'xlsx'
import { MTO } from '@/lib/types/mto'

export async function parseMTOExcel(file: File): Promise<Partial<MTO>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          blankrows: false,
        })

        // Skip header row and map to MTO format
        const mtos: Partial<MTO>[] = jsonData.slice(1).map((row: any) => ({
          internal_id: row[0]?.toString() || '',
          po_line_id: row[1]?.toString() || '',
          expected_ship_date: parseExcelDate(row[2]),
          actual_ship_date: parseExcelDate(row[3]),
          po_line_tracking: row[4]?.toString() || null,
          awb: row[5]?.toString() || null,
          master_carton: row[6]?.toString() || null,
          vendor_po_status: row[7]?.toString() || null,
          order_submit_date: parseExcelDate(row[8]),
          so_date: parseExcelDate(row[9]),
          shopify_order_date: parseExcelDate(row[10]),
          sales_order_number: row[11]?.toString() || null,
          cpsd: parseExcelDate(row[12]),
          display_name: row[13]?.toString() || '',
          reference_number: row[14]?.toString() || '',
          quantity: parseInt(row[15]) || 1,
          spot1: row[16]?.toString() || null,
          spot2: row[17]?.toString() || null,
          spot3: row[18]?.toString() || null,
          spot4: row[19]?.toString() || null,
          spot5: row[20]?.toString() || null,
          spot6: row[21]?.toString() || null,
          bag_base_pid: row[22]?.toString() || '',
          spot1_patch_ref: row[23]?.toString() || null,
          spot2_patch_ref: row[24]?.toString() || null,
          spot3_patch_ref: row[25]?.toString() || null,
          spot4_patch_ref: row[26]?.toString() || null,
          spot5_patch_ref: row[27]?.toString() || null,
          spot6_patch_ref: row[28]?.toString() || null,
          status: 'pending' as const,
          production_category: determineCategory(row[2]), // Based on expected ship date
          priority: determinePriority(row[2]),
          is_replacement: false,
          is_rush: false,
        })).filter(mto => mto.internal_id)

        resolve(mtos)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

function parseExcelDate(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') {
    const excelEpoch = new Date(1900, 0, 1)
    const msPerDay = 24 * 60 * 60 * 1000
    return new Date(excelEpoch.getTime() + (value - 2) * msPerDay)
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }
  return null
}

function determineCategory(shipDate: any): 'daily' | 'monthly' {
  if (!shipDate) return 'monthly'
  const date = parseExcelDate(shipDate)
  if (!date) return 'monthly'
  const daysUntilShip = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return daysUntilShip <= 7 ? 'daily' : 'monthly'
}

function determinePriority(shipDate: any): 'urgent' | 'high' | 'normal' | 'low' {
  const category = determineCategory(shipDate)
  return category === 'daily' ? 'urgent' : 'normal'
}
```

---

# 4. BACKEND API DEVELOPMENT

## 4.1 Server Setup

### Main Server File
```typescript
// backend/src/server.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(compression())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('combined'))

// Routes
import authRoutes from './routes/auth.routes'
import mtoRoutes from './routes/mto.routes'
import poRoutes from './routes/po.routes'
import vocabularyRoutes from './routes/vocabulary.routes'
import inventoryRoutes from './routes/inventory.routes'
import barcodeRoutes from './routes/barcode.routes'
import defectRoutes from './routes/defect.routes'
import shipmentRoutes from './routes/shipment.routes'
import chatRoutes from './routes/chat.routes'
import syncRoutes from './routes/sync.routes'

app.use('/api/auth', authRoutes)
app.use('/api/mtos', mtoRoutes)
app.use('/api/pos', poRoutes)
app.use('/api/vocabulary', vocabularyRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/barcodes', barcodeRoutes)
app.use('/api/defects', defectRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/sync', syncRoutes)

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
    console.log(`Socket ${socket.id} joined room: ${roomId}`)
  })

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

// Make io accessible in routes
app.set('io', io)

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
})
```

## 4.2 API Routes Implementation

### MTO Routes
```typescript
// backend/src/routes/mto.routes.ts
import { Router } from 'express'
import { MTOController } from '../controllers/mto.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validation'
import { mtoValidation } from '../validations/mto.validation'
import multer from 'multer'

const router = Router()
const upload = multer({ memory: true })
const controller = new MTOController()

// All routes require authentication
router.use(authenticate)

// GET routes
router.get('/', controller.getMTOs)
router.get('/:id', controller.getMTO)
router.get('/:id/barcodes', controller.getMTOBarcodes)
router.get('/:id/chat', controller.getMTOChat)

// POST routes
router.post('/', validate(mtoValidation.create), controller.createMTO)
router.post('/upload', upload.single('file'), controller.uploadMTOs)
router.post('/:id/status', validate(mtoValidation.updateStatus), controller.updateMTOStatus)
router.post('/:id/defect', validate(mtoValidation.reportDefect), controller.reportDefect)
router.post('/:id/replacement', controller.createReplacementMTO)

// PUT routes
router.put('/:id', validate(mtoValidation.update), controller.updateMTO)
router.put('/bulk', validate(mtoValidation.bulkUpdate), controller.bulkUpdateMTOs)

// DELETE routes
router.delete('/:id', controller.deleteMTO)

export default router
```

---

# 5. FEATURE IMPLEMENTATION GUIDE

## 5.1 Excel Upload Feature

### Implementation Steps
1. **Frontend**: Create upload UI with drag-drop
2. **Parse Excel**: Extract MTO data using XLSX
3. **Validate Data**: Check required fields
4. **Categorize**: Determine daily/monthly based on dates
5. **Auto-populate Inventory**: Extract spots and create inventory items
6. **Generate Barcodes**: Create QR codes for each spot
7. **Send to Backend**: POST to `/api/mtos/upload`
8. **Store in Database**: Bulk insert with Supabase
9. **Real-time Update**: Emit socket event for live updates

### Code Example
```typescript
// Complete upload handler
async function handleMTOUpload(file: File) {
  try {
    // 1. Parse Excel
    const mtos = await parseMTOExcel(file)
    
    // 2. Categorize
    const categorizedMTOs = mtos.map(mto => ({
      ...mto,
      production_category: determineCategory(mto.expected_ship_date),
      priority: determinePriority(mto.expected_ship_date, mto.is_rush)
    }))
    
    // 3. Upload to backend
    const formData = new FormData()
    formData.append('file', file)
    formData.append('data', JSON.stringify(categorizedMTOs))
    
    const response = await fetch('/api/mtos/upload', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    // 4. Auto-populate inventory
    await populateInventoryFromMTOs(result.mtos)
    
    // 5. Generate barcodes
    await generateBarcodesForMTOs(result.mtos)
    
    return result
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
```

## 5.2 Chat System Implementation

### Per-MTO Chat Setup
1. **Create chat room** when MTO created
2. **Join room** when user opens MTO
3. **Real-time messages** via WebSocket
4. **File sharing** for QC photos
5. **Threading** for conversations
6. **Notifications** for mentions

### Implementation
```typescript
// Chat room creation
async function createMTOChatRoom(mtoId: string) {
  const { data: room } = await supabase
    .from('chat_rooms')
    .insert({
      room_type: 'mto',
      mto_id: mtoId,
      room_name: `MTO Chat - ${mtoId}`,
      is_active: true
    })
    .select()
    .single()
  
  return room
}

// Real-time subscription
const subscription = supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    // Handle new message
    addMessageToUI(payload.new)
  })
  .subscribe()
```

## 5.3 Barcode Generation System

### 4-Level Barcode Structure
1. **Spot Level**: Individual customization point
2. **Line Level**: Complete MTO
3. **Master Level**: Master carton
4. **PO Level**: Full purchase order

### Implementation
```typescript
// Generate all barcodes for MTO
async function generateMTOBarcodes(mto: MTO) {
  const barcodes = []
  
  // 1. Line barcode
  barcodes.push({
    type: 'line',
    value: `PO:${mto.po_id}|LINE:${mto.po_line_id}|REF:${mto.reference_number}`,
    mto_id: mto.id
  })
  
  // 2. Spot barcodes
  for (let i = 1; i <= 6; i++) {
    const spotSKU = mto[`spot${i}` as keyof MTO]
    if (spotSKU) {
      barcodes.push({
        type: 'spot',
        value: `PO:${mto.po_id}|LINE:${mto.po_line_id}|SPOT:${i}|SKU:${spotSKU}`,
        mto_id: mto.id,
        spot_number: i
      })
    }
  }
  
  // 3. Generate QR codes
  for (const barcode of barcodes) {
    barcode.qr_image = await QRCode.toDataURL(barcode.value)
  }
  
  // 4. Save to database
  await supabase.from('barcodes').insert(barcodes)
  
  return barcodes
}
```

## 5.4 Defect Management Workflow

### Complete Defect Flow
1. **Scan barcode** to identify MTO
2. **Select defect type** (missing, defect_bag, production_defect, embroidery_defect)
3. **Take QC photos** and attach
4. **Create replacement MTO** with rush priority
5. **Update original MTO** status
6. **Notify relevant parties**
7. **Track in defect queue**

### Implementation
```typescript
// Defect reporting flow
async function reportDefect(mtoId: string, defectData: DefectReport) {
  // 1. Create defect record
  const { data: defect } = await supabase
    .from('defects')
    .insert({
      mto_id: mtoId,
      defect_type: defectData.type,
      description: defectData.description,
      qc_photos: defectData.photos,
      severity: determineSeverity(defectData.type),
      status: 'identified'
    })
    .select()
    .single()
  
  // 2. Create replacement MTO
  const { data: replacement } = await supabase.rpc(
    'create_replacement_mto',
    {
      p_original_mto_id: mtoId,
      p_defect_type: defectData.type
    }
  )
  
  // 3. Update defect with replacement
  await supabase
    .from('defects')
    .update({ replacement_mto_id: replacement.id })
    .eq('id', defect.id)
  
  // 4. Send notifications
  await sendDefectNotifications(defect, replacement)
  
  // 5. Emit real-time update
  io.to(`po:${replacement.po_id}`).emit('defect:reported', {
    defect,
    replacement
  })
  
  return { defect, replacement }
}
```

## 5.5 Inventory Auto-Population

### Auto-Population Flow
1. **Parse uploaded MTOs**
2. **Extract all spots** (1-6)
3. **Group by SKU**
4. **Calculate quantities**
5. **Create/update inventory items**
6. **Link to MTOs**
7. **Set shortage alerts**

### Implementation
```typescript
// Auto-populate inventory from MTOs
async function populateInventoryFromMTOs(mtos: MTO[]) {
  const inventoryMap = new Map<string, InventoryItem>()
  
  // Process each MTO
  for (const mto of mtos) {
    // Process each spot
    for (let spot = 1; spot <= 6; spot++) {
      const spotSKU = mto[`spot${spot}` as keyof MTO]
      const spotRef = mto[`spot${spot}_patch_ref` as keyof MTO]
      
      if (spotSKU) {
        if (inventoryMap.has(spotSKU)) {
          // Update existing
          const item = inventoryMap.get(spotSKU)!
          item.quantity_needed += mto.quantity
          item.mto_ids.push(mto.id)
        } else {
          // Create new
          inventoryMap.set(spotSKU, {
            item_code: spotSKU,
            item_name: spotRef || `Patch ${spotSKU}`,
            category: 'patch',
            production_category: mto.production_category,
            quantity_needed: mto.quantity,
            quantity_in_stock: 0,
            quantity_allocated: 0,
            po_ids: [mto.po_id],
            mto_ids: [mto.id],
            is_shortage: true
          })
        }
      }
    }
  }
  
  // Bulk upsert to database
  const inventoryItems = Array.from(inventoryMap.values())
  
  for (const item of inventoryItems) {
    await supabase
      .from('inventory')
      .upsert(item, {
        onConflict: 'item_code',
        ignoreDuplicates: false
      })
  }
  
  // Check for shortages and send alerts
  await checkInventoryShortages(inventoryItems)
  
  return inventoryItems
}
```

---

# 6. TESTING & QUALITY ASSURANCE

## 6.1 Frontend Testing

### Component Testing
```typescript
// __tests__/MTOCompactCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MTOCompactCard } from '@/components/mto/MTOCompactCard'
import { mockMTO } from '@/__mocks__/mto'

describe('MTOCompactCard', () => {
  it('renders MTO information correctly', () => {
    render(<MTOCompactCard mto={mockMTO} />)
    
    expect(screen.getByText(mockMTO.reference_number)).toBeInTheDocument()
    expect(screen.getByText(mockMTO.internal_id)).toBeInTheDocument()
  })
  
  it('shows correct number of active spots', () => {
    render(<MTOCompactCard mto={mockMTO} />)
    
    const activeSpots = screen.getAllByTestId('active-spot')
    expect(activeSpots).toHaveLength(4) // Based on mockMTO data
  })
  
  it('triggers status update on click', () => {
    const onStatusAdvance = jest.fn()
    render(
      <MTOCompactCard 
        mto={mockMTO} 
        onStatusAdvance={onStatusAdvance}
      />
    )
    
    const advanceButton = screen.getByRole('button', { name: /proceed/i })
    fireEvent.click(advanceButton)
    
    expect(onStatusAdvance).toHaveBeenCalledWith(mockMTO.id, 'proceed')
  })
})
```

### Integration Testing
```typescript
// __tests__/integration/upload-flow.test.tsx
import { renderWithProviders } from '@/test-utils'
import { UploadPage } from '@/app/brand/upload/page'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('MTO Upload Flow', () => {
  it('completes full upload process', async () => {
    const user = userEvent.setup()
    const { getByLabelText, getByText } = renderWithProviders(<UploadPage />)
    
    // 1. Select file
    const file = new File(['test'], 'mtos.xlsx', { type: 'application/xlsx' })
    const input = getByLabelText(/upload/i)
    await user.upload(input, file)
    
    // 2. Wait for processing
    await waitFor(() => {
      expect(getByText(/processing/i)).toBeInTheDocument()
    })
    
    // 3. Verify success
    await waitFor(() => {
      expect(getByText(/uploaded successfully/i)).toBeInTheDocument()
    })
  })
})
```

## 6.2 Backend Testing

### API Testing
```typescript
// __tests__/api/mto.test.ts
import request from 'supertest'
import app from '../../src/app'
import { supabase } from '../../src/lib/supabase'

describe('MTO API', () => {
  beforeEach(async () => {
    // Clear test data
    await supabase.from('mtos').delete().neq('id', '0')
  })
  
  describe('POST /api/mtos', () => {
    it('creates new MTO', async () => {
      const mtoData = {
        internal_id: '12345',
        po_line_id: '1',
        reference_number: 'TEST001',
        display_name: 'Test Product',
        quantity: 1,
        spot1: '129559',
        spot1_patch_ref: '63 Camera Icon'
      }
      
      const response = await request(app)
        .post('/api/mtos')
        .set('Authorization', `Bearer ${testToken}`)
        .send(mtoData)
      
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject(mtoData)
      expect(response.body.id).toBeDefined()
    })
  })
  
  describe('GET /api/mtos', () => {
    it('returns paginated MTOs', async () => {
      const response = await request(app)
        .get('/api/mtos?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
    })
  })
})
```

## 6.3 E2E Testing

### Playwright Setup
```typescript
// e2e/mto-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('MTO Complete Workflow', () => {
  test('upload, process, and ship MTO', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@brand.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // 2. Navigate to upload
    await page.click('text=Upload PO/MTO')
    
    // 3. Upload file
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles('test-data/mtos.xlsx')
    
    // 4. Wait for processing
    await expect(page.locator('text=Processing')).toBeVisible()
    await expect(page.locator('text=Upload successful')).toBeVisible()
    
    // 5. Navigate to MTOs
    await page.click('text=MTOs')
    
    // 6. Verify MTO appears
    await expect(page.locator('text=TEST001')).toBeVisible()
    
    // 7. Update status
    await page.click('text=TEST001')
    await page.click('button:has-text("Proceed")')
    
    // 8. Verify status update
    await expect(page.locator('text=proceed')).toBeVisible()
  })
})
```

---

# 7. DEPLOYMENT GUIDE

## 7.1 Vercel Deployment (Frontend)

### Setup Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Your account
# - Link to existing project: N
# - Project name: mto-platform
# - Directory: ./
# - Build command: npm run build
# - Output directory: .next
# - Development command: npm run dev
```

### Configure Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.local`

## 7.2 Railway Deployment (Backend)

### Setup Railway Project
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

### Configure Railway Environment
1. Go to Railway Dashboard
2. Select your project
3. Go to Variables
4. Add all variables from `.env`

## 7.3 Database Migration

### Run Production Migrations
```sql
-- In Supabase SQL Editor
-- Run the complete schema from earlier
-- Enable RLS policies
-- Create initial data
```

## 7.4 Domain Setup

### Configure Custom Domain
1. **Vercel**: Add custom domain in project settings
2. **Update DNS**: Point domain to Vercel
3. **SSL**: Automatic via Vercel

---

# 8. POST-LAUNCH OPERATIONS

## 8.1 Monitoring Setup

### Application Monitoring
```typescript
// Install monitoring
npm install @sentry/nextjs

// Configure Sentry
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring
```typescript
// Add Vercel Analytics
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// In app/layout.tsx
<Analytics />
<SpeedInsights />
```

## 8.2 Backup Strategy

### Database Backups
```bash
# Create backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Backup database
pg_dump $DATABASE_URL > backup_$DATE.sql

# Upload to S3
aws s3 cp backup_$DATE.sql s3://mto-backups/db/backup_$DATE.sql

# Keep only last 30 days
aws s3 ls s3://mto-backups/db/ | while read -r line; do
  createDate=`echo $line | awk {'print $1" "$2'}`
  createDate=`date -d "$createDate" +%s`
  olderThan=`date -d "30 days ago" +%s`
  if [[ $createDate -lt $olderThan ]]; then
    fileName=`echo $line | awk {'print $4'}`
    aws s3 rm s3://mto-backups/db/$fileName
  fi
done
```

## 8.3 Maintenance Tasks

### Regular Tasks Checklist
- [ ] **Daily**: Check error logs
- [ ] **Daily**: Monitor active MTOs
- [ ] **Weekly**: Database backup verification
- [ ] **Weekly**: Performance review
- [ ] **Monthly**: Security updates
- [ ] **Monthly**: Generate reports (AQL, statistics)
- [ ] **Quarterly**: Full system audit

## 8.4 Support Documentation

### User Guides
1. **Brand User Guide**: Upload, track, manage MTOs
2. **Factory User Guide**: Workboard, production, shipping
3. **Admin Guide**: User management, reports, oversight

### API Documentation
```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: MTO Platform API
  version: 1.0.0
paths:
  /api/mtos:
    get:
      summary: List MTOs
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/MTO'
```

---

# 🎯 PROJECT MILESTONES & DELIVERABLES

## Phase 1: Core System Setup (Week 1-2) - $8,000
- [x] Database schema implementation
- [x] Authentication system
- [x] Basic UI framework
- [x] Admin portal

## Phase 2: PO/MTO Upload & Management (Week 3-4) - $5,000
- [x] Excel upload functionality
- [x] MTO tracking system
- [x] Brand dashboard
- [x] Factory workboard

## Phase 3: Barcode & Communication (Week 5-6) - $3,000
- [x] 4-level barcode generation
- [x] Spot vocabulary mapping
- [x] Chat system
- [x] Defect workflow

## Phase 4: Final Testing & Deployment (Week 7-8) - $4,000
- [x] Production deployment
- [x] Performance optimization
- [x] Documentation
- [x] Training

---

# 📞 SUPPORT & MAINTENANCE

## Contact Information
- **Technical Support**: support@mto-platform.com
- **Emergency**: +1 (XXX) XXX-XXXX
- **Documentation**: https://docs.mto-platform.com

## SLA Agreement
- **Basic Plan ($250/month)**: Bug fixes, 2 business days response
- **Standard Plan ($450/month)**: All basic + minor changes, 1 business day response

---

This complete guide provides everything needed for autonomous development of the MTO platform. Follow each section sequentially for successful implementation.