# Cosmos Carvaan - System Architecture Document

```
Version: 1.0.0
Date: 2026-03-11
Status: Draft
Author: Architecture Review
PRD Reference: /CARVAAN-PRD.md
```

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture (Supabase)](#3-backend-architecture-supabase)
4. [API Contract](#4-api-contract)
5. [Security Architecture](#5-security-architecture)
6. [Performance Architecture](#6-performance-architecture)
7. [Architecture Decision Records](#7-architecture-decision-records)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
+-------------------------------------------------------------------+
|                        CLIENT LAYER                                |
|                                                                    |
|  +-----------------------------+  +----------------------------+   |
|  |   React Native (Expo)      |  |   Admin Panel (Web)        |   |
|  |   iOS + Android             |  |   Next.js (Phase 3)       |   |
|  |   Expo Router               |  |                            |   |
|  +----------+------------------+  +----------+-----------------+   |
|             |                                |                     |
+-------------------------------------------------------------------+
              |                                |
              v                                v
+-------------------------------------------------------------------+
|                     API GATEWAY LAYER                               |
|                                                                    |
|  +-----------------------------+  +----------------------------+   |
|  |   Supabase Client SDK      |  |   Supabase Edge Functions  |   |
|  |   (Direct DB, Auth,        |  |   (Deno/TypeScript)        |   |
|  |    Storage, Realtime)       |  |   - price-estimate         |   |
|  +----------+------------------+  |   - create-listing          |   |
|             |                     |   - search-cars             |   |
|             |                     |   - send-notification        |   |
|             |                     |   - process-payment          |   |
|             |                     |   - generate-inspection-rpt  |   |
|             |                     +----------+-----------------+   |
|             |                                |                     |
+-------------------------------------------------------------------+
              |                                |
              v                                v
+-------------------------------------------------------------------+
|                      DATA LAYER                                    |
|                                                                    |
|  +----------------+  +-------------+  +-----------------------+    |
|  |  PostgreSQL    |  |  Storage    |  |  Realtime Engine      |    |
|  |  (Supabase)   |  |  (S3-compat)|  |  (WebSocket)          |    |
|  |  + RLS        |  |  Buckets:   |  |  Channels:            |    |
|  |  + pg_trgm    |  |  car-photos |  |  messages              |    |
|  |  + PostGIS    |  |  avatars    |  |  listing-updates       |    |
|  |  + Full-Text  |  |  chat-imgs  |  |  notifications         |    |
|  +----------------+  |  insp-docs  |  +-----------------------+    |
|                       +-------------+                              |
+-------------------------------------------------------------------+
              |
              v
+-------------------------------------------------------------------+
|                   EXTERNAL SERVICES                                |
|                                                                    |
|  +-------------+  +-------------+  +------------+  +-----------+  |
|  | Expo Push   |  | Supabase    |  | Image CDN  |  | Payment   |  |
|  | Notification|  | Auth        |  | (Supabase   |  | Gateway   |  |
|  | Service     |  | (OTP,       |  |  Transform) |  | (Phase 3) |  |
|  |             |  |  Google,    |  |             |  |           |  |
|  |             |  |  Apple)     |  |             |  |           |  |
|  +-------------+  +-------------+  +------------+  +-----------+  |
+-------------------------------------------------------------------+
```

### 1.2 Component Interaction Flow

**Browse and Purchase Flow:**
```
User -> Expo App -> Supabase PostgREST (listings query with RLS)
                 -> Supabase Storage CDN (car photos)
                 -> Edge Function: search-cars (complex filtered search)
                 -> Supabase Realtime (chat with seller)
```

**Sell Flow:**
```
User -> Expo App -> Edge Function: create-listing (validation + processing)
                 -> Supabase Storage (photo upload with signed URLs)
                 -> Edge Function: price-estimate (AI valuation)
                 -> PostgreSQL (listing insert, goes to 'pending' status)
```

**Chat Flow:**
```
User -> Expo App -> Supabase Realtime (subscribe to conversation channel)
                 -> PostgREST INSERT (new message, RLS enforced)
                 -> Realtime broadcast -> Other participant receives message
                 -> Edge Function: send-notification (push to offline user)
```

### 1.3 Technology Decisions Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile App | React Native (Expo SDK 52+) | Cross-platform, file-based routing, OTA updates |
| Navigation | Expo Router v4 | File-based, deep linking out of box |
| State (client) | Zustand | Lightweight, no boilerplate, middleware support |
| State (server) | TanStack React Query v5 | Cache, background refetch, optimistic updates |
| Forms | react-hook-form + zod | Performance (uncontrolled), schema validation |
| Database | Supabase PostgreSQL | RLS, Realtime, managed, extensions |
| Auth | Supabase Auth | OTP, OAuth, JWT, session management |
| Storage | Supabase Storage | S3-compatible, image transforms, signed URLs |
| Realtime | Supabase Realtime | WebSocket channels, Postgres changes |
| Edge Logic | Supabase Edge Functions (Deno) | Low latency, co-located with DB |
| Push Notifications | Expo Push API | Native for Expo, unified iOS/Android |

---

## 2. Frontend Architecture

### 2.1 Expo Router Navigation Structure

```
app/
├── _layout.tsx                  # Root layout: providers (QueryClient, Zustand, Supabase)
├── index.tsx                    # Entry redirect: auth check -> (tabs) or (auth)
│
├── (auth)/                      # Auth group (no tabs visible)
│   ├── _layout.tsx              # Stack navigator, no header
│   ├── login.tsx                # Phone input + social buttons
│   ├── otp.tsx                  # OTP verification (6-digit input)
│   └── onboarding.tsx           # Profile setup: name, city, avatar, role
│
├── (tabs)/                      # Main tab group
│   ├── _layout.tsx              # Tab bar: Home, Search, Sell, Inbox, Profile
│   ├── index.tsx                # Home feed (featured, recent, price drops)
│   ├── search.tsx               # Search with filter bottom sheet
│   ├── sell.tsx                 # Entry to sell wizard OR my listings
│   ├── inbox.tsx                # Conversations list
│   └── profile.tsx              # User profile, settings, my listings
│
├── car/
│   ├── _layout.tsx              # Stack for car screens
│   └── [id].tsx                 # Car detail (gallery, specs, actions)
│
├── sell/
│   ├── _layout.tsx              # Sell wizard stack
│   ├── make-model.tsx           # Step 1: Make/Model/Year/Variant
│   ├── details.tsx              # Step 2: Mileage, condition, color, owners
│   ├── photos.tsx               # Step 3: Guided photo upload
│   ├── pricing.tsx              # Step 4: AI price + manual override
│   └── review.tsx               # Step 5: Review & submit
│
├── chat/
│   ├── _layout.tsx              # Chat stack
│   └── [id].tsx                 # Chat thread (realtime messages)
│
├── offer/
│   └── [listingId].tsx          # Make/view offer screen
│
├── test-drive/
│   └── [listingId].tsx          # Book test drive screen
│
├── settings/
│   ├── _layout.tsx
│   ├── notifications.tsx        # Notification preferences
│   ├── language.tsx             # Language selection (en/ar)
│   └── about.tsx                # App info
│
└── +not-found.tsx               # 404 screen
```

**Deep Linking Scheme:**
```
carvaan://car/123           -> Car detail
carvaan://chat/456          -> Chat thread
carvaan://sell              -> Start selling
carvaan://search?make=toyota&maxPrice=50000
```

### 2.2 State Management Strategy

#### Zustand Stores Breakdown

```
stores/
├── authStore.ts          # Auth session, user profile, tokens
├── filterStore.ts        # Active search filters, sort order
├── sellFlowStore.ts      # Multi-step sell wizard draft state
├── uiStore.ts            # Theme, language, bottom sheet state
└── offlineStore.ts       # Saved cars cache, draft listings queue
```

**authStore.ts**
```
State:
  session: Session | null
  profile: Profile | null
  isLoading: boolean

Actions:
  setSession(session)
  setProfile(profile)
  logout()
  updateProfile(partial)

Middleware:
  persist (AsyncStorage) for session token
```

**filterStore.ts**
```
State:
  makes: string[]
  models: string[]
  yearRange: [number, number]
  priceRange: [number, number]
  mileageRange: [number, number]
  bodyTypes: BodyType[]
  fuelTypes: FuelType[]
  transmission: Transmission | null
  colors: string[]
  city: string | null
  numOwners: number | null
  inspectionStatus: 'verified' | 'pending' | null
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'mileage' | 'year'

Actions:
  setFilter(key, value)
  resetFilters()
  applyFilters() -> returns query params object
  activeFilterCount() -> computed

Middleware:
  persist (AsyncStorage) for last-used filters
```

**sellFlowStore.ts**
```
State:
  currentStep: 1 | 2 | 3 | 4 | 5
  draft: {
    makeId: string | null
    modelId: string | null
    variantId: string | null
    year: number | null
    mileage: number | null
    condition: Condition | null
    color: string | null
    numOwners: number | null
    photos: LocalPhoto[]        # local URIs before upload
    description: string
    price: number | null
    suggestedPrice: number | null
    negotiable: boolean
  }

Actions:
  setStep(step)
  updateDraft(partial)
  addPhoto(photo)
  removePhoto(index)
  reorderPhotos(from, to)
  resetDraft()
  saveDraftLocally()            # persist incomplete drafts

Middleware:
  persist (AsyncStorage) to survive app kills
```

**offlineStore.ts**
```
State:
  savedCars: CachedListing[]          # full listing data for offline
  draftListings: DraftListing[]       # unsent listings (no network)
  pendingActions: QueuedAction[]      # likes, saves queued offline

Actions:
  cacheListing(listing)
  removeCachedListing(id)
  queueDraftListing(draft)
  queueAction(action)
  flushPendingActions()               # called when back online

Middleware:
  persist (AsyncStorage)
```

#### Client vs. Server State Boundary

| Concern | Where | Tool |
|---------|-------|------|
| Auth session | Client (Zustand + persist) | authStore |
| Search filters | Client (Zustand + persist) | filterStore |
| Sell wizard draft | Client (Zustand + persist) | sellFlowStore |
| Offline cache | Client (Zustand + persist) | offlineStore |
| UI preferences | Client (Zustand + persist) | uiStore |
| Listings data | Server (React Query) | useListings() |
| Car detail | Server (React Query) | useListing(id) |
| Conversations | Server (React Query + Realtime) | useConversations() |
| Messages | Server (React Query + Realtime) | useMessages(convId) |
| User profile | Server (React Query) + Client sync | useProfile() |
| Makes/Models | Server (React Query, staleTime: Infinity) | useMakes() |

### 2.3 React Query Cache Strategy

```typescript
// Query key factory - consistent key structure
const queryKeys = {
  listings: {
    all:      ['listings'] as const,
    list:     (filters: FilterParams) => ['listings', 'list', filters] as const,
    detail:   (id: string) => ['listings', 'detail', id] as const,
    similar:  (id: string) => ['listings', 'similar', id] as const,
    mine:     () => ['listings', 'mine'] as const,
  },
  makes: {
    all:      ['makes'] as const,
    models:   (makeId: string) => ['makes', makeId, 'models'] as const,
    variants: (modelId: string) => ['models', modelId, 'variants'] as const,
  },
  conversations: {
    all:      ['conversations'] as const,
    detail:   (id: string) => ['conversations', id] as const,
    messages: (id: string) => ['conversations', id, 'messages'] as const,
  },
  profile: {
    me:       ['profile', 'me'] as const,
    user:     (id: string) => ['profile', id] as const,
  },
  offers: {
    mine:     ['offers', 'mine'] as const,
    listing:  (listingId: string) => ['offers', 'listing', listingId] as const,
  },
  savedCars:  ['saved-cars'] as const,
};
```

**Cache configuration per entity:**

| Entity | staleTime | gcTime | refetchOnMount | refetchOnWindowFocus | Notes |
|--------|-----------|--------|----------------|---------------------|-------|
| Listings (list) | 30s | 5min | true | true | Fresh search results |
| Listing (detail) | 60s | 10min | true | true | May have new offers |
| Similar listings | 5min | 15min | false | false | Low update frequency |
| Makes/Models | Infinity | Infinity | false | false | Master data, rarely changes |
| Conversations | 10s | 5min | true | true | Near-realtime needed |
| Messages | 0 (always stale) | 5min | true | true | Realtime supplements this |
| Profile (me) | 5min | 30min | true | false | Rarely changes mid-session |
| Saved cars | 60s | 10min | true | true | Cross-device sync |
| Offers | 30s | 5min | true | true | Time-sensitive |

**Infinite query for listing feeds:**
```
useInfiniteQuery for:
  - Home feed (featured, recent, price drops - each a separate query)
  - Search results
  - My listings
  - Conversations list

pageParam: cursor-based (last item created_at + id)
getNextPageParam: returns cursor if page.length === PAGE_SIZE (20)
```

**Optimistic updates:**
```
Save/unsave car:
  1. onMutate: update savedCars cache immediately
  2. onError: rollback cache
  3. onSettled: invalidate savedCars query

Send message:
  1. onMutate: append message to messages cache with 'pending' status
  2. onSuccess: replace pending with confirmed (server id + timestamp)
  3. onError: mark message as 'failed', show retry button
```

### 2.4 Component Hierarchy (Atomic Design)

```
components/
├── ui/                          # ATOMS - Design system primitives
│   ├── Button.tsx               # Primary, secondary, outline, ghost variants
│   ├── Text.tsx                 # Heading, body, caption with i18n support
│   ├── Input.tsx                # Text input with label, error, icon slots
│   ├── Badge.tsx                # Verified, featured, price drop badges
│   ├── Avatar.tsx               # User avatar with fallback initials
│   ├── Icon.tsx                 # Icon wrapper (expo-vector-icons)
│   ├── Skeleton.tsx             # Loading placeholder
│   ├── Chip.tsx                 # Filter chip (toggleable)
│   ├── Divider.tsx
│   ├── Slider.tsx               # Range slider for price/mileage
│   ├── StarRating.tsx           # 1-5 star display/input
│   └── ProgressBar.tsx          # Sell flow step indicator
│
├── car/                         # MOLECULES - Car-specific
│   ├── CarCard.tsx              # Listing card (image, price, specs summary)
│   ├── CarCardSkeleton.tsx      # Loading state for CarCard
│   ├── CarGallery.tsx           # Swipeable photo gallery with pinch-zoom
│   ├── CarSpecsGrid.tsx         # Key specs: year, mileage, fuel, transmission
│   ├── PriceDisplay.tsx         # Price + EMI estimate + negotiable badge
│   ├── InspectionReport.tsx     # Expandable 130-point checklist
│   ├── InspectionBadge.tsx      # Verified/pending/not-inspected indicator
│   ├── SimilarCarsCarousel.tsx  # Horizontal scroll of similar listings
│   ├── SellerInfo.tsx           # Seller name, rating, response time
│   └── SaveButton.tsx           # Heart icon toggle with optimistic update
│
├── forms/                       # MOLECULES - Form components
│   ├── PhoneInput.tsx           # Country code + phone number
│   ├── OtpInput.tsx             # 6-digit OTP boxes
│   ├── CascadingSelect.tsx      # Make > Model > Variant dropdowns
│   ├── PhotoUploader.tsx        # Grid of photos with add/remove/reorder
│   ├── GuidedCapture.tsx        # Camera overlay with angle guide
│   ├── PriceInput.tsx           # Currency-formatted number input
│   ├── FilterSheet.tsx          # Bottom sheet with all filter controls
│   └── SearchBar.tsx            # Search input with voice + clear
│
├── chat/                        # MOLECULES - Chat components
│   ├── MessageBubble.tsx        # Text/image/offer/system message
│   ├── ChatInput.tsx            # Text input + image attach + quick replies
│   ├── QuickReplies.tsx         # Preset response buttons
│   ├── ConversationItem.tsx     # Conversation list row
│   └── CarChatHeader.tsx        # Mini car card at top of chat
│
├── layout/                      # ORGANISMS - Layout components
│   ├── Screen.tsx               # Safe area + scroll + padding wrapper
│   ├── TabBar.tsx               # Custom bottom tab bar
│   ├── Header.tsx               # Screen header with back/title/actions
│   ├── BottomSheet.tsx          # Reusable bottom sheet (filters, actions)
│   ├── EmptyState.tsx           # No results / no listings illustration
│   ├── ErrorBoundary.tsx        # Error fallback UI
│   ├── OfflineBanner.tsx        # "No internet" banner
│   └── ListFooter.tsx           # Loading spinner / end-of-list message
│
└── sections/                    # ORGANISMS - Screen sections
    ├── FeaturedCars.tsx         # Horizontal featured carousel
    ├── RecentlyAdded.tsx        # Vertical list of newest
    ├── PriceDrops.tsx           # Cars with recent price reductions
    ├── MyListings.tsx           # Seller's listings with status
    ├── MyOffers.tsx             # Buyer's sent offers
    └── SellWizardStep.tsx       # Wrapper for sell flow steps
```

### 2.5 Offline-First Patterns

**Saved Cars (offline read):**
```
1. User saves a car -> React Query mutation + cache update
2. offlineStore.cacheListing(fullListingData) persists to AsyncStorage
3. When offline, useSavedCars() falls back to offlineStore.savedCars
4. When back online, reconcile: server savedCars is source of truth
5. Stale local entries (listing status changed) are cleaned on sync
```

**Draft Listings (offline write):**
```
1. sellFlowStore persists every field change to AsyncStorage
2. Photos stored as local file URIs (not uploaded until online)
3. On submit:
   a. If online: upload photos -> create listing -> clear draft
   b. If offline: queue in offlineStore.draftListings
4. On reconnect (NetInfo listener):
   a. Flush draftListings queue sequentially
   b. Upload photos first, then create listing with remote URLs
   c. Notify user of success/failure per draft
```

**Pending Actions Queue:**
```
Actions that can be queued offline:
  - Save/unsave car
  - Mark message as read
  - Update profile fields

NOT queued (require immediate feedback):
  - Send message (show failed state, manual retry)
  - Make offer (time-sensitive, reject if offline)
  - Book test drive (calendar conflicts)
```

**Network State Management:**
```
NetInfo subscription in root _layout.tsx:
  - Show OfflineBanner when disconnected
  - On reconnect: offlineStore.flushPendingActions()
  - React Query: set networkMode: 'offlineFirst'
```

---

## 3. Backend Architecture (Supabase)

### 3.1 Complete Database Schema

```sql
-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "postgis";         -- geo queries
CREATE EXTENSION IF NOT EXISTS "unaccent";        -- accent-insensitive search

-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE listing_status AS ENUM (
  'draft', 'pending_review', 'active', 'sold', 'expired', 'rejected'
);

CREATE TYPE body_type AS ENUM (
  'sedan', 'suv', 'hatchback', 'truck', 'coupe', 'van', 'convertible', 'wagon'
);

CREATE TYPE fuel_type AS ENUM (
  'petrol', 'diesel', 'hybrid', 'electric'
);

CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');

CREATE TYPE car_condition AS ENUM ('excellent', 'good', 'fair', 'poor');

CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');

CREATE TYPE test_drive_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');

CREATE TYPE message_type AS ENUM ('text', 'image', 'offer', 'system');

CREATE TYPE inspection_item_status AS ENUM ('pass', 'fair', 'fail', 'not_applicable');

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'both', 'inspector', 'admin');


-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         TEXT UNIQUE,
  email         TEXT,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  city          TEXT,
  role          user_role NOT NULL DEFAULT 'buyer',
  bio           TEXT,
  rating_avg    NUMERIC(2,1) DEFAULT 0.0,
  rating_count  INTEGER DEFAULT 0,
  response_time_minutes INTEGER,  -- avg response time
  push_token    TEXT,              -- Expo push token
  language      TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_role ON profiles(role);


-- =============================================================
-- CAR MASTER DATA
-- =============================================================
CREATE TABLE car_makes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  name_ar     TEXT,                   -- Arabic name
  logo_url    TEXT,
  country     TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_popular  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_car_makes_popular ON car_makes(is_popular, sort_order);

CREATE TABLE car_models (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make_id     UUID NOT NULL REFERENCES car_makes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  name_ar     TEXT,
  body_type   body_type,
  year_start  INTEGER,
  year_end    INTEGER,               -- NULL means still in production
  is_popular  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(make_id, name)
);

CREATE INDEX idx_car_models_make ON car_models(make_id);
CREATE INDEX idx_car_models_body ON car_models(body_type);

CREATE TABLE car_variants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id      UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  engine_cc     INTEGER,
  fuel_type     fuel_type,
  transmission  transmission_type,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_id, name)
);

CREATE INDEX idx_car_variants_model ON car_variants(model_id);


-- =============================================================
-- LISTINGS
-- =============================================================
CREATE TABLE listings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make_id               UUID NOT NULL REFERENCES car_makes(id),
  model_id              UUID NOT NULL REFERENCES car_models(id),
  variant_id            UUID REFERENCES car_variants(id),
  year                  INTEGER NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  mileage               INTEGER NOT NULL CHECK (mileage >= 0),
  price                 INTEGER NOT NULL CHECK (price > 0),      -- stored in smallest currency unit (fils/cents)
  price_currency        TEXT NOT NULL DEFAULT 'AED',
  negotiable            BOOLEAN DEFAULT TRUE,
  color                 TEXT,
  city                  TEXT NOT NULL,
  location              GEOGRAPHY(POINT, 4326),                   -- PostGIS point
  description           TEXT,
  condition             car_condition NOT NULL DEFAULT 'good',
  num_owners            INTEGER DEFAULT 1 CHECK (num_owners >= 1),
  inspection_status     TEXT DEFAULT 'not_inspected'
                        CHECK (inspection_status IN ('not_inspected', 'pending', 'verified', 'failed')),
  inspection_id         UUID,                                      -- FK added after inspections table
  status                listing_status NOT NULL DEFAULT 'draft',
  rejection_reason      TEXT,
  featured              BOOLEAN DEFAULT FALSE,
  promoted_until        TIMESTAMPTZ,
  views_count           INTEGER DEFAULT 0,
  saves_count           INTEGER DEFAULT 0,
  original_price        INTEGER,                                   -- for price drop tracking
  price_dropped_at      TIMESTAMPTZ,
  search_vector         TSVECTOR,                                  -- full-text search
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  sold_at               TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_make ON listings(make_id);
CREATE INDEX idx_listings_model ON listings(model_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_price ON listings(price) WHERE status = 'active';
CREATE INDEX idx_listings_year ON listings(year) WHERE status = 'active';
CREATE INDEX idx_listings_mileage ON listings(mileage) WHERE status = 'active';
CREATE INDEX idx_listings_featured ON listings(featured, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_listings_created ON listings(created_at DESC) WHERE status = 'active';
CREATE INDEX idx_listings_price_drop ON listings(price_dropped_at DESC NULLS LAST) WHERE status = 'active';
CREATE INDEX idx_listings_location ON listings USING GIST(location) WHERE status = 'active';
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector) WHERE status = 'active';

-- Composite index for common filter combos
CREATE INDEX idx_listings_browse ON listings(status, city, make_id, price, year)
  WHERE status = 'active';

-- Trigger: auto-update search_vector
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(
      (SELECT name FROM car_makes WHERE id = NEW.make_id), ''
    )), 'A') ||
    setweight(to_tsvector('english', COALESCE(
      (SELECT name FROM car_models WHERE id = NEW.model_id), ''
    )), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.color, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- Trigger: track price drops
CREATE OR REPLACE FUNCTION track_price_drop()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS NOT NULL AND NEW.price < OLD.price THEN
    NEW.original_price := COALESCE(OLD.original_price, OLD.price);
    NEW.price_dropped_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_price_drop
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION track_price_drop();


-- =============================================================
-- LISTING PHOTOS
-- =============================================================
CREATE TABLE listing_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  thumbnail_url TEXT,                  -- pre-generated thumbnail
  position    INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE,
  width       INTEGER,
  height      INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id, position);


-- =============================================================
-- INSPECTIONS
-- =============================================================
CREATE TABLE inspections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  inspector_id    UUID NOT NULL REFERENCES profiles(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  overall_score   INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  summary         TEXT,
  report_pdf_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspections_listing ON inspections(listing_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);

-- Add FK from listings to inspections
ALTER TABLE listings
  ADD CONSTRAINT fk_listings_inspection
  FOREIGN KEY (inspection_id) REFERENCES inspections(id);

CREATE TABLE inspection_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id   UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,       -- 'exterior', 'interior', 'engine', 'electronics', 'tires', 'brakes'
  item_name       TEXT NOT NULL,
  status          inspection_item_status NOT NULL,
  notes           TEXT,
  photo_url       TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspection_items_inspection ON inspection_items(inspection_id);


-- =============================================================
-- SAVED CARS
-- =============================================================
CREATE TABLE saved_cars (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_saved_cars_user ON saved_cars(user_id, created_at DESC);


-- =============================================================
-- SAVED SEARCHES
-- =============================================================
CREATE TABLE saved_searches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       TEXT,                    -- user-defined name
  filters     JSONB NOT NULL,          -- serialized filter state
  notify      BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_notify ON saved_searches(notify) WHERE notify = TRUE;


-- =============================================================
-- OFFERS
-- =============================================================
CREATE TABLE offers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL CHECK (amount > 0),
  message       TEXT,
  status        offer_status NOT NULL DEFAULT 'pending',
  counter_amount INTEGER,
  responded_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_listing ON offers(listing_id, created_at DESC);
CREATE INDEX idx_offers_buyer ON offers(buyer_id, created_at DESC);
CREATE INDEX idx_offers_expiry ON offers(expires_at) WHERE status = 'pending';


-- =============================================================
-- TEST DRIVES
-- =============================================================
CREATE TABLE test_drives (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  location_text TEXT,
  location      GEOGRAPHY(POINT, 4326),
  status        test_drive_status NOT NULL DEFAULT 'requested',
  notes         TEXT,
  feedback      TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_test_drives_listing ON test_drives(listing_id);
CREATE INDEX idx_test_drives_buyer ON test_drives(buyer_id);
CREATE INDEX idx_test_drives_schedule ON test_drives(scheduled_at) WHERE status IN ('requested', 'confirmed');


-- =============================================================
-- CONVERSATIONS & MESSAGES
-- =============================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  buyer_unread_count  INTEGER DEFAULT 0,
  seller_unread_count INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)       -- one conversation per buyer per listing
);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id, last_message_at DESC);
CREATE INDEX idx_conversations_seller ON conversations(seller_id, last_message_at DESC);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  content         TEXT NOT NULL,
  type            message_type NOT NULL DEFAULT 'text',
  metadata        JSONB,               -- for offer messages: { offerId, amount }; for images: { url, width, height }
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Trigger: update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    buyer_unread_count = CASE
      WHEN NEW.sender_id = seller_id THEN buyer_unread_count + 1
      ELSE buyer_unread_count
    END,
    seller_unread_count = CASE
      WHEN NEW.sender_id = buyer_id THEN seller_unread_count + 1
      ELSE seller_unread_count
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();


-- =============================================================
-- RECENTLY VIEWED
-- =============================================================
CREATE TABLE recently_viewed (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_recently_viewed_user ON recently_viewed(user_id, viewed_at DESC);


-- =============================================================
-- REVIEWS
-- =============================================================
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, listing_id)     -- one review per user per listing
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id, created_at DESC);

