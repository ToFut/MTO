# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

### Backend (Express + TypeScript)
- Development: `cd backend && npm run dev` (starts with nodemon + ts-node on port 4567)
- Build: `cd backend && npm run build` (compiles TypeScript to dist/)
- Production: `cd backend && npm start` (runs compiled JS from dist/)
- Test: `cd backend && npm test` (Jest)
- Lint: `cd backend && npm run lint` (ESLint)
- Format: `cd backend && npm run format` (Prettier)

### Frontend (React + TypeScript + Vite)
- Development: `cd frontend && npm run dev` (Vite dev server on port 3001)
- Build: `cd frontend && npm run build` (TypeScript compilation + Vite build)
- Preview: `cd frontend && npm run preview` (preview production build)
- Lint: `cd frontend && npm run lint` (ESLint for TS/TSX)

### Development Workflow
- Start backend: `cd backend && npm run dev`
- Start frontend: `cd frontend && npm run dev`
- Frontend automatically proxies `/api` requests to backend (localhost:5000 → 4567)

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
  - Services (business logic - **needs implementation**)
  - Models (data layer - **needs creation**)
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
- **MTOs**: Core entity with 6 spots/cartons tracking
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

## Development Status

### ✅ Completed
- Backend API structure (controllers, routes, middleware)
- Frontend component architecture and routing
- Authentication system with JWT
- Database schema and Supabase configuration
- Multi-language support (EN, CN, TH, VN, KH)
- Real-time chat infrastructure

### ⚠️ In Progress  
- **Business Logic**: Backend services need implementation (10 service files)
- **Data Models**: Database models and query builders needed
- **API Integration**: Frontend-backend data flow connections
- **Component Migration**: Converting remaining JS components to TypeScript

### ❌ Pending
- Comprehensive testing (unit, integration, e2e)
- Production deployment configuration
- Performance optimization and caching
- Advanced analytics and reporting features

## Important Notes

### Environment Configuration
- Backend requires Supabase URL and service key
- Frontend uses Vite proxy for API calls in development
- Socket.io CORS configured for frontend origin
- File uploads limited to 10MB

### Database Connection
- Uses Supabase client with service key for backend operations
- Row-level security policies must be configured in Supabase
- Connection pooling handled by Supabase

### Real-time Features
- Socket.io server integrated with Express
- Chat functionality per MTO with room-based messaging
- Live updates for inventory and production status changes

### Error Handling
- Centralized error middleware captures all unhandled errors
- Winston logging with file rotation (combined.log, error.log)
- Structured error responses with consistent format