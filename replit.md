# PharmaCare Plus - Pharmacy Management System

## Overview
PharmaCare Plus is an AI-assisted pharmacy management platform designed to support safe, efficient, and compliant pharmacy operations. This is a UI/UX prototype with role-based access for pharmacists, managers, patients, finance specialists, compliance officers, and administrators.

## Project Structure
```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Reusable common components
│   │   │   │   ├── logo.tsx
│   │   │   │   ├── theme-provider.tsx
│   │   │   │   ├── theme-toggle.tsx
│   │   │   │   ├── top-nav-bar.tsx
│   │   │   │   ├── app-sidebar.tsx
│   │   │   │   ├── status-badge.tsx
│   │   │   │   ├── ai-assist-badge.tsx
│   │   │   │   ├── priority-indicator.tsx
│   │   │   │   ├── metric-card.tsx
│   │   │   │   ├── loading-spinner.tsx
│   │   │   │   ├── skeleton-loader.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── error-state.tsx
│   │   │   │   ├── user-avatar.tsx
│   │   │   │   ├── form-section.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── prescription-card.tsx
│   │   │   │   └── index.ts
│   │   │   └── ui/          # Shadcn UI components
│   │   ├── pages/           # Page components
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── queue.tsx
│   │   │   ├── prescription-detail.tsx
│   │   │   ├── manager/         # Manager portal pages
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── alerts.tsx
│   │   │   │   ├── inventory.tsx
│   │   │   │   ├── insights.tsx
│   │   │   │   ├── staff.tsx
│   │   │   │   └── reports.tsx
│   │   │   └── not-found.tsx
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx          # Main app with routing
│   │   └── index.css        # Global styles with design tokens
├── server/                  # Backend Express server
│   ├── routes.ts            # API routes
│   └── storage.ts           # In-memory storage
├── shared/                  # Shared types and schemas
│   └── schema.ts            # Data models and validation schemas
└── design_guidelines.md     # Design system documentation
```

## Common Components

### Layout Components
- **Logo** - Brand logo with icon and text
- **TopNavBar** - Header with logo, notifications, theme toggle, user menu
- **AppSidebar** - Role-based navigation sidebar

### Data Display
- **MetricCard** - Dashboard statistics cards with trends
- **StatusBadge** - Prescription/order status indicators
- **AIAssistBadge** - AI confidence and assistance indicators
- **PriorityIndicator** - Urgency level badges
- **UserAvatar** - User profile pictures with initials fallback
- **PrescriptionCard** - Prescription preview cards

### Data Collection
- **DataTable** - Sortable, filterable data tables
- **FormSection** - Grouped form fields with labels

### Feedback
- **LoadingSpinner** / **PageLoader** / **ButtonSpinner** - Loading states
- **SkeletonLoader** variants - Content placeholder animations
- **EmptyState** - Empty data states with actions
- **ErrorState** - Error display with retry options

## Design System

### Colors (from design_guidelines.md)
- **Primary (Clinical Blue)**: #1F3A5F - Navigation, primary actions
- **Accent (Mint Teal)**: #2FB7A3 - AI highlights, success states
- **Amber**: #F2B705 - Warnings, pending states
- **Success**: #3CB371 - Completed actions
- **Danger**: #D64545 - Errors, critical alerts
- **Info**: #3B82F6 - Informational messages

### Typography
- Font: Inter with system fallbacks
- Headings: Bold/Semibold, charcoal color
- Body: Regular weight, responsive sizing

## User Roles
1. **Pharmacist** - Process and dispense prescriptions
2. **Manager** - Operations oversight
3. **Patient** - Request refills, track orders
4. **Finance** - Billing and claims
5. **Compliance** - Regulatory monitoring
6. **Admin** - System configuration

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/me` - Current user info

### Pharmacist
- `GET /api/dashboard/metrics` - Dashboard statistics
- `GET /api/prescriptions` - List prescriptions with filters
- `GET /api/prescriptions/:id` - Single prescription
- `POST /api/prescriptions` - Create prescription
- `PATCH /api/prescriptions/:id` - Update prescription

### Manager
- `GET /api/manager/metrics` - Manager operations KPIs
- `GET /api/manager/alerts` - AI-powered proactive alerts

### Patient
- `GET /api/patient/metrics` - Patient dashboard metrics

## Demo Credentials

### Pharmacist
- Username: `pharmacist`
- Password: `password123`

### Manager
- Username: `manager`
- Password: `password123`

### Patient
- Username: `patient`
- Password: `password123`

## Development
- Run: `npm run dev`
- Frontend: React + Vite + TailwindCSS + Shadcn UI
- Backend: Express with in-memory storage
- Forms: react-hook-form with zod validation
- Data fetching: TanStack Query

## Manager Portal

The Manager portal provides AI-driven operational insights for pharmacy management:

### Pages
- **Operations Dashboard** (`/manager`) - KPIs, alerts preview, quick actions
- **AI Proactive Alerts** (`/manager/alerts`) - Early warning system with predictive analytics
- **Inventory Intelligence** (`/manager/inventory`) - Demand forecasts, reorder recommendations, expiry risks
- **Operational Insights** (`/manager/insights`) - Volume trends, turnaround breakdown, bottleneck detection
- **Staff Performance Signals** (`/manager/staff`) - Aggregate metrics for capacity planning (non-punitive)
- **Reports & Export** (`/manager/reports`) - Leadership-ready reports and data exports

### Design Philosophy
- Uses aggregate-level metrics designed for process improvement
- Non-punitive staff performance signals for capacity planning
- AI confidence scores on all predictive insights
- Role-based access prevents pharmacists from accessing manager routes

## Patient Portal

The Patient portal provides a simple, guided experience for managing prescriptions:

### Pages
- **My Health Dashboard** (`/patient`) - Active medications, refill reminders, order status overview
- **My Medications** (`/patient/medications`) - List of active/inactive prescriptions with refill status
- **Medication Detail** (`/patient/medications/:id`) - Prescription details, refill request with delivery options
- **Order Status** (`/patient/orders`) - Real-time order tracking with status timeline
- **Notifications** (`/patient/notifications`) - Refill reminders and order updates
- **Settings** (`/patient/settings`) - Profile, addresses, notification preferences

### AI Features (Patient-Specific)
- AI Smart Refill Predictor - Suggests refills based on historical patterns
- Non-intrusive reminders - No medical advice, just convenience
- Patient always initiates refill actions

### Design Philosophy
- Simple, guided, low-effort experience
- No exposure to internal pharmacy workflows
- AI involvement limited to refill prediction only
- Patient controls all actions

## Recent Changes
- Created comprehensive common component library
- Implemented role-based navigation
- Built pharmacist dashboard, prescription queue, and detail views
- Added dark mode support with theme toggle
- Configured design tokens matching PharmaCare Plus branding
- Added complete Manager portal with 6 pages (Operations, AI Alerts, Inventory, Insights, Staff, Reports)
- Implemented role-based routing with guards for manager routes
- Added demo manager user account
- Added complete Patient portal with 6 pages (Dashboard, Medications, Medication Detail, Orders, Notifications, Settings)
- Implemented role-based routing with guards for patient routes
- Added demo patient user account
- Added server-side authorization middleware for patient and manager API endpoints
