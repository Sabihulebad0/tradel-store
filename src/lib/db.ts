import { createClient } from '@neondatabase/neon-js'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters'

export const db = createClient({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: import.meta.env.VITE_NEON_AUTH_URL as string,
    allowAnonymous: true,
  },
  dataApi: {
    url: import.meta.env.VITE_NEON_DATA_API_URL as string,
  },
})

// Temporary: lets the admin RLS debug query run from the browser console.
// Remove once neon/migrations/0002_debug_is_admin.sql is deleted.
;(window as unknown as { db: typeof db }).db = db

export type Category = {
  id: string
  slug: string
  name: string
  icon: string
  image: string
  sort_order: number
  created_at: string
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category_id: string
  price: number
  old_price: number | null
  rating: number
  reviews_count: number
  image: string
  images: string[]
  description: string
  features: string[]
  in_stock: boolean
  is_featured: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  address: string
  city: string
  postal_code: string | null
  notes: string | null
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  name: string
  image: string
  price: number
  qty: number
}
