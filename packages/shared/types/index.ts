export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'truck' | 'coupe' | 'van' | 'convertible' | 'wagon';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'automatic' | 'manual';
export type CarCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
export type MessageType = 'text' | 'image' | 'offer' | 'system';
export type UserRole = 'buyer' | 'seller' | 'both' | 'inspector' | 'admin';

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
  fuel_type: FuelType | null;
  transmission: TransmissionType | null;
  inspection_status: string;
  featured: boolean;
  original_price: number | null;
  saves_count: number;
  is_saved: boolean;
  created_at: string;
}

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