-- Trigger: update profile rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();


-- =============================================================
-- NOTIFICATIONS LOG
-- =============================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,                   -- { type: 'message', conversationId: '...' }
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;


-- =============================================================
-- ANALYTICS EVENTS
-- =============================================================
CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,           -- 'listing_view', 'search', 'save', 'chat_start', etc.
  properties  JSONB,                   -- event-specific data
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);

-- Partition by month for performance (for scale)
-- In production, consider partitioning this table by created_at range.


-- =============================================================
-- CRON: Expire stale offers and listings
-- =============================================================
-- Use pg_cron (available on Supabase Pro) or Edge Function cron

-- Expire pending offers past 48 hours
-- UPDATE offers SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW();

-- Expire active listings past 90 days
-- UPDATE listings SET status = 'expired' WHERE status = 'active' AND expires_at < NOW();
```

### 3.2 Row Level Security (RLS) Policies

```sql
-- =============================================================
-- Enable RLS on all tables
-- =============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- PROFILES
-- =============================================================
-- Anyone can view public profile info
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (TRUE);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile insert handled by auth trigger (service role)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- =============================================================
-- CAR MASTER DATA (read-only for all authenticated users)
-- =============================================================
CREATE POLICY "makes_select_all" ON car_makes FOR SELECT USING (TRUE);
CREATE POLICY "models_select_all" ON car_models FOR SELECT USING (TRUE);
CREATE POLICY "variants_select_all" ON car_variants FOR SELECT USING (TRUE);
-- Insert/update/delete only via service role (admin migrations)


