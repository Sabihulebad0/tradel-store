import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true },
})

export type Category = {
  id: string
  slug: string
  name: string
  icon: string
  image: string
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
