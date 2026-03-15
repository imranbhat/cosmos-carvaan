-- Saved cars
CREATE TABLE saved_cars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_saved_cars_user ON saved_cars(user_id, created_at DESC);

-- Saved searches
CREATE TABLE saved_searches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       TEXT,
  filters     JSONB NOT NULL,
  notify      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);

-- Offers
CREATE TABLE offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Test drives
CREATE TABLE test_drives (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  location_text TEXT,
  status        test_drive_status NOT NULL DEFAULT 'requested',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_test_drives_listing ON test_drives(listing_id);
CREATE INDEX idx_test_drives_buyer ON test_drives(buyer_id);

-- Reviews
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, listing_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- Update profile rating on review
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id))
  WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- RLS
ALTER TABLE saved_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_cars_own" ON saved_cars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_cars_insert" ON saved_cars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_cars_delete" ON saved_cars FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_own" ON saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_searches_insert" ON saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_searches_update" ON saved_searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_searches_delete" ON saved_searches FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "offers_select" ON offers FOR SELECT
  USING (buyer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM listings WHERE listings.id = offers.listing_id AND listings.seller_id = auth.uid()
  ));

CREATE POLICY "offers_insert" ON offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id AND status = 'pending');

CREATE POLICY "offers_update_seller" ON offers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM listings WHERE listings.id = offers.listing_id AND listings.seller_id = auth.uid()
  ));

CREATE POLICY "test_drives_select" ON test_drives FOR SELECT
  USING (buyer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM listings WHERE listings.id = test_drives.listing_id AND listings.seller_id = auth.uid()
  ));

CREATE POLICY "test_drives_insert" ON test_drives FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != reviewee_id);
