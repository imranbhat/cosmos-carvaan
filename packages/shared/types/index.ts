// =============================================================================
// Carvaan Shared Types — generated from database migrations
// =============================================================================

// -----------------------------------------------------------------------------
// Database Enums
// -----------------------------------------------------------------------------

export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected';
export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'truck' | 'coupe' | 'van' | 'convertible' | 'wagon';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'automatic' | 'manual';
export type CarCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
export type TestDriveStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';
export type MessageType = 'text' | 'image' | 'offer' | 'system';
export type UserRole = 'buyer' | 'seller' | 'both' | 'inspector' | 'admin';
export type InspectionStatus = 'not_inspected' | 'pending' | 'verified' | 'failed';
export type Language = 'en' | 'ar';

// -----------------------------------------------------------------------------
// Table Row Types
// -----------------------------------------------------------------------------

/** profiles table — 002_profiles.sql */
export interface Profile {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  role: UserRole;
  bio: string | null;
  rating_avg: number;
  rating_count: number;
  response_time_minutes: number | null;
  push_token: string | null;
  language: Language;
  created_at: string;
  updated_at: string;
}

/** car_makes table — 003_car_master_data.sql */
export interface CarMake {
  id: string;
  name: string;
  name_ar: string | null;
  logo_url: string | null;
  country: string | null;
  sort_order: number;
  is_popular: boolean;
  created_at: string;
}

/** car_models table — 003_car_master_data.sql */
export interface CarModel {
  id: string;
  make_id: string;
  name: string;
  name_ar: string | null;
  body_type: BodyType | null;
  year_start: number | null;
  year_end: number | null;
  is_popular: boolean;
  created_at: string;
}

/** car_variants table — 003_car_master_data.sql */
export interface CarVariant {
  id: string;
  model_id: string;
  name: string;
  engine_cc: number | null;
  fuel_type: FuelType | null;
  transmission: TransmissionType | null;
  created_at: string;
}

/** listings table — 004_listings.sql */
export interface Listing {
  id: string;
  seller_id: string;
  make_id: string;
  model_id: string;
  variant_id: string | null;
  year: number;
  mileage: number;
  price: number;
  price_currency: string;
  negotiable: boolean;
  color: string | null;
  city: string;
  description: string | null;
  condition: CarCondition;
  num_owners: number;
  inspection_status: InspectionStatus;
  status: ListingStatus;
  featured: boolean;
  views_count: number;
  saves_count: number;
  original_price: number | null;
  price_dropped_at: string | null;
  search_vector: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  sold_at: string | null;
}

/** listing_photos table — 004_listings.sql */
export interface ListingPhoto {
  id: string;
  listing_id: string;
  url: string;
  thumbnail_url: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}

/** saved_cars table — 005_interactions.sql */
export interface SavedCar {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

/** saved_searches table — 005_interactions.sql */
export interface SavedSearch {
  id: string;
  user_id: string;
  label: string | null;
  filters: Record<string, unknown>;
  notify: boolean;
  created_at: string;
}

/** offers table — 005_interactions.sql */
export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  amount: number;
  message: string | null;
  status: OfferStatus;
  counter_amount: number | null;
  responded_at: string | null;
  expires_at: string;
  created_at: string;
}

/** test_drives table — 005_interactions.sql */
export interface TestDrive {
  id: string;
  listing_id: string;
  buyer_id: string;
  scheduled_at: string;
  location_text: string | null;
  status: TestDriveStatus;
  notes: string | null;
  created_at: string;
}

/** reviews table — 005_interactions.sql */
export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  listing_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** conversations table — 006_messaging.sql */
export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
}

/** messages table — 006_messaging.sql */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

