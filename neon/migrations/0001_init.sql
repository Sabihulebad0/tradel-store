/*
# Shopducts schema on Neon (Data API + Neon Auth)

Ported from the Supabase migrations (create_catalog, admin_crm). Same tables,
RLS rewritten for Neon's Data API roles (`anonymous` / `authenticated`) and
`auth.user_id()` (no `auth.jwt() ->> 'email'` equivalent on Neon — the single
hardcoded admin is matched by joining `neon_auth."user"`, Better Auth's own
user table that Neon Auth manages).

Admin is identified by email 'tahaaslam557@gmail.com', same as ADMIN_EMAIL in
src/lib/auth.tsx. Single-admin store; if more admins are needed later, swap
is_admin() for a real role/profile column.
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

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  notes text,
  payment_method text NOT NULL DEFAULT 'cod',
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  image text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  qty int NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Admin check: current JWT's user id matches the users_sync row for the admin email.
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, neon_auth AS $$
  SELECT EXISTS (
    SELECT 1 FROM neon_auth."user"
    WHERE id = auth.user_id()::uuid
      AND email = 'tahaaslam557@gmail.com'
  )
$$;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anonymous, authenticated;

-- Public read-only catalog.
GRANT SELECT ON categories, products TO anonymous, authenticated;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
ON categories FOR SELECT
TO anonymous, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
ON products FOR SELECT
TO anonymous, authenticated USING (true);

-- Admin write access on the catalog.
GRANT INSERT, UPDATE, DELETE ON categories, products TO authenticated;

DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories"
ON categories FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories"
ON categories FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories"
ON categories FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_write_products" ON products;
CREATE POLICY "admin_write_products"
ON products FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products"
ON products FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products"
ON products FOR DELETE
TO authenticated USING (is_admin());

-- Orders: anyone can create (checkout has no account); only admin can read/manage.
GRANT INSERT ON orders, order_items TO anonymous, authenticated;
GRANT SELECT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, DELETE ON order_items TO authenticated;

DROP POLICY IF EXISTS "public_create_orders" ON orders;
CREATE POLICY "public_create_orders"
ON orders FOR INSERT
TO anonymous, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders"
ON orders FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders"
ON orders FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders"
ON orders FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "public_create_order_items" ON order_items;
CREATE POLICY "public_create_order_items"
ON order_items FOR INSERT
TO anonymous, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items"
ON order_items FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items"
ON order_items FOR DELETE
TO authenticated USING (is_admin());
