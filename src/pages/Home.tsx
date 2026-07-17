import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Category, type Product } from '../lib/supabase'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'

export function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const [cats, feat, fresh] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8),
      ])
      if (!active) return
      setCategories(cats.data ?? [])
      setFeatured(feat.data ?? [])
      setNewArrivals(fresh.data ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#002A66]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="container-x relative grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-2">
          <div className="text-white animate-slide-up">
            <span className="chip bg-white/15 text-white backdrop-blur-sm border border-white/20">Pakistan's Marketplace</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Shop smarter,<br /><span className="text-accent-300">save bigger.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-brand-50/90 sm:text-lg leading-relaxed">
              Discover electronics, fashion, home essentials and more — with cash on delivery and fast shipping across Pakistan.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3.5 text-base shadow-lg">
                Start Shopping
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/deals" className="btn bg-accent-500 text-white hover:bg-accent-600 px-6 py-3.5 text-base shadow-lg">
                View Hot Deals
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['#fb923c', '#4eb070', '#2f9a55', '#1a6338'].map(c => (
                    <span key={c} className="h-7 w-7 rounded-full border-2 border-brand-600" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-brand-50/90">50,000+ happy customers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fb923c"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.7l1.4-6.8L2.2 9.2l6.9-.8L12 2z"/></svg>
                <span className="font-semibold">4.8/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative hidden lg:block animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="h-56 w-full rounded-2xl object-cover shadow-2xl border-4 border-white/20" />
                <img src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="h-40 w-full rounded-2xl object-cover shadow-2xl border-4 border-white/20" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://images.pexels.com/photos/4109965/pexels-photo-4109965.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="h-40 w-full rounded-2xl object-cover shadow-2xl border-4 border-white/20" />
                <img src="https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" className="h-56 w-full rounded-2xl object-cover shadow-2xl border-4 border-white/20" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-2xl animate-slide-up">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </span>
                <div>
                  <div className="text-xs text-ink-500">Free delivery</div>
                  <div className="font-display font-bold text-ink-900">Orders over Rs 5,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x -mt-6 relative z-10">
        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-4 sm:gap-4 sm:p-5">
          {[
            ['🚚', 'Fast Shipping', 'Nationwide in 2-4 days'],
            ['💵', 'Cash on Delivery', 'Pay when you receive'],
            ['↩️', '7-Day Returns', 'Hassle-free returns'],
            ['🔒', 'Secure Checkout', 'Your data is protected'],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="text-sm font-bold text-ink-900">{title}</div>
                <div className="text-xs text-ink-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="container-x mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-ink-500">Find exactly what you need</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition">View all →</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(c => (
            <Link key={c.id} to={`/category/${c.slug}`} className="group relative overflow-hidden rounded-2xl aspect-[4/5] card hover:shadow-cardhover transition-all duration-300">
              <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <span className="text-2xl">{c.icon}</span>
                <div className="mt-1 font-display text-sm font-bold leading-tight">{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-x mt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Featured Products</h2>
            <p className="mt-1 text-sm text-ink-500">Handpicked favorites for you</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition">See all →</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Promo banner */}
      <section className="container-x mt-14">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <span className="chip bg-accent-500/20 text-accent-300 border border-accent-500/30">Limited Time</span>
              <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">Mega Sale — up to 40% off</h3>
              <p className="mt-2 text-ink-300">Don't miss out on the biggest discounts of the season.</p>
            </div>
            <Link to="/deals" className="btn bg-accent-500 text-white hover:bg-accent-600 px-7 py-3.5 text-base shadow-lg whitespace-nowrap">
              Shop Deals
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-x mt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">New Arrivals</h2>
            <p className="mt-1 text-sm text-ink-500">Fresh in the store</p>
          </div>
          <Link to="/shop?sort=newest" className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition">See all →</Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
