/*
# Create shopducts catalog (categories + products)

1. New Tables
- `categories`
  - id (uuid, pk)
  - slug (text, unique) — URL-safe identifier e.g. "electronics"
  - name (text) — display name e.g. "Electronics"
  - icon (text) — emoji/short glyph for nav chips
  - image (text) — Pexels image URL for category cards
  - sort_order (int) — display ordering
  - created_at (timestamptz)
- `products`
  - id (uuid, pk)
  - slug (text, unique) — URL-safe identifier
  - name (text) — product name
  - brand (text) — brand/manufacturer
  - category_id (uuid, fk -> categories.id)
  - price (numeric) — current price in PKR
  - old_price (numeric, nullable) — original price for discount display
  - rating (numeric) — 0..5 average rating
  - reviews_count (int) — number of reviews
  - image (text) — primary Pexels image URL
  - images (jsonb) — array of additional image URLs
  - description (text) — long-form description
  - features (jsonb) — array of feature strings
  - in_stock (boolean) — availability
  - is_featured (boolean) — shown on home page
  - created_at (timestamptz)

2. Indexes
- products(category_id) — filter by category
- products(is_featured) — home page featured query
- products(slug) unique — product detail lookups
- categories(slug) unique — category page lookups

3. Security
- Enable RLS on both tables.
- Public read-only catalog: SELECT TO anon, authenticated USING (true).
  The catalog is intentionally shared/public (no-auth storefront).
  No INSERT/UPDATE/DELETE policies — catalog is managed server-side only.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🛍️',
  image text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric NOT NULL DEFAULT 0,
  old_price numeric,
  rating numeric NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count int NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  in_stock boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
ON categories FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
ON products FOR SELECT
TO anon, authenticated USING (true);
