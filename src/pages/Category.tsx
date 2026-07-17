import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, type Product, type Category } from '../lib/supabase'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'

const SORTS = [
  { key: 'popular', label: 'Most Popular' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
]

export function Category() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('popular')

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
      if (!active) return
      setCategory(cat)
      if (!cat) { setProducts([]); setLoading(false); return }

      let query = supabase.from('products').select('*').eq('category_id', cat.id)
      switch (sort) {
        case 'price-asc': query = query.order('price', { ascending: true }); break
        case 'price-desc': query = query.order('price', { ascending: false }); break
        case 'rating': query = query.order('rating', { ascending: false }); break
        default: query = query.order('reviews_count', { ascending: false })
      }
      const { data } = await query.limit(60)
      if (!active) return
      setProducts(data ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [slug, sort])

  if (!loading && !category) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Category not found</h1>
        <Link to="/shop" className="mt-4 inline-block btn-primary">Browse all products</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Category banner */}
      {category && (
        <div className="relative h-48 overflow-hidden sm:h-64">
          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-ink-950/20" />
          <div className="container-x absolute inset-0 flex flex-col justify-end pb-6">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Link to="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-white">Shop</Link>
              <span>/</span>
              <span className="text-white font-medium">{category.name}</span>
            </div>
            <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-bold text-white sm:text-4xl">
              <span className="text-4xl">{category.icon}</span>{category.name}
            </h1>
          </div>
        </div>
      )}

      <div className="container-x py-6 sm:py-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-sm text-ink-500">{loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}</p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink-500 hidden sm:inline">Sort:</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition">
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ink-500">No products in this category yet.</p>
            <Link to="/shop" className="mt-4 inline-block btn-secondary">Browse all</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 animate-fade-in">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
