# MTO Management System

## 🚀 Project Status

This is a full-stack MTO (Made-to-Order) management system built with modern best practices.

### ✅ Completed
- **Frontend Architecture**: React 18 + TypeScript + Vite
- **Backend Structure**: Express + TypeScript with all controllers
- **Authentication System**: JWT-based with role management
- **Core Components**: All MTO, inventory, defect, and shipping components migrated
- **Multi-language Support**: 5 languages (EN, CN, TH, VN, KH)
- **Database Schema**: Complete Supabase schema ready

### 🔧 Needs Implementation
1. **Backend Services** (10 files) - Business logic layer
2. **Frontend Pages** - Actual page components for routes
3. **Database Connection** - Connect to Supabase
4. **TypeScript Conversion** - Convert JS components to TS

## 📁 Project Structure

```
MTO-System/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # UI components (migrated from original)
│   │   ├── contexts/      # Auth, Language, Theme providers
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript definitions
│   │   ├── pages/         # Route pages (needs implementation)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   └── layouts/       # Layout components
│   └── package.json
│
├── backend/               # Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # ✅ All 11 controllers ready
│   │   ├── routes/        # ✅ All routes configured
│   │   ├── middleware/    # ✅ Auth, error, logging
│   │   ├── services/      # ⚠️ Needs implementation
│   │   ├── models/        # ⚠️ Needs creation
│   │   └── config/        # ✅ Supabase, Socket.io
│   └── package.json
│
└── shared/                # Shared types and constants
```

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone and install dependencies:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

2. **Configure environment variables:**
```bash
# Frontend (.env)
cp .env.example .env
# Edit with your values

# Backend (.env)
cp .env.example .env
# Add your Supabase credentials
```

3. **Run development servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev  # Runs on http://localhost:3000
```

## 🎯 Features

### For Brands
- Upload PO/MTO via Excel
- Track production status
- Manage inventory
- Handle defects
- View analytics
- Real-time chat per MTO

### For Factories
- Production workboard
- Daily/Monthly categorization
- QC management
- Defect reporting
- Shipping coordination

### For Admins
- User management
- Company oversight
- System reports
- Full visibility

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **Axios** - API calls
- **Lucide Icons** - Icons

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database & Auth
- **Socket.io** - Real-time features
- **JWT** - Authentication
- **Multer** - File uploads
- **Winston** - Logging

## 📊 Database Schema

Complete schema available in `/MTO-System/Prepration.md`

Key tables:
- `users` - User accounts with roles
- `companies` - Brand and factory companies
- `purchase_orders` - PO management
- `mtos` - Core MTO data with 6 spots
- `inventory` - Stock tracking
- `defects` - Defect management
- `shipments` - Shipping & tracking
- `chat_messages` - Real-time communication

## 🔐 Security

- JWT authentication
- Role-based access control (RBAC)
- Row-level security in Supabase
- Input validation
- Rate limiting
- CORS configuration

## 📝 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - New user registration
- `POST /auth/logout` - Logout

### MTOs
- `GET /mtos` - List MTOs with filters
- `POST /mtos` - Create MTO
- `POST /mtos/upload` - Excel upload
- `PATCH /mtos/:id` - Update MTO
- `POST /mtos/:id/defect` - Report defect

### Inventory
- `GET /inventory` - List inventory
- `POST /inventory/auto-populate` - Auto-populate from MTOs

## 🚦 Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Structure | ✅ Complete | TypeScript, best practices |
| Backend Structure | ✅ Complete | All controllers ready |
| Authentication | ✅ Complete | JWT-based |
| Database Schema | ✅ Complete | Supabase ready |
| Business Logic | ⚠️ Pending | Services need implementation |
| API Integration | ⚠️ Pending | Frontend-backend connection |
| Testing | ❌ Not Started | Unit & integration tests |
| Deployment | ❌ Not Started | Docker, CI/CD |

## 📈 Next Steps

1. **Implement backend services** with business logic
2. **Create frontend pages** for all routes
3. **Connect to Supabase** database
4. **Convert JS components** to TypeScript
5. **Add validation** schemas
6. **Write tests** for critical paths
7. **Deploy** to production

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ using modern web technologies