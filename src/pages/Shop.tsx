import { useEffect, useMemo, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { db, type Product, type Category } from '../lib/db'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'

const SORTS = [
  { key: 'popular', label: 'Most Popular' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'newest', label: 'Newest First' },
]

const PRICE_BUCKETS = [
  { key: '0-2000', label: 'Under Rs 2,000', min: 0, max: 2000 },
  { key: '2000-5000', label: 'Rs 2,000 - Rs 5,000', min: 2000, max: 5000 },
  { key: '5000-10000', label: 'Rs 5,000 - Rs 10,000', min: 5000, max: 10000 },
  { key: '10000-50000', label: 'Rs 10,000 - Rs 50,000', min: 10000, max: 50000 },
  { key: '50000+', label: 'Over Rs 50,000', min: 50000, max: 9999999 },
]

export function Shop({ dealsOnly = false }: { dealsOnly?: boolean }) {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const q = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'popular'
  const cat = params.get('category') ?? ''
  const priceBuckets = params.get('price')?.split(',').filter(Boolean) ?? []
  const inStockOnly = params.get('instock') === '1'

  const update = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    })
    setParams(next, { replace: true })
  }, [params, setParams])

  const togglePrice = (key: string) => {
    const set = new Set(priceBuckets)
    if (set.has(key)) set.delete(key); else set.add(key)
    update({ price: [...set].join(',') || null })
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      const { data: cats } = await db.from('categories').select('*').order('sort_order')
      if (!active) return
      setCategories(cats ?? [])

      let query = db.from('products').select('*')
      if (dealsOnly) query = query.not('old_price', 'is', null)
      if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`)
      if (cat) query = query.eq('category_id', cat)
      if (inStockOnly) query = query.eq('in_stock', true)
      if (priceBuckets.length) {
        const buckets = PRICE_BUCKETS.filter(b => priceBuckets.includes(b.key))
        if (buckets.length === 1) {
          query = query.gte('price', buckets[0].min).lte('price', buckets[0].max)
        } else if (buckets.length > 1) {
          const conds = buckets.map(b => `price.gte.${b.min},price.lte.${b.max}`).join(',')
          query = query.or(conds)
        }
      }

      switch (sort) {
        case 'price-asc': query = query.order('price', { ascending: true }); break
        case 'price-desc': query = query.order('price', { ascending: false }); break
        case 'rating': query = query.order('rating', { ascending: false }); break
        case 'newest': query = query.order('created_at', { ascending: false }); break
        default: query = query.order('reviews_count', { ascending: false })
      }
      const { data } = await query.limit(60)
      if (!active) return
      setProducts(data ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [q, sort, cat, priceBuckets.join(','), inStockOnly, dealsOnly])

  const activeFilters = priceBuckets.length + (cat ? 1 : 0) + (inStockOnly ? 1 : 0) + (q ? 1 : 0)
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  const FiltersPanel = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">Category</h3>
        <div className="mt-3 space-y-1.5">
          <button onClick={() => update({ category: null })} className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition ${!cat ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-600 hover:bg-ink-100'}`}>All Categories</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => update({ category: c.id })} className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition ${cat === c.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-600 hover:bg-ink-100'}`}>
              <span className="mr-1.5">{c.icon}</span>{c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">Price Range</h3>
        <div className="mt-3 space-y-1.5">
          {PRICE_BUCKETS.map(b => (
            <label key={b.key} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100 cursor-pointer transition">
              <input type="checkbox" checked={priceBuckets.includes(b.key)} onChange={() => togglePrice(b.key)} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              {b.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">Availability</h3>
        <label className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100 cursor-pointer transition">
          <input type="checkbox" checked={inStockOnly} onChange={e => update({ instock: e.target.checked ? '1' : null })} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
          In stock only
        </label>
      </div>

      {activeFilters > 0 && (
        <button onClick={clearAll} className="w-full rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition">
          Clear all filters
        </button>
      )}
    </div>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [categories, cat, priceBuckets.join(','), inStockOnly])

  return (
    <div className="container-x py-6 sm:py-8">
      {/* Breadcrumb + title */}
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink-800">Home</Link>
        <span>/</span>
        <span className="text-ink-800 font-medium">{dealsOnly ? 'Hot Deals' : 'Shop'}</span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        {dealsOnly ? '🔥 Hot Deals' : q ? `Results for "${q}"` : 'All Products'}
      </h1>
      <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}</p>

      <div className="mt-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-32 card p-5">
            {FiltersPanel}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <button onClick={() => setShowFilters(true)} className="btn-secondary py-2.5 lg:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              Filters{activeFilters > 0 && <span className="ml-1 chip bg-brand-600 text-white text-[10px] px-1.5 py-0">{activeFilters}</span>}
            </button>

            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-ink-500 hidden sm:inline">Sort:</label>
              <select value={sort} onChange={e => update({ sort: e.target.value === 'popular' ? null : e.target.value })} className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition">
                {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {q && (
                <span className="chip bg-brand-100 text-brand-700">
                  "{q}"
                  <button onClick={() => update({ q: null })} className="ml-1 hover:text-brand-900">×</button>
                </span>
              )}
              {cat && (
                <span className="chip bg-brand-100 text-brand-700">
                  {categories.find(c => c.id === cat)?.name ?? 'Category'}
                  <button onClick={() => update({ category: null })} className="ml-1 hover:text-brand-900">×</button>
                </span>
              )}
              {priceBuckets.map(k => (
                <span key={k} className="chip bg-brand-100 text-brand-700">
                  {PRICE_BUCKETS.find(b => b.key === k)?.label}
                  <button onClick={() => togglePrice(k)} className="ml-1 hover:text-brand-900">×</button>
                </span>
              ))}
              {inStockOnly && (
                <span className="chip bg-brand-100 text-brand-700">
                  In stock
                  <button onClick={() => update({ instock: null })} className="ml-1 hover:text-brand-900">×</button>
                </span>
              )}
              <button onClick={clearAll} className="text-sm font-medium text-ink-500 hover:text-accent-600 transition">Clear all</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-100">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div>
                <div className="font-display text-lg font-bold text-ink-900">No products found</div>
                <p className="mt-1 text-sm text-ink-500">Try adjusting your filters or search terms.</p>
              </div>
              <button onClick={clearAll} className="btn-secondary">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 animate-fade-in">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl lg:hidden animate-slide-in-left">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink-100" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>{FiltersPanel}</div>
          </div>
        </>
      )}
    </div>
  )
}
