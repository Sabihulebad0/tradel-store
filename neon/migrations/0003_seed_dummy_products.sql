/*
Seed data: a handful of dummy products spread across 4 categories, for
testing the storefront and admin panel UI. Safe to run multiple times —
categories are upserted by slug, products by slug.
*/

INSERT INTO categories (slug, name, icon, image, sort_order) VALUES
  ('electronics', 'Electronics', '🔌', 'https://picsum.photos/seed/electronics/600/400', 1),
  ('fashion', 'Fashion', '👗', 'https://picsum.photos/seed/fashion/600/400', 2),
  ('home-kitchen', 'Home & Kitchen', '🏠', 'https://picsum.photos/seed/home-kitchen/600/400', 3),
  ('beauty', 'Beauty', '💄', 'https://picsum.photos/seed/beauty/600/400', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, brand, category_id, price, old_price, rating, reviews_count, image, images, description, features, in_stock, is_featured)
VALUES
  ('wireless-earbuds-x1', 'Wireless Earbuds X1', 'SoundCore', (SELECT id FROM categories WHERE slug = 'electronics'),
    4999, 6499, 4.3, 128, 'https://picsum.photos/seed/earbuds/600/600',
    '["https://picsum.photos/seed/earbuds2/600/600"]'::jsonb,
    'Compact true-wireless earbuds with active noise cancellation and 24-hour battery life.',
    '["Active noise cancellation", "24-hour battery with case", "IPX5 water resistant"]'::jsonb,
    true, true),

  ('smart-led-bulb', 'Smart LED Bulb (4-Pack)', 'BrightHome', (SELECT id FROM categories WHERE slug = 'electronics'),
    2999, null, 4.1, 54, 'https://picsum.photos/seed/ledbulb/600/600',
    '[]'::jsonb,
    'Wi-Fi enabled color-changing smart bulbs, works with voice assistants.',
    '["16 million colors", "Voice assistant support", "Schedule and timer"]'::jsonb,
    true, false),

  ('mens-cotton-tshirt', "Men's Cotton T-Shirt", 'Urbanwear', (SELECT id FROM categories WHERE slug = 'fashion'),
    1299, 1799, 4.0, 212, 'https://picsum.photos/seed/tshirt/600/600',
    '["https://picsum.photos/seed/tshirt2/600/600"]'::jsonb,
    'Breathable 100% cotton t-shirt, regular fit, available in multiple colors.',
    '["100% cotton", "Regular fit", "Machine washable"]'::jsonb,
    true, true),

  ('womens-denim-jacket', "Women's Denim Jacket", 'Urbanwear', (SELECT id FROM categories WHERE slug = 'fashion'),
    3499, null, 4.5, 76, 'https://picsum.photos/seed/denimjacket/600/600',
    '[]'::jsonb,
    'Classic fit denim jacket with button closure and chest pockets.',
    '["Classic fit", "Button closure", "Two chest pockets"]'::jsonb,
    true, false),

  ('nonstick-cookware-set', 'Non-Stick Cookware Set (5 Pcs)', 'ChefPro', (SELECT id FROM categories WHERE slug = 'home-kitchen'),
    7999, 9999, 4.6, 91, 'https://picsum.photos/seed/cookware/600/600',
    '["https://picsum.photos/seed/cookware2/600/600"]'::jsonb,
    'Durable non-stick cookware set including pots, pans, and lids.',
    '["Non-stick coating", "Heat resistant handles", "Dishwasher safe"]'::jsonb,
    true, true),

  ('cotton-bedsheet-set', 'Cotton Bedsheet Set (King)', 'HomeComfort', (SELECT id FROM categories WHERE slug = 'home-kitchen'),
    2499, null, 4.2, 38, 'https://picsum.photos/seed/bedsheet/600/600',
    '[]'::jsonb,
    'Soft cotton bedsheet set with 2 pillow covers, king size.',
    '["100% cotton", "King size fit", "Includes 2 pillow covers"]'::jsonb,
    true, false),

  ('vitamin-c-serum', 'Vitamin C Face Serum', 'GlowLab', (SELECT id FROM categories WHERE slug = 'beauty'),
    1899, 2499, 4.4, 163, 'https://picsum.photos/seed/serum/600/600',
    '["https://picsum.photos/seed/serum2/600/600"]'::jsonb,
    'Brightening vitamin C serum for daily use, suitable for all skin types.',
    '["Brightens skin tone", "Suitable for all skin types", "30ml bottle"]'::jsonb,
    true, true),

  ('matte-lipstick-set', 'Matte Lipstick Set (3 Pcs)', 'GlowLab', (SELECT id FROM categories WHERE slug = 'beauty'),
    1599, null, 4.0, 47, 'https://picsum.photos/seed/lipstick/600/600',
    '[]'::jsonb,
    'Long-lasting matte lipstick trio in everyday shades.',
    '["Long-lasting matte finish", "3 everyday shades", "Cruelty-free"]'::jsonb,
    true, false)
ON CONFLICT (slug) DO NOTHING;
