-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Enums
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'expired', 'rejected');
CREATE TYPE body_type AS ENUM ('sedan', 'suv', 'hatchback', 'truck', 'coupe', 'van', 'convertible', 'wagon');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'hybrid', 'electric');
CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');
CREATE TYPE car_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');
CREATE TYPE test_drive_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'image', 'offer', 'system');
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'both', 'inspector', 'admin');
