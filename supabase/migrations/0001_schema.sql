-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Core Catalog Tables
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id)
);
CREATE INDEX ON categories(parent_id);

CREATE TABLE canonical_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  default_unit TEXT CHECK (default_unit IN ('ea','dozen','g','kg','ml','l')),
  notes TEXT,
  embedding VECTOR(384)
);
CREATE INDEX ON canonical_products(brand_id);
CREATE INDEX ON canonical_products(category_id);

CREATE TABLE product_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES canonical_products(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  embedding VECTOR(384),
  UNIQUE(product_id, alias)
);
CREATE INDEX ON product_aliases(product_id);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES canonical_products(id) ON DELETE CASCADE,
  upc TEXT,
  size_qty NUMERIC,
  size_unit TEXT CHECK (size_unit IN ('ea','dozen','g','kg','ml','l')),
  variant_name TEXT,
  UNIQUE(product_id, upc)
);
CREATE INDEX ON product_variants(product_id);
CREATE INDEX ON product_variants(upc) WHERE upc IS NOT NULL;

-- Store and Products Tables
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region TEXT DEFAULT 'ON',
  enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  external_ids JSONB DEFAULT '{}'::JSONB
);
CREATE INDEX ON store_locations(store_id);
CREATE INDEX ON store_locations(postal_code) WHERE postal_code IS NOT NULL;

CREATE TABLE store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES canonical_products(id),
  store_sku TEXT NOT NULL,
  name TEXT NOT NULL,
  size_text TEXT,
  unit_qty NUMERIC,
  unit TEXT CHECK (unit IN ('ea','dozen','g','kg','ml','l')),
  upc TEXT,
  url TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  embedding VECTOR(384),
  UNIQUE(store_id, store_sku)
);
CREATE INDEX ON store_products(product_id);
CREATE INDEX ON store_products(store_id, store_sku);
CREATE INDEX ON store_products(upc) WHERE upc IS NOT NULL;

CREATE TABLE product_matches (
  store_product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES canonical_products(id) ON DELETE CASCADE,
  confidence NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (store_product_id, product_id)
);
CREATE INDEX ON product_matches(product_id);

-- Pricing Tables
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'CAD',
  promo_text TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON prices(store_product_id, fetched_at DESC);

-- View for latest prices
CREATE VIEW latest_prices AS
SELECT DISTINCT ON (store_product_id)
  store_product_id, price, currency, promo_text, fetched_at
FROM prices
ORDER BY store_product_id, fetched_at DESC;

-- User Lists and Items
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON lists(user_id);

CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  canonical_product_id UUID REFERENCES canonical_products(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON list_items(list_id);
CREATE INDEX ON list_items(canonical_product_id);

-- User Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  postal_code TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  store_context_json JSONB DEFAULT '{}'::JSONB
);
CREATE INDEX ON locations(user_id);

-- Enable Row Level Security
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Public tables (read-only for authenticated users)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Insert default stores
INSERT INTO stores (name, slug, region) VALUES
  ('No Frills', 'nofrills', 'ON'),
  ('Food Basics', 'foodbasics', 'ON'),
  ('Walmart', 'walmart', 'ON'),
  ('Costco', 'costco', 'ON');