-- =============================================================
-- LISTINGS
-- =============================================================
-- Public: view active listings
CREATE POLICY "listings_select_active"
  ON listings FOR SELECT
  USING (
    status = 'active'
    OR seller_id = auth.uid()     -- sellers see all their own listings (any status)
  );

-- Authenticated: create listings
CREATE POLICY "listings_insert_own"
  ON listings FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND status = 'draft'          -- new listings must start as draft
  );

-- Seller: update own listings
CREATE POLICY "listings_update_own"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Seller: soft-delete own listings (set status to 'expired')
-- Hard delete not allowed; use update to change status
CREATE POLICY "listings_delete_own"
  ON listings FOR DELETE
  USING (auth.uid() = seller_id AND status IN ('draft', 'expired'));


-- =============================================================
-- LISTING PHOTOS
-- =============================================================
-- Public: view photos for active listings
CREATE POLICY "listing_photos_select"
  ON listing_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_photos.listing_id
      AND (listings.status = 'active' OR listings.seller_id = auth.uid())
    )
  );

-- Seller: manage photos for own listings
CREATE POLICY "listing_photos_insert"
  ON listing_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_photos.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "listing_photos_update"
  ON listing_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_photos.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "listing_photos_delete"
  ON listing_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_photos.listing_id
      AND listings.seller_id = auth.uid()
    )
  );


