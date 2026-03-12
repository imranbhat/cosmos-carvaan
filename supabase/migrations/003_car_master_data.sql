CREATE TABLE car_makes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  name_ar     TEXT,
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
  year_end    INTEGER,
  is_popular  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(make_id, name)
);

CREATE INDEX idx_car_models_make ON car_models(make_id);

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

-- RLS (read-only for all)
ALTER TABLE car_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "makes_select_all" ON car_makes FOR SELECT USING (TRUE);
CREATE POLICY "models_select_all" ON car_models FOR SELECT USING (TRUE);
CREATE POLICY "variants_select_all" ON car_variants FOR SELECT USING (TRUE);