/** platform_settings table — 008_platform_settings.sql */
export interface PlatformSettings {
  id: string;
  settings: Record<string, unknown>;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Joined / Computed Types (used in queries)
// -----------------------------------------------------------------------------

/** Listing with related make, model, variant, seller, and photos */
export interface ListingWithDetails extends Listing {
  make: CarMake;
  model: CarModel;
  variant: CarVariant | null;
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'city' | 'rating_avg' | 'rating_count' | 'response_time_minutes'>;
  photos: ListingPhoto[];
}

/** Lightweight listing card used in search results and grids */
export interface ListingSummary {
  id: string;
  primary_photo_url: string | null;
  thumbnail_url: string | null;
  make_name: string;
  model_name: string;
  year: number;
  mileage: number;
  price: number;
  price_currency: string;
  negotiable: boolean;
  city: string;
  condition: CarCondition;
  fuel_type: FuelType | null;
  transmission: TransmissionType | null;
  inspection_status: InspectionStatus;
  featured: boolean;
  original_price: number | null;
  saves_count: number;
  is_saved: boolean;
  created_at: string;
}

/** Conversation with contextual data for inbox list */
export interface ConversationSummary {
  id: string;
  listing_id: string;
  listing_photo: string | null;
  listing_title: string;
  listing_price: number;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
}

/** Full conversation with messages, participants, and listing context */
export interface ConversationWithDetails extends Conversation {
  listing: Pick<Listing, 'id' | 'year' | 'price' | 'price_currency' | 'status'> & {
    make_name: string;
    model_name: string;
    primary_photo_url: string | null;
  };
  buyer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  messages: Message[];
}

/** Offer with listing and participant details */
export interface OfferWithDetails extends Offer {
  listing: Pick<Listing, 'id' | 'year' | 'price' | 'price_currency' | 'seller_id'> & {
    make_name: string;
    model_name: string;
    primary_photo_url: string | null;
  };
  buyer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

/** Test drive with listing and participant details */
export interface TestDriveWithDetails extends TestDrive {
  listing: Pick<Listing, 'id' | 'year' | 'price' | 'price_currency' | 'seller_id'> & {
    make_name: string;
    model_name: string;
    primary_photo_url: string | null;
  };
  buyer: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'phone'>;
}

/** Review with reviewer profile info */
export interface ReviewWithProfile extends Review {
  reviewer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

// -----------------------------------------------------------------------------
// Form / Input Types (for create and update operations)
// -----------------------------------------------------------------------------

/** Create a new listing (seller submits this) */
export interface CreateListingInput {
  make_id: string;
  model_id: string;
  variant_id?: string | null;
  year: number;
  mileage: number;
  price: number;
  price_currency?: string;
  negotiable?: boolean;
  color?: string | null;
  city: string;
  description?: string | null;
  condition: CarCondition;
  num_owners?: number;
}

/** Update an existing listing */
export type UpdateListingInput = Partial<CreateListingInput> & {
  status?: ListingStatus;
};

/** Update user profile */
export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string | null;
  city?: string | null;
  role?: UserRole;
  bio?: string | null;
  push_token?: string | null;
  language?: Language;
}

/** Create a new offer */
export interface CreateOfferInput {
  listing_id: string;
  amount: number;
  message?: string | null;
}

/** Request a test drive */
export interface CreateTestDriveInput {
  listing_id: string;
  scheduled_at: string;
  location_text?: string | null;
  notes?: string | null;
}

/** Send a message */
export interface CreateMessageInput {
  conversation_id: string;
  content: string;
  type?: MessageType;
  metadata?: Record<string, unknown> | null;
}

/** Start a new conversation */
export interface CreateConversationInput {
  listing_id: string;
  initial_message: string;
}

/** Submit a review */
export interface CreateReviewInput {
  reviewee_id: string;
  listing_id?: string | null;
  rating: number;
  comment?: string | null;
}

/** Add photos to a listing */
export interface CreateListingPhotoInput {
  listing_id: string;
  url: string;
  thumbnail_url?: string | null;
  position?: number;
  is_primary?: boolean;
}

/** Save a search with filters */
export interface CreateSavedSearchInput {
  label?: string | null;
  filters: Record<string, unknown>;
  notify?: boolean;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

/** Standard paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/** Standard API success response */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Search / filter params for listings */
export interface ListingFilters {
  query?: string;
  make_id?: string;
  model_id?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  max_mileage?: number;
  body_type?: BodyType;
  fuel_type?: FuelType;
  transmission?: TransmissionType;
  condition?: CarCondition;
  featured?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc' | 'newest' | 'oldest';
  page?: number;
  page_size?: number;
}

// -----------------------------------------------------------------------------
// Admin Types
// -----------------------------------------------------------------------------

/** Admin dashboard stats */
export interface AdminDashboardStats {
  total_users: number;
  total_listings: number;
  active_listings: number;
  pending_listings: number;
  total_sold: number;
  total_revenue_estimate: number;
  new_users_today: number;
  new_listings_today: number;
}

/** Admin action to moderate a listing */
export interface AdminListingAction {
  listing_id: string;
  action: 'approve' | 'reject' | 'feature' | 'unfeature' | 'expire';
  reason?: string;
}
