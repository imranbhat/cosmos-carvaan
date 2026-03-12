# Carvaan

A trusted used-car marketplace. Buyers browse inspected cars, sellers get qualified leads, and every transaction is secure.

Built with **React Native (Expo)** and **Supabase**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.83, Expo SDK 55, Expo Router |
| State | Zustand, React Query |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| Forms | React Hook Form + Zod |
| UI | Custom component library with theme system |

## Project Structure

```
cosmos-carvaan/
├── apps/
│   └── mobile/              # Expo React Native app
│       ├── app/             # File-based routing (Expo Router)
│       │   ├── (auth)/      # Login, OTP, onboarding
│       │   ├── (tabs)/      # Home, Search, Sell, Inbox, Profile
│       │   ├── car/         # Car detail screen
│       │   ├── chat/        # Conversation screen
│       │   ├── profile/     # Profile sub-screens
│       │   └── sell/        # 5-step listing creation
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── stores/          # Zustand state stores
│       ├── lib/             # API, Supabase client, utilities
│       └── constants/       # Theme, config, colors
├── packages/
│   └── shared/              # Shared types and validators
├── supabase/
│   ├── migrations/          # 7 SQL migration files
│   ├── seed.sql             # UAE car market seed data
│   └── config.toml          # Supabase project config
├── docs/                    # Architecture and implementation plan
└── .github/workflows/       # CI and EAS Build pipelines
```

## Features

- **Phone/OTP Authentication** via Supabase Auth
- **Car Listings** with photos, specs, price badges, and location
- **Search & Filter** by make, model, body type, price, mileage, city
- **5-Step Sell Flow** (details, condition, photos, pricing, review)
- **Real-time Messaging** between buyers and sellers
- **Saved Cars** and recently viewed history
- **Mock Data Mode** with 12 UAE car listings for demo/offline use

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A Supabase project (or use mock data mode)

### Install

```bash
cd apps/mobile
npm install
```

### Configure Environment

Create `apps/mobile/.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app works without Supabase credentials using built-in mock data.

### Run

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web
npm run web
```

## Database

Seven sequential migrations build the schema:

1. Extensions and enums (UUID, trigram, full-text search)
2. User profiles with RLS
3. Car master data (makes, models, variants)
4. Listings with photos and search vectors
5. Interactions (saves, views, reports)
6. Messaging with conversation threads
7. Storage buckets for photos and avatars

Apply migrations with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push
supabase db seed
```

## License

MIT
