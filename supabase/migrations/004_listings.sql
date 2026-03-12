CREATE TABLE listings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make_id               UUID NOT NULL REFERENCES car_makes(id),
  model_id              UUID NOT NULL REFERENCES car_models(id),
  variant_id            UUID REFERENCES car_variants(id),
  year                  INTEGER NOT NULL CHECK (year >= 1990),
  mileage               INTEGER NOT NULL CHECK (mileage >= 0),
  price                 INTEGER NOT NULL CHECK (price > 0),
  price_currency        TEXT NOT NULL DEFAULT 'AED',
  negotiable            BOOLEAN DEFAULT TRUE,
  color                 TEXT,
  city                  TEXT NOT NULL,
  description           TEXT,
  condition             car_condition NOT NULL DEFAULT 'good',
  num_owners            INTEGER DEFAULT 1 CHECK (num_owners >= 1),
  inspection_status     TEXT DEFAULT 'not_inspected'
                        CHECK (inspection_status IN ('not_inspected', 'pending', 'verified', 'failed')),
  status                listing_status NOT NULL DEFAULT 'draft',
  featured              BOOLEAN DEFAULT FALSE,
  views_count           INTEGER DEFAULT 0,
  saves_count           INTEGER DEFAULT 0,
  original_price        INTEGER,
  price_dropped_at      TIMESTAMPTZ,
  search_vector         TSVECTOR,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  sold_at               TIMESTAMPTZ
);

-- Indexes
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
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector) WHERE status = 'active';
CREATE INDEX idx_listings_browse ON listings(status, city, make_id, price, year) WHERE status = 'active';

-- Auto-update search vector
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
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- Track price drops
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

-- Listing photos
CREATE TABLE listing_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  thumbnail_url TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id, position);

-- RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_select_active" ON listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "listings_insert_own" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "listings_delete_own" ON listings
  FOR DELETE USING (auth.uid() = seller_id AND status IN ('draft', 'expired'));

CREATE POLICY "listing_photos_select" ON listing_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_photos.listing_id
      AND (listings.status = 'active' OR listings.seller_id = auth.uid()))
  );

CREATE POLICY "listing_photos_insert" ON listing_photos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_photos.listing_id
      AND listings.seller_id = auth.uid())
  );

CREATE POLICY "listing_photos_delete" ON listing_photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_photos.listing_id
      AND listings.seller_id = auth.uid())
  );
