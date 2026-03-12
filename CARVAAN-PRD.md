# Cosmos Carvaan - Used Cars Marketplace App

## Product Requirements Document (PRD)

> **Tech Stack:** React Native (Expo) | Node.js (Express) | Supabase (Postgres + Auth + Storage + Realtime)
>
> **Inspired by:** [CarSwitch](https://carswitch.com) - UAE's leading used car platform

---

## 1. Product Vision

**Carvaan** is a trusted used-car marketplace that connects buyers and sellers with transparency, verified inspections, and end-to-end transaction support. Unlike classifieds (Dubizzle, OLX), Carvaan sits between buyer and seller as a quality gatekeeper - every car is inspected, every listing verified, every transaction secured.

### Core Value Props

| Stakeholder | Value |
|-------------|-------|
| **Buyer** | Browse only inspected cars, financing in-app, book test drives, secure payments |
| **Seller** | Free valuation, professional photography, qualified leads only, fast sales |
| **Platform** | Commission on sales, financing referral fees, premium listing upsells |

---

## 2. User Personas

### Buyer - "Amir"
- First-time car buyer, wants trust and transparency
- Filters by budget, brand, mileage
- Needs financing options
- Wants to book test drives without haggling

### Seller - "Fatima"
- Upgrading her car, wants fair price quickly
- Doesn't want to deal with unqualified leads
- Wants professional listing (photos, description)
- Expects the platform to handle paperwork

### Dealer - "AutoWorld Motors" (Phase 2)
- Small dealership with 20-50 cars
- Wants bulk listing tools
- Needs analytics dashboard
- Wants lead management

---

## 3. Feature Breakdown by Phase

### Phase 1 - MVP (8-10 weeks)

#### 3.1 Authentication & Onboarding
- Phone number + OTP login (Supabase Auth)
- Social login (Google, Apple)
- Profile setup: name, city, avatar
- Role selection: Buyer / Seller (can be both)

#### 3.2 Car Listings (Browse & Search)
- **Home feed**: Featured cars, recently added, price drops
- **Search & filters**:
  - Make, model, year range
  - Price range (slider)
  - Mileage range
  - Body type (sedan, SUV, hatchback, truck, coupe, van)
  - Fuel type (petrol, diesel, hybrid, electric)
  - Transmission (auto, manual)
  - Color
  - City / location
  - Number of owners
  - Inspection status (verified / pending)
- **Sort**: Price low-high, price high-low, newest, mileage, year
- **Car detail screen**:
  - Photo gallery (swipeable, pinch-to-zoom, fullscreen)
  - Price + EMI estimate
  - Key specs grid (year, mileage, fuel, transmission, engine)
  - Seller info (name, rating, response time)
  - 130-point inspection report (expandable sections)
  - Similar cars carousel
  - Action buttons: Save, Share, Chat, Book Test Drive, Make Offer

#### 3.3 Sell Your Car
- **Step 1**: Select make/model/year/variant (cascading dropdowns from master data)
- **Step 2**: Enter mileage, condition, color, number of owners
- **Step 3**: Upload photos (min 6, max 20) - guided photo capture (front, back, sides, interior, dashboard, engine)
- **Step 4**: AI-suggested price based on market data + manual override
- **Step 5**: Review & submit listing
- **Listing states**: Draft > Pending Review > Active > Sold > Expired

#### 3.4 Messaging / Chat
- Real-time chat between buyer and seller (Supabase Realtime)
- Image sharing in chat
- Pre-built quick responses ("Is this still available?", "What's the lowest price?")
- Chat linked to specific car listing
- Push notifications for new messages

#### 3.5 Saved & Favorites
- Save cars to wishlist
- Saved searches with notification alerts ("Notify me when a Camry under $15k is listed")
- Recently viewed history

#### 3.6 User Profile & Settings
- My listings (seller view)
- My offers (buyer view)
- My chats
- Edit profile
- Notification preferences
- App settings (language, currency, distance unit)

---

### Phase 2 - Growth (4-6 weeks after MVP)

#### 3.7 Inspection & Verification System
- Book inspection appointment
- Inspector app (separate role) for conducting 130-point check
- Inspection report generation with photos per checkpoint
- Verified badge on listing

#### 3.8 Test Drive Booking
- Calendar-based scheduling
- Location picker (seller location or neutral meeting point)
- Confirmation & reminder notifications
- Post-test-drive feedback form

#### 3.9 Make Offer / Negotiation
- Buyer submits offer with optional message
- Seller can accept, reject, or counter
- Offer history thread
- Auto-expire offers after 48 hours

#### 3.10 Financing Calculator & Referral
- EMI calculator (principal, rate, tenure)
- Pre-approved financing check (soft credit pull via partner API)
- Bank partner integration for loan application
- Insurance quote integration

---

### Phase 3 - Scale

#### 3.11 Dealer Dashboard
- Bulk upload via CSV/API
- Inventory management
- Lead analytics
- Promoted listings

#### 3.12 Secure Payments
- Escrow-based payment flow
- Payment milestones (booking amount > full payment)
- Refund policy engine

#### 3.13 Document Transfer
- Digital ownership transfer workflow
- Document upload & verification
- Status tracking

#### 3.14 Reviews & Ratings
- Buyer rates seller after transaction
- Seller rates buyer
- Car-specific reviews
- Trust score algorithm

#### 3.15 Admin Panel (Web)
- Listing moderation queue
- User management
- Inspection management
- Revenue dashboard
- Content management (banners, promotions)

---

## 4. Technical Architecture

### 4.1 Frontend - React Native (Expo)

```
cosmos-carvaan/
├── apps/
│   └── mobile/                    # React Native (Expo) app
│       ├── app/                   # Expo Router (file-based routing)
│       │   ├── (auth)/            # Auth screens group
│       │   │   ├── login.tsx
│       │   │   ├── otp.tsx
│       │   │   └── onboarding.tsx
│       │   ├── (tabs)/            # Main tab navigation
│       │   │   ├── index.tsx      # Home / Browse
│       │   │   ├── search.tsx     # Search & Filters
│       │   │   ├── sell.tsx       # Sell Your Car
│       │   │   ├── inbox.tsx      # Messages
│       │   │   └── profile.tsx    # Profile
│       │   ├── car/
│       │   │   └── [id].tsx       # Car Detail
│       │   ├── chat/
│       │   │   └── [id].tsx       # Chat Thread
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── ui/                # Design system primitives
│       │   ├── car/               # Car-specific components
│       │   ├── forms/             # Form components
│       │   └── layout/            # Layout components
│       ├── hooks/                 # Custom hooks
│       ├── lib/
│       │   ├── supabase.ts        # Supabase client
│       │   ├── api.ts             # API client
│       │   └── storage.ts         # Async storage utils
│       ├── stores/                # Zustand stores
│       ├── constants/
│       ├── types/
│       └── assets/
├── packages/
│   └── shared/                    # Shared types, validators, constants
└── supabase/
    ├── migrations/                # SQL migrations
    ├── functions/                 # Edge Functions (Deno)
    └── seed.sql
```

**Key Libraries:**
- `expo-router` - File-based navigation
- `@supabase/supabase-js` - Supabase client
- `zustand` - State management
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Gestures
- `expo-image` - Optimized image loading
- `react-hook-form` + `zod` - Form validation
- `@tanstack/react-query` - Server state / caching
- `expo-notifications` - Push notifications
- `expo-camera` - Guided photo capture

### 4.2 Backend - Supabase + Edge Functions

**Supabase provides out-of-the-box:**
- **Auth**: Phone OTP, Google, Apple sign-in
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Car photos, inspection reports, chat images
- **Realtime**: Live chat, listing updates, notifications
- **Edge Functions**: Server-side logic (Deno/TypeScript)

**Custom Edge Functions (Node.js-style via Deno):**

| Function | Purpose |
|----------|---------|
| `price-estimate` | AI-powered car valuation based on market data |
| `create-listing` | Validate + create listing with photo processing |
| `send-notification` | Push notification dispatch (Expo Push API) |
| `process-payment` | Payment intent creation + webhook handler |
| `generate-inspection-report` | PDF generation from inspection data |
| `search-cars` | Full-text + filtered search with PostGIS location |

### 4.3 Database Schema (Core Tables)

```sql
-- Users & Profiles
profiles (id, phone, email, full_name, avatar_url, city, role, rating, created_at)

-- Car Master Data
car_makes (id, name, logo_url, country)
car_models (id, make_id, name, body_type, year_start, year_end)
car_variants (id, model_id, name, engine_cc, fuel_type, transmission)

-- Listings
listings (
  id, seller_id, make_id, model_id, variant_id,
  year, mileage, price, negotiable, color,
  city, location_lat, location_lng,
  description, condition, num_owners,
  inspection_status, inspection_report_id,
  status [draft|pending|active|sold|expired],
  featured, views_count, saves_count,
  created_at, updated_at, expires_at
)

listing_photos (id, listing_id, url, position, is_primary)

-- Inspection
inspections (id, listing_id, inspector_id, scheduled_at, completed_at, overall_score)
inspection_items (id, inspection_id, category, item_name, status, notes, photo_url)

-- Interactions
saved_cars (user_id, listing_id, created_at)
saved_searches (id, user_id, filters_json, notify, created_at)
offers (id, listing_id, buyer_id, amount, message, status, expires_at)
test_drives (id, listing_id, buyer_id, scheduled_at, location, status)

-- Messaging
conversations (id, listing_id, buyer_id, seller_id, last_message_at)
messages (id, conversation_id, sender_id, content, type [text|image|offer|system], read_at, created_at)

-- Reviews
reviews (id, reviewer_id, reviewee_id, listing_id, rating, comment, created_at)
```

### 4.4 Row Level Security (RLS) Policies

```sql
-- Users can only read active listings
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

-- Sellers can only edit their own listings
CREATE POLICY "Sellers manage own listings"
  ON listings FOR ALL
  USING (auth.uid() = seller_id);

-- Chat participants can read their conversations
CREATE POLICY "Chat participants only"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );
```

### 4.5 Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `car-photos` | Listing images | Public read, authenticated write |
| `avatars` | Profile pictures | Public read, owner write |
| `chat-images` | In-chat shared photos | Conversation participants only |
| `inspection-docs` | Inspection reports/PDFs | Listing owner + buyer |

---

## 5. UI/UX Design Direction

### Design Principles
- **Trust-first**: Verified badges, inspection scores, secure payment indicators
- **Photo-centric**: Large hero images, gallery-first detail pages
- **Minimal friction**: Maximum 3 taps to any primary action
- **Familiar patterns**: Card-based browse (like real estate apps), tab navigation

### Key Screens (Priority Order)
1. Home / Browse (cards with hero image, price, key specs)
2. Car Detail (photo gallery, specs, inspection, CTA buttons)
3. Search / Filters (bottom sheet with filter chips)
4. Sell Flow (multi-step wizard with progress bar)
5. Chat Thread (WhatsApp-style with car card header)
6. Profile / My Listings

### Color Direction
- Primary: Deep teal or navy (trust, professionalism)
- Accent: Warm amber/orange (energy, CTA buttons)
- Background: Clean white/light gray
- Success: Green (verified, inspected)
- Cards: White with subtle shadow, rounded corners

---

## 6. Build Instructions for Claude

### Step-by-step skill usage:

#### Phase 0: Architecture & Planning
```
Use: /everything-claude-code:plan
- Generate full task breakdown from this PRD
- Identify dependencies between features
- Create implementation phases

Use: /everything-claude-code:architect (via architect agent)
- Design the system architecture
- Define API contracts between frontend and Supabase
- Plan database schema with RLS policies
```

#### Phase 1: Project Setup
```
Use: Bash tool
- Initialize Expo project: npx create-expo-app@latest
- Set up Supabase project: npx supabase init
- Install core dependencies
- Configure TypeScript, ESLint, Prettier

Use: /everything-claude-code:postgres-patterns
- Design and create database migrations
- Set up RLS policies
- Seed master data (car makes, models, variants)
```

#### Phase 2: Frontend Development
```
Use: /frontend-design:frontend-design
- Design the complete UI system
- Create all screens with distinctive styling
- Ensure production-quality components

Use: /everything-claude-code:frontend-patterns
- Component architecture (atomic design)
- State management with Zustand
- React Query for server state
- Form handling with react-hook-form + zod

Use: /everything-claude-code:tdd-workflow
- Write tests for all business logic
- Component tests for critical flows
- Integration tests for form submissions
```

#### Phase 3: Backend Development
```
Use: /everything-claude-code:backend-patterns
- Edge Function architecture
- API endpoint design
- Error handling patterns

Use: /everything-claude-code:api-design
- RESTful API design for Edge Functions
- Request/response schemas
- Pagination, filtering, sorting patterns

Use: /everything-claude-code:database-migrations
- Migration strategy
- Seed data management
- Schema versioning
```

#### Phase 4: Integration & Features
```
Use: /everything-claude-code:security-review
- Auth flow security
- RLS policy validation
- Input sanitization
- File upload security

Use: /everything-claude-code:e2e-testing (or e2e agent)
- Critical path E2E tests
- Browse > Detail > Chat flow
- Sell car flow end-to-end
- Auth flow testing
```

#### Phase 5: Polish & Deploy
```
Use: /everything-claude-code:docker-patterns
- Containerize any custom Node.js services

Use: /everything-claude-code:deployment-patterns
- CI/CD pipeline setup
- Environment management
- Expo EAS Build configuration

Use: /everything-claude-code:verification-loop
- Final quality gate before release
```

---

## 7. API Endpoints (Edge Functions)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP to phone |
| POST | `/auth/verify-otp` | Verify OTP and create session |
| PUT | `/auth/profile` | Update user profile |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/listings` | Search/filter listings (paginated) |
| GET | `/listings/:id` | Get listing detail |
| POST | `/listings` | Create new listing |
| PUT | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Soft-delete listing |
| POST | `/listings/:id/photos` | Upload photos |
| GET | `/listings/:id/similar` | Get similar listings |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/listings/:id/save` | Save/unsave listing |
| POST | `/listings/:id/offer` | Make an offer |
| POST | `/listings/:id/test-drive` | Book test drive |
| GET | `/conversations` | Get user's conversations |
| POST | `/conversations/:id/messages` | Send message |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/makes` | List all car makes |
| GET | `/makes/:id/models` | List models for make |
| POST | `/price-estimate` | Get AI price estimate |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Home feed loads in < 2s, image lazy loading, infinite scroll |
| **Offline** | Saved cars viewable offline, draft listings saved locally |
| **i18n** | English + Arabic (RTL support) |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Security** | RLS on all tables, signed URLs for private storage, rate limiting |
| **Scalability** | Supabase handles up to 500K MAU on Pro plan |
| **Analytics** | Track: listing views, search queries, conversion funnel, chat engagement |

---

## 9. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Listings created (first month) | 500+ |
| MAU | 5,000 |
| Avg time to sell | < 21 days |
| Chat response rate | > 60% within 1 hour |
| App Store rating | 4.5+ |
| Crash-free sessions | > 99.5% |

---

## 10. Getting Started

```bash
# 1. Initialize the project
npx create-expo-app@latest cosmos-carvaan --template tabs
cd cosmos-carvaan

# 2. Install core dependencies
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install expo-image expo-camera expo-notifications
npm install zustand @tanstack/react-query react-hook-form zod
npm install react-native-reanimated react-native-gesture-handler

# 3. Initialize Supabase
npx supabase init
npx supabase start  # local development

# 4. Run the app
npx expo start
```

---

> **Next Step:** Tell Claude to start with Phase 0 planning using the `/everything-claude-code:plan` skill, then proceed phase by phase. Each phase should use the recommended skills listed in Section 6.
