# Carvaan

A trusted used-car marketplace for the Indian market. Buyers browse inspected cars, sellers get qualified leads, and every transaction is secure. Features a Kashmir-inspired warm design system across all platforms.

## Tech Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 23.7.0 | Runtime |
| TypeScript | 5.9.x | Type safety across all apps |
| Supabase | — | Backend (Postgres, Auth, Storage, Realtime) |

### Mobile App (`apps/mobile`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.83.2 | Cross-platform mobile framework |
| Expo SDK | 55 | Managed workflow, OTA updates |
| Expo Router | 55.0.4 | File-based navigation |
| React | 19.2.0 | UI library |
| Zustand | 5.0.11 | Lightweight state management |
| React Query | 5.90.21 | Server state & caching |
| React Hook Form | 7.71.2 | Form handling |
| Zod | 4.3.6 | Schema validation |
| Supabase JS | 2.99.1 | Backend client |
| React Native Reanimated | 4.2.1 | Animations |
| React Native Gesture Handler | 2.30.0 | Touch gestures |
| Expo Image | 55.0.6 | Optimized image loading |
| Expo Image Picker | 55.0.11 | Photo selection |
| Expo Camera | 55.0.9 | Camera access |
| Expo Notifications | 55.0.11 | Push notifications |
| Flash List | 2.3.0 | High-performance lists |
| Bottom Sheet | 5.2.8 | Gorhom bottom sheet |

### Web App (`apps/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with SSR |
| React | 19.2.3 | UI library |
| Tailwind CSS | 4.x | Utility-first styling |
| Supabase JS | 2.99.1 | Backend client |
| Lucide React | 0.577.0 | Icon library |
| ESLint | 9.x | Linting |

### Admin Dashboard (`apps/admin`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with SSR |
| React | 19.2.3 | UI library |
| Tailwind CSS | 4.x | Utility-first styling |
| Supabase JS | 2.99.1 | Backend client (with service role) |
| Lucide React | 0.577.0 | Icon library |
| ESLint | 9.x | Linting |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Supabase Postgres | Primary database with RLS policies |
| Supabase Auth | Phone/OTP authentication |
| Supabase Storage | Car photos and user avatars |
| Supabase Realtime | Live messaging |
| GitHub Actions | CI pipeline and EAS builds |
| Vercel | Web and admin deployment (planned) |

## Project Structure

```
cosmos-carvaan/
├── apps/
│   ├── mobile/                 # Expo React Native app
│   │   ├── app/                # File-based routing (Expo Router)
│   │   │   ├── (auth)/         # Login, OTP, onboarding
│   │   │   ├── (tabs)/         # Home, Search, Sell, Inbox, Profile
│   │   │   ├── car/            # Car detail screen
│   │   │   ├── chat/           # Conversation screen
│   │   │   ├── profile/        # Profile sub-screens
│   │   │   └── sell/           # 5-step listing creation
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   ├── lib/                # API, Supabase client, utilities
│   │   └── constants/          # Theme, config, colors
│   ├── web/                    # Next.js public-facing website
│   │   └── src/
│   │       ├── app/            # Pages (home, browse, car detail)
│   │       ├── components/     # Header, Footer, CarCard
│   │       └── lib/            # Supabase client
│   └── admin/                  # Next.js admin dashboard
│       └── src/
│           ├── app/
│           │   ├── dashboard/  # Overview, listings, users, messages, settings
│           │   └── login/      # Admin authentication
│           ├── components/     # StatCard, StatusBadge
│           └── lib/            # Supabase client (anon + service role)
├── packages/
│   └── shared/                 # Shared types and validators
├── supabase/
│   ├── migrations/             # 7 SQL migration files
│   ├── seed.sql                # Indian market seed data
│   └── config.toml             # Supabase project config
├── docs/                       # Architecture and implementation plan
└── .github/workflows/          # CI and EAS Build pipelines
```

## Apps

### Mobile App

Cross-platform mobile app built with Expo and React Native. Features a Kashmir-inspired warm color palette with walnut brown primary, golden accents, and cream backgrounds.

**Features:**
- Phone/OTP authentication via Supabase Auth
- Car listings with photos, specs, price badges, and location
- Search & filter by make, model, body type, price, mileage, city
- 5-step sell flow (details, condition, photos, pricing, review)
- Real-time messaging between buyers and sellers
- Saved cars and recently viewed history
- Photo upload to Supabase Storage via FormData
- Mock data mode with Indian market listings for demo/offline use

### Web App

Public-facing Next.js website with server-side rendering for SEO. Shares the same Kashmir-inspired design system.

**Features:**
- Homepage with hero, featured listings, and browse by make
- Browse page with search and filtering
- Car detail page with photo gallery, specs, seller info, and similar cars
- Responsive layout for desktop and mobile browsers
- Direct Supabase integration for live listing data

### Admin Dashboard

Internal admin panel for managing the marketplace. Uses Supabase service role key to bypass RLS policies.

**Features:**
- Dashboard overview with key metrics (total listings, active users, pending reviews, revenue)
- Listings management with approve/reject workflow
- Listing detail view with photo gallery and action buttons
- Featured listing toggle
- User management
- Messages overview
- Platform settings

## Design System

All apps share a Kashmir-inspired warm color palette:

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6B3A2A` (Walnut Brown) | Buttons, links, accents |
| Accent | `#D4A017` (Gold) | Highlights, featured badges |
| Background | `#FDF8F3` (Cream) | Page backgrounds |
| Surface | `#FFFFFF` | Cards, modals |
| Text | `#1C1210` | Primary text |
| Text Secondary | `#5C4033` | Supporting text |
| Border | `#E8DDD5` | Dividers, card borders |
| Success | `#2E7D32` | Approvals, positive states |
| Error | `#C62828` | Rejections, errors |

## Getting Started

### Prerequisites

- Node.js 18+ (tested with 23.7.0)
- npm 10+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile)
- A Supabase project (or use mock data mode for mobile)

### Install

```bash
# Mobile app
cd apps/mobile && npm install

# Web app
cd apps/web && npm install

# Admin dashboard
cd apps/admin && npm install
```

### Configure Environment

**Mobile** — create `apps/mobile/.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Web** — create `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Admin** — create `apps/admin/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The mobile app works without Supabase credentials using built-in mock data.

### Run

```bash
# From root — all web apps
npm run dev:all

# Individual apps
npm run dev:mobile    # Expo dev server
npm run dev:web       # http://localhost:3000
npm run dev:admin     # http://localhost:3001

# Or directly
cd apps/mobile && npm run ios      # iOS Simulator
cd apps/mobile && npm run android  # Android Emulator
cd apps/web && npm run dev
cd apps/admin && npm run dev
```

## Database

Seven sequential migrations build the schema:

1. **Extensions & enums** — UUID, trigram, full-text search, status enums
2. **User profiles** — with RLS policies
3. **Car master data** — makes, models, variants (Indian market)
4. **Listings** — with photos, search vectors, and price tracking
5. **Interactions** — saves, views, reports
6. **Messaging** — conversation threads with real-time support
7. **Storage** — buckets for car photos and avatars

Apply migrations with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push
supabase db seed
```

## CI/CD

- **`ci.yml`** — Runs on push/PR to main. Linting and type checking.
- **`eas-build.yml`** — Triggers EAS Build for iOS/Android on release tags.

## License

MIT
