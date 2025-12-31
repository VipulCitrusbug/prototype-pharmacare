# PharmaCare Plus - Design Guidelines

## Design System Overview
**Approach:** Custom healthcare-focused design system prioritizing clinical clarity, professional trust, and operational efficiency. The design balances medical precision with modern UX patterns.

## Color Palette

### Primary Colors
- **Deep Clinical Blue (#1F3A5F):** Navigation bars, primary actions, headings, active states
- **Soft Mint Teal (#2FB7A3):** AI assistance highlights, insights, secondary actions, success with context
- **Muted Amber (#F2B705):** Pending states, review-required indicators, non-critical warnings

### Status Colors
- **Success Green (#3CB371):** Completed actions, approvals, confirmations
- **Controlled Red (#D64545):** Errors, critical alerts, compliance flags (use sparingly)
- **Soft Blue (#3B82F6):** Information messages, links, helpful hints

### Backgrounds
- **Soft Off-White (#F7F9FC):** Main application background, dashboard surfaces
- **Pure White (#FFFFFF):** Cards, modals, forms, tables, input fields
- **Cool Gray (#E2E8F0):** Borders, dividers, table grids

### Text
- **Charcoal Blue-Gray (#1F2933):** Primary text, headings, high-emphasis content
- **Slate Gray (#6B7280):** Secondary text, helper text, metadata, placeholders

## Typography

### Font Family
**Primary:** Inter (Google Fonts) with system fallbacks
**Stack:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Type Scale (Tailwind Classes)
- **H1:** text-3xl (32px), font-bold, text-charcoal
- **H2:** text-2xl (24px), font-semibold, text-charcoal  
- **H3:** text-xl (20px), font-semibold, text-charcoal
- **H4:** text-lg (18px), font-semibold, text-charcoal
- **Body Large:** text-lg (18px), font-normal, leading-relaxed
- **Body Regular:** text-base (16px), font-normal, leading-relaxed
- **Body Small:** text-sm (14px), font-normal, text-slate-gray
- **Caption:** text-xs (12px), font-normal, text-slate-gray

## Layout & Spacing

### Spacing Units (Tailwind)
**Primary units:** 2, 3, 4, 6, 8, 12, 16
- Tight spacing: p-2, p-3, p-4
- Standard spacing: p-6, p-8, gap-6
- Section spacing: py-12, py-16
- Major divisions: py-20, py-24

### Layout Structure
- **Max Width:** max-w-7xl for main content containers
- **Grid:** 12-column on desktop, 4-column on mobile
- **Gutter:** gap-6 (desktop), gap-4 (mobile)
- **Forms:** max-w-2xl, centered

## Components

### Buttons
**Primary:** bg-clinical-blue (#1F3A5F), text-white, h-11, px-6, rounded-lg, font-semibold
- Hover: bg-[#244B78] with subtle shadow
- Disabled: bg-gray-200, text-gray-400

**Secondary:** border-2 border-clinical-blue, bg-transparent, text-clinical-blue, same dimensions
- Hover: bg-off-white (#F7F9FC)

**Hero/Image Overlay Buttons:** Backdrop blur (backdrop-blur-md), semi-transparent backgrounds, no hover state changes beyond standard button behavior

### Input Fields
- Height: h-11, px-4, py-3
- Border: border border-cool-gray (#E2E8F0), rounded-lg
- Focus: ring-2 ring-clinical-blue ring-opacity-20
- Error: border-red-500 with error text below
- Labels: text-sm font-semibold mb-1

### Cards
- Background: bg-white, border border-cool-gray
- Padding: p-6
- Shadow: shadow-sm, hover:shadow-md transition
- Rounded: rounded-xl

### Tables
- Header: bg-off-white, text-sm font-semibold, text-charcoal
- Rows: border-b border-cool-gray, hover:bg-off-white
- Padding: px-6 py-4

### Badges/Tags
- AI Assist: bg-mint-teal/10, text-mint-teal, rounded-full, px-3 py-1, text-xs font-medium
- Status: Color-coded backgrounds at 10% opacity with matching text

## Key Screens Layout

### Dashboard
- Metric cards in grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Work queue table/cards below metrics
- Sidebar navigation (w-64) with top header

### Prescription Queue
- Filter bar at top (bg-white, shadow-sm, p-4)
- Priority-sorted list with visual urgency indicators
- Card-based layout: grid-cols-1 md:grid-cols-2 gap-4

### Forms
- Single column, max-w-2xl, centered
- Grouped sections with headings
- Required fields marked with red asterisk

### Modals
- Centered, max-w-2xl, bg-white, rounded-xl, shadow-2xl
- Backdrop: bg-black/50
- Header with close button, content area, footer with actions

## Images

**Hero Sections:** Not applicable for this healthcare dashboard application - focus on data clarity and functionality

**Medical Icons:** Use healthcare-focused icon library (Heroicons Medical subset or Font Awesome Medical)

**Avatar Placeholders:** Circular, 40px for lists, 56px for profiles, bg-clinical-blue with initials in white

**Prescription Previews:** Document/scan preview cards with subtle border, max-h-96, rounded corners

## Navigation

**Top Bar:** bg-clinical-blue, h-16, sticky top-0, z-50, text-white
**Sidebar:** w-64, bg-white, border-r border-cool-gray, fixed height
**Active State:** bg-mint-teal/10, border-l-4 border-mint-teal

## Loading & Feedback

**Skeleton Loaders:** Animate pulse on bg-gray-200 elements
**Spinners:** Border-t-transparent rotating circle in brand colors
**Toasts:** Fixed top-right, auto-dismiss 3s, max-w-sm, shadow-lg

## Accessibility
- WCAG AA minimum for all text/background combinations
- Focus indicators: ring-2 ring-clinical-blue on all interactive elements
- Required field asterisks in red
- Error messages with aria-live regions