-- =============================================================
-- INSPECTIONS
-- =============================================================
-- Visible to listing seller + inspector + buyers viewing active listings
CREATE POLICY "inspections_select"
  ON inspections FOR SELECT
  USING (
    inspector_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = inspections.listing_id
      AND (listings.seller_id = auth.uid() OR listings.status = 'active')
    )
  );

-- Only inspectors can insert/update
CREATE POLICY "inspections_insert_inspector"
  ON inspections FOR INSERT
  WITH CHECK (auth.uid() = inspector_id);

CREATE POLICY "inspections_update_inspector"
  ON inspections FOR UPDATE
  USING (auth.uid() = inspector_id);

-- Inspection items follow same pattern
CREATE POLICY "inspection_items_select"
  ON inspection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_items.inspection_id
      AND (
        inspections.inspector_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = inspections.listing_id
          AND (listings.seller_id = auth.uid() OR listings.status = 'active')
        )
      )
    )
  );

CREATE POLICY "inspection_items_insert_inspector"
  ON inspection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_items.inspection_id
      AND inspections.inspector_id = auth.uid()
    )
  );

CREATE POLICY "inspection_items_update_inspector"
  ON inspection_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_items.inspection_id
      AND inspections.inspector_id = auth.uid()
    )
  );


-- =============================================================
-- SAVED CARS
-- =============================================================
CREATE POLICY "saved_cars_select_own"
  ON saved_cars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_cars_insert_own"
  ON saved_cars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_cars_delete_own"
  ON saved_cars FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================
-- SAVED SEARCHES
-- =============================================================
CREATE POLICY "saved_searches_select_own"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_insert_own"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_searches_update_own"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_delete_own"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================
-- OFFERS
-- =============================================================
-- Buyer sees own offers; seller sees offers on their listings
CREATE POLICY "offers_select"
  ON offers FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = offers.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Only authenticated buyers can create offers
CREATE POLICY "offers_insert_buyer"
  ON offers FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND status = 'pending'
    AND NOT EXISTS (     -- cannot offer on own listing
      SELECT 1 FROM listings
      WHERE listings.id = offers.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Seller can update offer status (accept/reject/counter)
CREATE POLICY "offers_update_seller"
  ON offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = offers.listing_id
      AND listings.seller_id = auth.uid()
    )
  );


-- =============================================================
-- TEST DRIVES
-- =============================================================
CREATE POLICY "test_drives_select"
  ON test_drives FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = test_drives.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "test_drives_insert_buyer"
  ON test_drives FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "test_drives_update_participant"
  ON test_drives FOR UPDATE
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = test_drives.listing_id
      AND listings.seller_id = auth.uid()
    )
  );


-- =============================================================
-- CONVERSATIONS
-- =============================================================
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Buyer initiates conversation
CREATE POLICY "conversations_insert_buyer"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Participants can update (read counts)
CREATE POLICY "conversations_update_participant"
  ON conversations FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());


-- =============================================================
-- MESSAGES
-- =============================================================
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Update for read receipts
CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()    -- can only mark OTHER person's messages as read
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );


-- =============================================================
-- RECENTLY VIEWED
-- =============================================================
CREATE POLICY "recently_viewed_select_own"
  ON recently_viewed FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "recently_viewed_insert_own"
  ON recently_viewed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recently_viewed_delete_own"
  ON recently_viewed FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================
-- REVIEWS
-- =============================================================
CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (TRUE);              -- reviews are public

CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != reviewee_id);

CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);


-- =============================================================
-- NOTIFICATIONS
-- =============================================================
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
-- Insert via service role only (Edge Functions)


-- =============================================================
-- ANALYTICS EVENTS
-- =============================================================
-- Insert only (no read from client; analytics read via service role / admin)
CREATE POLICY "analytics_insert_own"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- Select via service role only
```

### 3.3 Storage Bucket Policies

```sql
-- =============================================================
-- BUCKET: car-photos (public read, authenticated write)
-- =============================================================
-- Structure: car-photos/{listing_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-photos', 'car-photos', TRUE,
  10485760,  -- 10MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Anyone can view car photos
CREATE POLICY "car_photos_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-photos');

-- Authenticated users can upload to their listing's folder
CREATE POLICY "car_photos_insert_owner"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'car-photos'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id::text = (storage.foldername(name))[1]
      AND listings.seller_id = auth.uid()
    )
  );

-- Owner can delete their photos
CREATE POLICY "car_photos_delete_owner"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'car-photos'
    AND EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id::text = (storage.foldername(name))[1]
      AND listings.seller_id = auth.uid()
    )
  );


-- =============================================================
-- BUCKET: avatars (public read, owner write)
-- =============================================================
-- Structure: avatars/{user_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', TRUE,
  5242880,   -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- =============================================================
-- BUCKET: chat-images (participants only)
-- =============================================================
-- Structure: chat-images/{conversation_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images', 'chat-images', FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "chat_images_select_participant"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id::text = (storage.foldername(name))[1]
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "chat_images_insert_participant"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id::text = (storage.foldername(name))[1]
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );


-- =============================================================
-- BUCKET: inspection-docs (private, seller + buyer of active listing)
-- =============================================================
-- Structure: inspection-docs/{listing_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-docs', 'inspection-docs', FALSE,
  20971520,   -- 20MB for PDFs
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

CREATE POLICY "inspection_docs_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inspection-docs'
    AND EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id::text = (storage.foldername(name))[1]
      AND (listings.seller_id = auth.uid() OR listings.status = 'active')
    )
  );

CREATE POLICY "inspection_docs_insert_inspector"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspection-docs'
    AND EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.listing_id::text = (storage.foldername(name))[1]
      AND inspections.inspector_id = auth.uid()
    )
  );
```

### 3.4 Edge Functions Design

#### 3.4.1 `search-cars`

**Purpose:** Complex filtered search with full-text, geo, and faceted filtering. PostgREST alone cannot express the full query efficiently.

```
Input:
{
  q?: string                    // free-text query
  makes?: string[]              // make IDs
  models?: string[]             // model IDs
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  mileageMin?: number
  mileageMax?: number
  bodyTypes?: BodyType[]
  fuelTypes?: FuelType[]
  transmission?: TransmissionType
  colors?: string[]
  city?: string
  lat?: number                  // user location for distance sort
  lng?: number
  radius?: number               // km radius for geo filter
  numOwners?: number
  inspectionStatus?: string
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'mileage' | 'year' | 'distance'
  cursor?: string               // opaque cursor for pagination
  limit?: number                // default 20, max 50
}

