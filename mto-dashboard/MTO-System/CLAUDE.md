# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

### Backend (Express + TypeScript)
- Development: `cd backend && npm run dev` (starts with nodemon + ts-node on port 5010)
- Build: `cd backend && npm run build` (compiles TypeScript to dist/)
- Production: `cd backend && npm start` (runs compiled JS from dist/)
- Test: `cd backend && npm test` (Jest)
- Lint: `cd backend && npm run lint` (ESLint)
- Format: `cd backend && npm run format` (Prettier)

### Frontend (React + TypeScript + Vite)
- Development: `cd frontend && npm run dev` (Vite dev server on port 3010)
- Build: `cd frontend && npm run build` (TypeScript compilation + Vite build)
- Preview: `cd frontend && npm run preview` (preview production build)
- Lint: `cd frontend && npm run lint` (ESLint for TS/TSX)

### Development Workflow
- Start backend: `cd backend && npm run dev`
- Start frontend: `cd frontend && npm run dev`
- Frontend automatically proxies `/api` requests to backend (localhost:3010 → localhost:5010)

## Architecture Overview

### Full-Stack MTO (Made-to-Order) Management System
- **Backend**: Express.js with TypeScript, class-based server architecture
- **Frontend**: React 18 with TypeScript, modern hooks and contexts
- **Database**: Supabase (PostgreSQL) with row-level security
- **Real-time**: Socket.io for chat and live updates
- **Authentication**: JWT-based with role-based access control

### Backend Architecture
- **MVC Pattern**: Controllers → Services → Database
- **Layered Structure**: 
  - Routes (API endpoints)
  - Controllers (request/response handling)
  - Services (business logic)
  - Middleware (auth, error handling, logging, rate limiting)
- **Configuration**: Modular config for Supabase, Socket.io, logger
- **File Uploads**: Multer for Excel/image handling in `/uploads`

### Frontend Architecture  
- **Route-based**: Role-specific dashboards (Brand, Factory, Admin)
- **Context Providers**: Auth, Language (5 languages), Theme
- **Lazy Loading**: All pages are React.lazy() for performance
- **State Management**: Zustand + React Query for server state
- **Component Library**: Custom components with Tailwind CSS + Lucide icons
- **Type Safety**: Comprehensive TypeScript throughout

### Key Domain Entities
- **Users**: Role-based (brand_user, factory_user, admin)
- **Companies**: Brand and factory organizations  
- **Purchase Orders (POs)**: Excel upload and management
- **MTOs**: Core entity with flexible spots/cartons tracking (3, 6, or 20+ spots)
- **Inventory**: Stock tracking with auto-population from MTOs
- **Defects**: QC defect reporting and management
- **Shipments**: Shipping coordination and tracking
- **Chat**: Real-time communication per MTO

### Database Schema (Supabase)
- All tables use UUID primary keys
- Row-level security policies implemented
- Timestamps (created_at, updated_at) on all entities
- Foreign key relationships maintain data integrity
- Indexes on frequently queried columns
- JSONB columns for flexible data storage (spots_data, excel_data)

## Code Conventions

### TypeScript Configuration
- **Backend**: CommonJS modules, strict mode disabled, ES2020 target
- **Frontend**: ES modules, path aliases (@/, @components, @pages, etc.)
- **Shared Types**: Cross-platform type definitions in `/shared`

### API Design
- **RESTful**: Consistent HTTP verbs and status codes
- **Versioned**: All routes under `/api` prefix
- **Error Handling**: Centralized error middleware with structured responses
- **Validation**: Express-validator for input validation
- **Rate Limiting**: Applied to all `/api` routes

### Security Practices
- Helmet.js for security headers
- CORS configured for specific origins
- JWT token authentication with middleware
- File upload restrictions and validation
- Environment variables for sensitive data
- No hardcoded credentials (uses .env files)

### File Structure Standards
- **Backend**: Feature-based organization (auth, mto, inventory, etc.)
- **Frontend**: Domain-driven structure (brand/, factory/, admin/ pages)
- **Shared**: Common types and utilities
- **Uploads**: File storage in backend/uploads/
- **Logs**: Winston logging to backend/logs/

## Critical Implementation Details

### Excel Upload Processing
- **Multi-sheet support**: Processes all sheets in Excel file
- **Flexible header detection**: Finds headers even if not in first row
- **Smart column mapping**: Detects various column name variations
- **Duplicate handling**: Generates unique IDs for duplicates
- **Fallback values**: Uses SKU/reference for missing display names
- **Validation**: Skips empty rows, validates required fields
- **JSONB storage**: Preserves original Excel data for reference

### MTO Service Key Methods
- `parseExcelData()`: Handles flexible Excel structures with multi-sheet support
- `createHeaderMap()`: Maps column variations to standard fields
- `directMTOUpload()`: Creates PO + Workspace + MTOs atomically
- `detectFileType()`: Distinguishes between PO and MTO formats
- `performAutoPopulation()`: Populates inventory from MTO spots

### Authentication Flow
- Login: `POST /api/auth/login` → JWT token
- Middleware: `authenticate()` validates JWT on every request
- Role-based: Controllers check user role for authorization
- Token expiry: 7 days (configurable in JWT_EXPIRES_IN)

### Real-time Features
- Socket.io server integrated with Express
- Room-based messaging: `company:${id}`, `mto:${id}`, `chat:${id}`
- JWT authentication on WebSocket connections
- Events: MTO updates, chat messages, production status changes

## Environment Configuration

### Backend (.env)
- **PORT**: 5010 (development)
- **SUPABASE_URL**: Supabase project URL
- **SUPABASE_SERVICE_KEY**: Service role key for backend operations
- **JWT_SECRET**: Secret for JWT signing
- **FRONTEND_URL**: http://localhost:3010 (for CORS)

### Frontend (vite.config.ts)
- **Dev server**: Port 3010
- **API proxy**: /api → http://localhost:5010
- **Path aliases**: Configured for clean imports

## Common Development Tasks

### Adding a New API Endpoint
1. Create route in `backend/src/routes/[feature].routes.ts`
2. Add controller method in `backend/src/controllers/[feature].controller.ts`
3. Implement business logic in `backend/src/services/[feature].service.ts`
4. Add validation middleware if needed
5. Update frontend service in `frontend/src/services/[feature].service.ts`

### Database Changes
1. Update schema in Supabase dashboard
2. Update TypeScript types in backend
3. Update service methods to handle new fields
4. Test with existing data migration if needed

### Debugging Upload Issues
- Check logs in `backend/logs/combined.log`
- Verify Excel column mapping in `parseExcelData()` method
- Check `createHeaderMap()` for column detection logic
- Review validation errors in response

## Important Notes

### Current Status
- Backend services are implemented but may need refinement
- Frontend-backend integration is functional
- Multi-language support is active (EN, CN, TH, VN, KH)
- File upload supports flexible Excel formats

### Known Issues & Solutions
- **Upload failures**: Usually due to column mapping - check header detection
- **Duplicate IDs**: System auto-generates unique IDs when duplicates detected
- **Empty MTOs**: Fallback values ensure MTOs have identifiable data
- **Port conflicts**: Backend uses 5010, frontend uses 3010

### Performance Considerations
- Lazy loading reduces initial bundle size
- JSONB columns allow flexible data without schema changes
- Indexes on foreign keys improve query performance
- Socket.io rooms limit broadcast scope