Output:
{
  data: ListingSummary[]        // id, primary_photo, make, model, year, price, mileage, city, ...
  nextCursor: string | null
  totalEstimate: number         // approximate count for UI
  facets: {                     // for filter UI counts
    makes: { id: string, name: string, count: number }[]
    bodyTypes: { type: string, count: number }[]
    cities: { city: string, count: number }[]
    priceRange: { min: number, max: number }
    yearRange: { min: number, max: number }
  }
}

Errors:
  400: Invalid filter parameters
  429: Rate limited
```

#### 3.4.2 `create-listing`

**Purpose:** Validate listing data, process photo references, set initial status.

```
Input:
{
  makeId: string
  modelId: string
  variantId?: string
  year: number
  mileage: number
  price: number
  negotiable: boolean
  color: string
  city: string
  lat?: number
  lng?: number
  description: string
  condition: CarCondition
  numOwners: number
  photoKeys: string[]            // storage object keys (already uploaded)
}

Output:
{
  id: string                     // new listing UUID
  status: 'draft'
  createdAt: string
}

Errors:
  400: Validation failed (missing fields, bad types)
  401: Not authenticated
  403: Profile incomplete (must have name + city)
  409: Duplicate (same seller, same make/model/year active listing)
  422: Too few photos (min 6)
```

#### 3.4.3 `price-estimate`

**Purpose:** AI-powered car valuation from market data.

```
Input:
{
  makeId: string
  modelId: string
  variantId?: string
  year: number
  mileage: number
  condition: CarCondition
  city: string
}

Output:
{
  estimatedPrice: number
  confidenceLevel: 'high' | 'medium' | 'low'
  priceRange: { min: number, max: number }
  comparables: {                  // similar recently sold/listed
    listingId: string
    price: number
    mileage: number
    year: number
    soldDaysAgo?: number
  }[]
  marketTrend: 'rising' | 'stable' | 'declining'
}

Errors:
  400: Invalid input
  404: No comparable data for this make/model
  503: AI service unavailable
```

#### 3.4.4 `send-notification`

**Purpose:** Dispatch push notifications via Expo Push API. Called by database triggers or other Edge Functions.

```
Input:
{
  userId: string
  title: string
  body: string
  data?: {
    type: 'message' | 'offer' | 'listing_update' | 'test_drive' | 'saved_search_match'
    entityId: string              // conversationId, offerId, listingId, etc.
  }
}

Output:
{
  sent: boolean
  ticketId?: string               // Expo push ticket
}

Errors:
  400: Missing fields
  404: User has no push token
  503: Expo Push API unavailable
```

#### 3.4.5 `generate-inspection-report`

**Purpose:** Generate PDF inspection report from inspection data.

```
Input:
{
  inspectionId: string
}

Output:
{
  pdfUrl: string                  // signed URL to generated PDF
  overallScore: number
}

Errors:
  401: Not authenticated
  403: Not the inspector for this inspection
  404: Inspection not found
  422: Inspection not completed yet
```

#### 3.4.6 `process-payment` (Phase 3)

```
Input:
{
  listingId: string
  amount: number
  type: 'booking_deposit' | 'full_payment'
}

Output:
{
  paymentIntentId: string
  clientSecret: string
  status: 'requires_payment'
}
```

### 3.5 Realtime Subscriptions Plan

| Channel / Table | Event Type | Subscriber | Purpose |
|----------------|------------|------------|---------|
| `messages` | INSERT | Chat participants (filtered by `conversation_id`) | Real-time chat messages |
| `conversations` | UPDATE | Current user (`buyer_id` or `seller_id`) | Unread count updates, last message preview |
| `offers` | INSERT, UPDATE | Listing seller + offer buyer | New offers, status changes (accept/reject/counter) |
| `listings` | UPDATE | Listing detail screen viewers | Price changes, status updates, sold notification |
| `test_drives` | UPDATE | Buyer + seller of listing | Status changes (confirmed, cancelled) |
| `notifications` | INSERT | Current user | In-app notification badge count |

**Subscription Implementation Pattern:**

```
// Messages: subscribe to specific conversation
supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Append to React Query cache
    queryClient.setQueryData(
      queryKeys.conversations.messages(conversationId),
      (old) => appendMessage(old, payload.new)
    );
  })
  .subscribe();

// Conversations list: subscribe to all user's conversations
supabase
  .channel(`conversations:${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'conversations',
    filter: `buyer_id=eq.${userId}`   // need separate for seller_id
  }, (payload) => {
    queryClient.invalidateQueries(queryKeys.conversations.all);
  })
  .subscribe();
```

**Realtime Configuration:**
- Max channels per connection: 100 (Supabase default)
- Only subscribe when screen is focused (unsubscribe on blur)
- Reconnection handled by Supabase client with exponential backoff
- Fallback: React Query background refetch if Realtime disconnects

---

## 4. API Contract

### 4.1 TypeScript Types

```typescript
// =============================================================
// COMMON TYPES
// =============================================================

type UUID = string;
type ISO8601 = string;   // "2026-03-11T10:30:00Z"
type Currency = number;  // stored in smallest unit (fils for AED)

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  totalEstimate: number;        // approximate count (not exact for perf)
}

interface ApiError {
  error: {
    code: string;               // machine-readable: 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    message: string;            // human-readable
    details?: Record<string, string[]>;  // field-level errors for validation
    requestId: string;          // for support/debugging
  };
}

// HTTP status mapping:
// 400 -> VALIDATION_ERROR, BAD_REQUEST
// 401 -> UNAUTHENTICATED
// 403 -> FORBIDDEN
// 404 -> NOT_FOUND
// 409 -> CONFLICT
// 422 -> UNPROCESSABLE_ENTITY
// 429 -> RATE_LIMITED
// 500 -> INTERNAL_ERROR
// 503 -> SERVICE_UNAVAILABLE


// =============================================================
// AUTH
// =============================================================

// POST /auth/send-otp
interface SendOtpRequest {
  phone: string;                // E.164 format: "+971501234567"
}
interface SendOtpResponse {
  message: string;              // "OTP sent"
  expiresIn: number;            // seconds until OTP expires (120)
}

// POST /auth/verify-otp
interface VerifyOtpRequest {
  phone: string;
  otp: string;                  // 6-digit code
}
interface VerifyOtpResponse {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: ISO8601;
  };
  user: {
    id: UUID;
    isNewUser: boolean;         // trigger onboarding if true
  };
}

// PUT /auth/profile
interface UpdateProfileRequest {
  fullName?: string;
  city?: string;
  avatarUrl?: string;
  role?: 'buyer' | 'seller' | 'both';
  bio?: string;
  language?: 'en' | 'ar';
  pushToken?: string;
}
interface UpdateProfileResponse {
  profile: Profile;
}


// =============================================================
// PROFILES
// =============================================================

interface Profile {
  id: UUID;
  phone: string | null;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  city: string | null;
  role: 'buyer' | 'seller' | 'both' | 'inspector' | 'admin';
  bio: string | null;
  ratingAvg: number;
  ratingCount: number;
  responseTimeMinutes: number | null;
  createdAt: ISO8601;
}


// =============================================================
// LISTINGS
// =============================================================

// GET /listings (search endpoint - via Edge Function)
interface ListingsSearchParams {
  q?: string;
  makes?: UUID[];
  models?: UUID[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: Currency;
  priceMax?: Currency;
  mileageMin?: number;
  mileageMax?: number;
  bodyTypes?: BodyType[];
  fuelTypes?: FuelType[];
  transmission?: TransmissionType;
  colors?: string[];
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  numOwners?: number;
  inspectionStatus?: 'verified' | 'pending' | 'not_inspected';
  sortBy?: SortOption;
  cursor?: string;
  limit?: number;
}

type BodyType = 'sedan' | 'suv' | 'hatchback' | 'truck' | 'coupe' | 'van' | 'convertible' | 'wagon';
type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
type TransmissionType = 'automatic' | 'manual';
type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'mileage' | 'year' | 'distance';

interface ListingSummary {
  id: UUID;
  primaryPhotoUrl: string;
  thumbnailUrl: string;
  make: { id: UUID; name: string };
  model: { id: UUID; name: string };
  year: number;
  mileage: number;
  price: Currency;
  priceCurrency: string;
  negotiable: boolean;
  city: string;
  transmission: TransmissionType | null;
  fuelType: FuelType | null;
  inspectionStatus: string;
  featured: boolean;
  originalPrice: Currency | null;      // non-null = price drop
  savesCount: number;
  isSaved: boolean;                    // relative to current user
  createdAt: ISO8601;
}

interface ListingsSearchResponse extends PaginatedResponse<ListingSummary> {
  facets: {
    makes: { id: UUID; name: string; count: number }[];
    bodyTypes: { type: BodyType; count: number }[];
    cities: { city: string; count: number }[];
    priceRange: { min: Currency; max: Currency };
    yearRange: { min: number; max: number };
  };
}

// GET /listings/:id
interface ListingDetail {
  id: UUID;
  seller: {
    id: UUID;
    fullName: string;
    avatarUrl: string | null;
    ratingAvg: number;
    ratingCount: number;
    responseTimeMinutes: number | null;
    memberSince: ISO8601;
  };
  make: { id: UUID; name: string; logoUrl: string };
  model: { id: UUID; name: string };
  variant: { id: UUID; name: string; engineCc: number; fuelType: FuelType; transmission: TransmissionType } | null;
  year: number;
  mileage: number;
  price: Currency;
  priceCurrency: string;
  negotiable: boolean;
  color: string | null;
  city: string;
  location: { lat: number; lng: number } | null;
  description: string | null;
  condition: CarCondition;
  numOwners: number;
  inspectionStatus: string;
  inspection: {
    id: UUID;
    overallScore: number;
    completedAt: ISO8601;
    categories: {
      category: string;
      items: {
        name: string;
        status: 'pass' | 'fair' | 'fail' | 'not_applicable';
        notes: string | null;
        photoUrl: string | null;
      }[];
    }[];
  } | null;
  photos: {
    id: UUID;
    url: string;
    thumbnailUrl: string;
    position: number;
    width: number;
    height: number;
  }[];
  status: ListingStatus;
  featured: boolean;
  originalPrice: Currency | null;
  viewsCount: number;
  savesCount: number;
  isSaved: boolean;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

type CarCondition = 'excellent' | 'good' | 'fair' | 'poor';
type ListingStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected';

// POST /listings
interface CreateListingRequest {
  makeId: UUID;
  modelId: UUID;
  variantId?: UUID;
  year: number;
  mileage: number;
  price: Currency;
  negotiable: boolean;
  color: string;
  city: string;
  lat?: number;
  lng?: number;
  description: string;
  condition: CarCondition;
  numOwners: number;
  photoKeys: string[];          // already uploaded to storage
}

interface CreateListingResponse {
  id: UUID;
  status: 'draft';
  createdAt: ISO8601;
}

// PUT /listings/:id
interface UpdateListingRequest {
  price?: Currency;
  negotiable?: boolean;
  description?: string;
  status?: 'pending_review' | 'sold' | 'expired';   // allowed transitions
}

interface UpdateListingResponse {
  listing: ListingDetail;
}

// GET /listings/:id/similar
interface SimilarListingsResponse {
  data: ListingSummary[];       // max 10
}


// =============================================================
// INTERACTIONS
// =============================================================

// POST /listings/:id/save  (toggle)
interface SaveToggleResponse {
  saved: boolean;
}

// POST /listings/:id/offer
interface CreateOfferRequest {
  amount: Currency;
  message?: string;
}
interface CreateOfferResponse {
  id: UUID;
  status: 'pending';
  expiresAt: ISO8601;
}

// PUT /offers/:id (seller responds)
interface RespondOfferRequest {
  action: 'accept' | 'reject' | 'counter';
  counterAmount?: Currency;      // required if action = 'counter'
}
interface RespondOfferResponse {
  offer: Offer;
}

interface Offer {
  id: UUID;
  listingId: UUID;
  buyer: { id: UUID; fullName: string; avatarUrl: string | null };
  amount: Currency;
  counterAmount: Currency | null;
  message: string | null;
  status: OfferStatus;
  respondedAt: ISO8601 | null;
  expiresAt: ISO8601;
  createdAt: ISO8601;
}
type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';

// POST /listings/:id/test-drive
interface BookTestDriveRequest {
  scheduledAt: ISO8601;
  locationText?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}
interface BookTestDriveResponse {
  id: UUID;
  status: 'requested';
}


// =============================================================
// CONVERSATIONS & MESSAGES
// =============================================================

// GET /conversations
interface ConversationsResponse extends PaginatedResponse<ConversationSummary> {}

interface ConversationSummary {
  id: UUID;
  listing: {
    id: UUID;
    primaryPhotoUrl: string;
    make: string;
    model: string;
    year: number;
    price: Currency;
    status: ListingStatus;
  };
  otherUser: {
    id: UUID;
    fullName: string;
    avatarUrl: string | null;
  };
  lastMessagePreview: string | null;
  lastMessageAt: ISO8601 | null;
  unreadCount: number;
}

// GET /conversations/:id/messages
interface MessagesResponse extends PaginatedResponse<Message> {}

interface Message {
  id: UUID;
  senderId: UUID;
  content: string;
  type: 'text' | 'image' | 'offer' | 'system';
  metadata: Record<string, unknown> | null;
  readAt: ISO8601 | null;
  createdAt: ISO8601;
}

// POST /conversations/:id/messages
interface SendMessageRequest {
  content: string;
  type: 'text' | 'image';
  metadata?: Record<string, unknown>;
}
interface SendMessageResponse {
  message: Message;
}

// POST /conversations (create or get existing)
interface CreateConversationRequest {
  listingId: UUID;
}
interface CreateConversationResponse {
  conversation: ConversationSummary;
  isNew: boolean;
}


// =============================================================
// MASTER DATA
// =============================================================

// GET /makes
interface MakesResponse {
  data: {
    id: UUID;
    name: string;
    nameAr: string | null;
    logoUrl: string | null;
    isPopular: boolean;
  }[];
}

// GET /makes/:id/models
interface ModelsResponse {
  data: {
    id: UUID;
    name: string;
    nameAr: string | null;
    bodyType: BodyType | null;
    yearStart: number | null;
    yearEnd: number | null;
  }[];
}

// GET /models/:id/variants
interface VariantsResponse {
  data: {
    id: UUID;
    name: string;
    engineCc: number | null;
    fuelType: FuelType | null;
    transmission: TransmissionType | null;
  }[];
}

// POST /price-estimate
// (See Edge Function section 3.4.3)
```

### 4.2 Error Response Format

All API errors follow a consistent envelope:

```typescript
// HTTP 4xx or 5xx response body:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Price must be greater than 0",
    "details": {
      "price": ["Must be a positive integer"],
      "photoKeys": ["Minimum 6 photos required, got 3"]
    },
    "requestId": "req_abc123xyz"
  }
}
```

**Error code catalog:**

| Code | HTTP Status | When |
|------|------------|------|
| `VALIDATION_ERROR` | 400 | Request body fails Zod schema |
| `BAD_REQUEST` | 400 | Malformed request |
| `UNAUTHENTICATED` | 401 | Missing or expired token |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions |
| `NOT_FOUND` | 404 | Entity does not exist |
| `CONFLICT` | 409 | Duplicate resource |
| `UNPROCESSABLE_ENTITY` | 422 | Valid syntax but business rule violation |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency down (AI, push, etc.) |

### 4.3 Pagination Strategy

**Cursor-based pagination** (not offset-based) for all list endpoints.

**Rationale:** Offset pagination breaks with real-time inserts (items shift, causing duplicates or skips). Cursor pagination is stable.

```
Cursor encoding: Base64 of "{created_at}|{id}"
Example: "MjAyNi0wMy0xMVQxMDozMDowMFp8YWJjMTIz"

SQL pattern:
  WHERE (created_at, id) < (cursor_timestamp, cursor_id)
  ORDER BY created_at DESC, id DESC
  LIMIT 21  -- fetch one extra to determine hasMore

Response:
  data: first 20 items
  nextCursor: cursor from item 20 (null if < 21 returned)
  totalEstimate: result of COUNT(*) OVER() on first page only, cached
```

**Page sizes:**

| Endpoint | Default | Max |
|----------|---------|-----|
| Listings search | 20 | 50 |
| Conversations | 20 | 50 |
| Messages | 30 | 100 |
| Offers | 20 | 50 |
| Similar cars | 10 | 10 |
| Reviews | 10 | 50 |
| Notifications | 20 | 50 |

### 4.4 Search/Filter Query Design

Filters map to SQL via the `search-cars` Edge Function. The function builds a parameterized query dynamically.

```sql
-- Base query (always applied)
SELECT l.*, lp.url AS primary_photo_url, lp.thumbnail_url,
       m.name AS make_name, mo.name AS model_name,
       v.fuel_type, v.transmission,
       CASE WHEN sc.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_saved
FROM listings l
LEFT JOIN listing_photos lp ON lp.listing_id = l.id AND lp.is_primary = TRUE
JOIN car_makes m ON m.id = l.make_id
JOIN car_models mo ON mo.id = l.model_id
LEFT JOIN car_variants v ON v.id = l.variant_id
LEFT JOIN saved_cars sc ON sc.listing_id = l.id AND sc.user_id = $current_user_id
WHERE l.status = 'active'

-- Conditional clauses (added per filter):
AND l.make_id = ANY($makes)                               -- makes filter
AND l.model_id = ANY($models)                             -- models filter
AND l.year BETWEEN $yearMin AND $yearMax                   -- year range
AND l.price BETWEEN $priceMin AND $priceMax                -- price range
AND l.mileage BETWEEN $mileageMin AND $mileageMax         -- mileage range
AND mo.body_type = ANY($bodyTypes)                         -- body type
AND v.fuel_type = ANY($fuelTypes)                          -- fuel type
AND v.transmission = $transmission                         -- transmission
AND l.color = ANY($colors)                                 -- color
AND l.city = $city                                         -- city
AND l.num_owners <= $numOwners                             -- max owners
AND l.inspection_status = $inspectionStatus                -- inspection
AND l.search_vector @@ plainto_tsquery('english', $q)      -- full-text

-- Geo filter (PostGIS)
AND ST_DWithin(l.location, ST_MakePoint($lng, $lat)::geography, $radius * 1000)

-- Sort
ORDER BY
  CASE WHEN $sortBy = 'price_asc' THEN l.price END ASC,
  CASE WHEN $sortBy = 'price_desc' THEN l.price END DESC,
  CASE WHEN $sortBy = 'newest' THEN l.created_at END DESC,
  CASE WHEN $sortBy = 'mileage' THEN l.mileage END ASC,
  CASE WHEN $sortBy = 'year' THEN l.year END DESC,
  CASE WHEN $sortBy = 'distance' THEN ST_Distance(l.location, ST_MakePoint($lng, $lat)::geography) END ASC,
  l.featured DESC,              -- featured always boost within sort
  l.id DESC                     -- tiebreaker

LIMIT $limit + 1
```

**Facets query** (run in parallel with main query for first page only):

```sql
-- Aggregate counts for filter UI
SELECT
  l.make_id, m.name AS make_name, COUNT(*) AS count
FROM listings l
JOIN car_makes m ON m.id = l.make_id
WHERE l.status = 'active'
  -- apply same WHERE clauses EXCEPT the facet being counted
GROUP BY l.make_id, m.name
ORDER BY count DESC
LIMIT 20;
```

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
+-------+     +--------+     +-------------+     +-----------+
| User  | --> | App    | --> | Supabase    | --> | SMS       |
|       |     |        |     | Auth        |     | Provider  |
+-------+     +--------+     +-------------+     +-----------+
                  |                 |
                  |  OTP Flow:      |
                  |  1. POST /auth/send-otp (phone)
                  |  2. Supabase sends OTP via SMS provider
                  |  3. User enters OTP in app
                  |  4. POST /auth/verify-otp (phone + otp)
                  |  5. Supabase returns session (access + refresh tokens)
                  |  6. App stores tokens in secure storage
                  |
                  |  Social Flow (Google/Apple):
                  |  1. Expo AuthSession opens OAuth provider
                  |  2. User authenticates with provider
                  |  3. Provider returns id_token
                  |  4. supabase.auth.signInWithIdToken({ provider, token })
                  |  5. Supabase validates, creates/links account
                  |  6. Returns session tokens
```

**New User Detection:**
```
On first sign-in:
  1. Supabase Auth creates auth.users record
  2. Database trigger creates profiles record with minimal data
  3. Response includes isNewUser: true
  4. App routes to onboarding (name, city, avatar, role)
  5. PUT /auth/profile completes setup
  6. Subsequent logins: isNewUser: false, route to (tabs)
```

### 5.2 Token Management

| Token | Storage | Lifetime | Refresh |
|-------|---------|----------|---------|
| Access Token (JWT) | In-memory + Zustand | 1 hour | Auto via Supabase client |
| Refresh Token | SecureStore (expo-secure-store) | 30 days | On access token expiry |
| Push Token | Supabase profiles.push_token | Until app reinstall | On app launch |

**Token Refresh Flow:**
```
1. Supabase JS client automatically refreshes access token
   when it detects expiry (via onAuthStateChange)
2. If refresh fails (token revoked, >30 days):
   a. Clear all tokens
   b. Clear Zustand auth store
   c. Navigate to (auth)/login
   d. React Query cache cleared
3. All API calls include: Authorization: Bearer {accessToken}
4. Edge Functions verify JWT via supabase.auth.getUser(token)
```

**Secure Storage Strategy:**
```
expo-secure-store (Keychain on iOS, Keystore on Android):
  - Refresh token
  - User ID

AsyncStorage (encrypted at rest on modern OS):
  - Non-sensitive preferences
  - Cached listing data
  - Draft listings
  - Filter state

NEVER stored:
  - Access tokens in AsyncStorage (only in-memory)
  - Raw phone numbers in analytics
  - OTP codes
```

### 5.3 File Upload Validation

**Client-Side (first line of defense):**
```
1. File type check: MIME type must be image/jpeg, image/png, image/webp, or image/heic
2. File size check: max 10MB for car photos, 5MB for avatars
3. Image dimensions: min 800x600 for car photos
4. Photo count: min 6, max 20 per listing
5. Filename sanitization: strip special characters, use UUID-based names
```

**Server-Side (enforced by Supabase Storage policies + Edge Functions):**
```
1. Bucket-level MIME type restrictions (configured in bucket settings)
2. Bucket-level file size limits
3. RLS policies verify ownership (seller owns listing, user owns avatar folder)
4. Edge Function 'create-listing' validates:
   a. All photoKeys exist in storage
   b. photoKeys are in the correct listing folder
   c. At least 6 photos provided
5. Content-Type header validation (prevent polyglot files)
6. No executable files ever accepted
```

**Upload flow:**
```
1. App requests signed upload URL from Supabase Storage
2. App uploads directly to Storage (no server middleman)
3. Storage validates MIME + size
4. RLS policy validates ownership
5. On listing creation, Edge Function verifies photo references
6. Background job (optional): generate thumbnails via image transform
```

### 5.4 Rate Limiting Strategy

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `/auth/send-otp` | 3 | 15 min | Per phone number |
| `/auth/verify-otp` | 5 | 15 min | Per phone number |
| `POST /listings` | 5 | 1 hour | Per user |
| `POST /offers` | 10 | 1 hour | Per user |
| `POST /messages` | 60 | 1 min | Per user |
| `GET /listings` (search) | 30 | 1 min | Per user |
| `POST /price-estimate` | 10 | 1 hour | Per user |
| Storage uploads | 50 | 1 hour | Per user |
| Anonymous endpoints | 60 | 1 min | Per IP |

**Implementation:**
```
1. Supabase built-in: Auth endpoints have built-in rate limits
2. Edge Functions: Use Deno KV or Upstash Redis for rate counting
   - Key format: "ratelimit:{userId}:{endpoint}:{window}"
   - Sliding window counter
   - Return 429 with Retry-After header
3. PostgREST: Use pg_net or connection pooling limits
4. Storage: Supabase has built-in upload rate limits
```

**Additional Security Measures:**
```
- Input sanitization: All text inputs sanitized for XSS (HTML entities)
- SQL injection: Parameterized queries only (Supabase client enforces this)
- CORS: Supabase configured with allowed origins
- Content Security Policy: Applied on web admin panel
- Audit logging: analytics_events table tracks sensitive actions
- Account lockout: After 5 failed OTP attempts, lock for 1 hour
```

---

## 6. Performance Architecture

### 6.1 Image Optimization Pipeline

```
+--------+     +----------+     +------------+     +--------+     +------+
| Camera | --> | Client   | --> | Supabase   | --> | Image  | --> | CDN  |
| Capture|     | Resize   |     | Storage    |     | Transf.|     |      |
+--------+     +----------+     +------------+     +--------+     +------+

Step 1 - Capture (Client):
  - expo-camera captures JPEG at device resolution
  - Client-side resize to max 2048px on longest edge
  - JPEG quality 85% compression
  - Strip EXIF GPS data (privacy), keep orientation
  - Approximate size after: 200KB-500KB per photo

Step 2 - Upload:
  - Upload original resized image to Supabase Storage
  - Path: car-photos/{listing_id}/{uuid}.jpg
  - Upload in parallel (max 3 concurrent)
  - Show progress bar per photo
  - Retry failed uploads up to 3 times

Step 3 - Transform (on-demand via Supabase Image Transformation):
  - Supabase Storage supports on-the-fly transforms via URL params
  - Thumbnail (card): /render/image/public/car-photos/...?width=400&height=300&resize=cover
  - Detail gallery: /render/image/public/car-photos/...?width=1024&quality=80
  - Full screen: original URL (already max 2048px)
  - WebP auto-format: &format=origin (serves WebP to supporting clients)

Step 4 - CDN:
  - Supabase Storage served via CDN (built-in on Pro plan)
  - Cache-Control: public, max-age=31536000, immutable (photos never change)
  - Use unique filenames (UUID) so cache never stale
```

**Image sizes used in app:**

| Context | Width | Height | Quality | Format |
|---------|-------|--------|---------|--------|
| Car card thumbnail | 400 | 300 | 75 | WebP |
| Gallery thumbnail strip | 80 | 80 | 60 | WebP |
| Detail gallery | 1024 | auto | 80 | WebP |
| Full-screen viewer | original | original | original | JPEG |
| Chat image | 600 | auto | 75 | WebP |
| Avatar (small) | 80 | 80 | 70 | WebP |
| Avatar (profile) | 200 | 200 | 80 | WebP |

**expo-image configuration:**
```
<Image
  source={{ uri: thumbnailUrl }}
  placeholder={{ blurhash: listing.blurhash }}  // pre-computed on upload
  contentFit="cover"
  transition={200}
  cachePolicy="disk"                            // persist across sessions
  recyclingKey={listing.id}                     // for FlashList recycling
/>
```

### 6.2 Search Query Optimization

**Indexes (defined in schema section, summarized here):**

| Query Pattern | Index | Type |
|---------------|-------|------|
| Browse active listings | `idx_listings_browse (status, city, make_id, price, year)` | Composite B-tree |
| Full-text search | `idx_listings_search (search_vector)` | GIN |
| Price sort/filter | `idx_listings_price (price) WHERE active` | Partial B-tree |
| Newest sort | `idx_listings_created (created_at DESC) WHERE active` | Partial B-tree |
| Geo search | `idx_listings_location (location) WHERE active` | GiST |
| Featured listings | `idx_listings_featured (featured, created_at DESC) WHERE active` | Partial B-tree |
| Price drops | `idx_listings_price_drop (price_dropped_at DESC) WHERE active` | Partial B-tree |
| Similar cars | Combo of make_id + model_id + year + price | Uses existing indexes |

**Full-Text Search Configuration:**
```
- TSVECTOR column `search_vector` on listings
- Weights: make name (A), model name (A), city (B), description (C), color (D)
- Query: plainto_tsquery for simple searches, websearch_to_tsquery for advanced
- Trigram index (pg_trgm) for fuzzy matching / autocomplete:
    CREATE INDEX idx_listings_trgm ON listings
    USING GIN (
      (COALESCE(description, '') || ' ' || city) gin_trgm_ops
    );
- Autocomplete: Use trigram similarity on make + model names for search suggestions
```

**Query Execution Plan Targets:**
```
- Simple browse (no text search, 1-2 filters): < 10ms
- Complex filtered search (3+ filters): < 50ms
- Full-text search + filters: < 100ms
- Geo-radius search: < 100ms
- Facet aggregation: < 200ms (cached after first page)
```

### 6.3 Caching Strategy

**Layer 1: Client-Side (React Query)**
```
- Stale-while-revalidate for all list queries
- Infinite query cache for scroll position preservation
- Prefetch on hover/visible (car detail when card is near viewport)
- Background refetch interval: 30s for active screens
- Cache persisted to AsyncStorage via react-query persistor (optional, for offline)
```

**Layer 2: CDN (Supabase Storage)**
```
- All car photos: immutable (UUID-named), max-age=1 year
- Avatars: max-age=1 day (can change)
- Inspection PDFs: private, signed URLs with 1-hour expiry
```

**Layer 3: Database-Level**
```
- PostgreSQL shared_buffers: managed by Supabase (typically 25% RAM)
- Connection pooling: Supabase PgBouncer (transaction mode)
- Materialized view (optional, for home feed):

  CREATE MATERIALIZED VIEW home_feed AS
  SELECT * FROM listings
  WHERE status = 'active'
  ORDER BY
    CASE WHEN featured THEN 0 ELSE 1 END,
    created_at DESC
  LIMIT 100;

  REFRESH MATERIALIZED VIEW CONCURRENTLY home_feed;
  -- Refresh every 5 minutes via pg_cron

- Hot data stays in PostgreSQL cache due to partial indexes (only active listings)
```

**Layer 4: Edge Function Cache (for search)**
```
- Facets (make counts, price range): cache for 5 minutes (Deno KV or in-memory)
- Popular searches: cache results for 60 seconds
- Price estimates: cache for 1 hour per make+model+year+city+condition key
- Master data (makes/models): cache indefinitely, bust on admin update
```

### 6.4 Lazy Loading and Virtualized Lists

**Virtualized Lists (FlashList):**
```
Home feed, search results, conversations, messages all use
@shopify/flash-list instead of FlatList:

<FlashList
  data={listings}
  renderItem={renderCarCard}
  estimatedItemSize={280}         // card height in pixels
  onEndReached={fetchNextPage}
  onEndReachedThreshold={0.5}     // start fetching at 50% from bottom
  ListFooterComponent={<ListFooter loading={isFetchingNextPage} />}
  keyExtractor={item => item.id}
  drawDistance={500}               // pre-render 500px off-screen
/>

Benefits over FlatList:
  - Recycling: reuses component instances (not just views)
  - ~5x fewer renders for large lists
  - Consistent 60fps scrolling
```

**Lazy Loading Strategy:**
```
Images:
  - expo-image handles lazy loading natively
  - Placeholder: blurhash (10-char string, ~20 bytes) stored per photo
  - Priority loading: primary photo loads first, then others as scrolled

Screens:
  - Sell wizard steps: each step is a separate route (code-split by Expo Router)
  - Settings screens: lazy loaded
  - Inspection report: loaded only when expanded

Data:
  - Car detail: prefetch when card is visible in list (React Query prefetchQuery)
  - Similar cars: loaded after main detail data
  - Inspection items: loaded on accordion expand
  - Chat messages: load latest 30, load more on scroll up
  - Conversations list: load 20, infinite scroll

Heavy Components:
  - Photo gallery (pinch-zoom): import via React.lazy()
  - Map view (location picker): dynamic import
  - Camera (guided capture): dynamic import
  - EMI calculator: dynamic import
```

**Performance Budgets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Home feed TTI | < 2s | First meaningful paint |
| Search results | < 1s | After filters applied |
| Car detail load | < 1.5s | Including primary photo |
| Chat message send | < 200ms | Perceived (optimistic) |
| App cold start | < 3s | To interactive home feed |
| JS bundle size | < 5MB | Hermes bytecode |
| Image per card | < 50KB | Thumbnail |
| Scroll FPS | >= 58 | FlashList benchmark |

---

## 7. Architecture Decision Records

### ADR-001: Supabase as Backend-as-a-Service

**Context:** Need auth, database, storage, and realtime for a marketplace MVP in 8-10 weeks.

**Decision:** Use Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) as the primary backend.

**Consequences:**
- Positive: Rapid development, built-in RLS, real-time subscriptions, managed infrastructure, generous free tier
- Positive: PostgREST auto-generates REST API from schema, reducing boilerplate
- Negative: Vendor lock-in (mitigated: Supabase is open-source, can self-host)
- Negative: Edge Functions are Deno-based (smaller ecosystem than Node.js)
- Negative: Complex queries may outgrow PostgREST, requiring Edge Functions

**Alternatives Considered:**
- Firebase: NoSQL (bad for relational marketplace data), vendor lock-in
- Custom Express + PostgreSQL: Full control but 3x development time
- Hasura: GraphQL adds complexity for mobile client

**Status:** Accepted

---

### ADR-002: Cursor-Based Pagination Over Offset

**Context:** Listings are added and removed frequently. Users browse via infinite scroll.

**Decision:** Use cursor-based pagination (created_at + id composite cursor) for all list endpoints.

**Consequences:**
- Positive: Stable pagination during concurrent inserts/deletes
- Positive: Consistent performance regardless of page depth
- Negative: Cannot jump to arbitrary page (not needed for mobile infinite scroll)
- Negative: Total count is approximate (acceptable for "X results" display)

**Status:** Accepted

---

### ADR-003: Zustand + React Query Dual State Model

**Context:** Need both client state (filters, drafts, UI) and server state (listings, messages).

**Decision:** Zustand for client state with AsyncStorage persistence. TanStack React Query for server state with stale-while-revalidate caching.

**Consequences:**
- Positive: Clear separation of concerns
- Positive: React Query handles caching, deduplication, background refresh
- Positive: Zustand is minimal (< 1KB), no providers needed
- Negative: Two mental models for state (mitigated: clear boundary rules)

**Alternatives Considered:**
- Redux Toolkit + RTK Query: More boilerplate, heavier
- Zustand only: Would need to manually implement caching, deduplication
- Jotai: Atomic model less intuitive for form-heavy sell flow

**Status:** Accepted

---

### ADR-004: Edge Function for Search Over PostgREST

**Context:** Search requires full-text, geo filtering, faceted counts, and dynamic WHERE clause construction. PostgREST cannot express this.

**Decision:** Dedicated `search-cars` Edge Function that builds parameterized SQL dynamically.

**Consequences:**
- Positive: Full control over query optimization
- Positive: Can add facets, geo, and full-text in one roundtrip
- Positive: Can cache popular searches
- Negative: Must maintain SQL query builder manually
- Negative: Edge Function cold start adds ~100ms (mitigated: keep-alive pings)

**Status:** Accepted

---

### ADR-005: Offline-First for Saved Cars and Drafts

**Context:** PRD requires saved cars viewable offline and draft listings saved locally.

**Decision:** Zustand persist middleware with AsyncStorage for offline data. Pending action queue for offline writes.

**Consequences:**
- Positive: App usable without connectivity for core browse/save flows
- Positive: Sell flow drafts survive app kills and crashes
- Negative: Stale data possible (mitigated: reconcile on reconnect)
- Negative: AsyncStorage has ~6MB practical limit on some devices (sufficient for cached listings)

**Alternatives Considered:**
- WatermelonDB: Full offline DB, overkill for this use case
- SQLite (expo-sqlite): More storage but more complexity
- MMKV: Faster than AsyncStorage but no structured queries needed

**Status:** Accepted

---

### ADR-006: FlashList Over FlatList

**Context:** Listing feeds and search results can have hundreds of items. FlatList performance degrades with complex card components.

**Decision:** Use @shopify/flash-list for all virtualized lists.

**Consequences:**
- Positive: Component recycling reduces memory and render overhead
- Positive: Consistent 60fps with complex car card components
- Positive: Drop-in replacement API (same as FlatList)
- Negative: Requires estimatedItemSize (minor: easy to measure)
- Negative: Slightly different behavior for variable-height items

**Status:** Accepted

---

*End of Architecture Document*