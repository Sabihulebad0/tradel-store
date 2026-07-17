import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { db, type Product } from '../lib/db'

const NAV = [
  { label: 'Electronics', slug: 'electronics' },
  { label: 'Fashion', slug: 'fashion' },
  { label: 'Home & Living', slug: 'home-living' },
  { label: 'Beauty', slug: 'beauty' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Grocery', slug: 'grocery' },
]

export function Header() {
  const { count, setOpen } = useCart()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [showResults, setShowResults] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setShowResults(false)
  }, [location.pathname])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults([]); return }
    let active = true
    const t = setTimeout(async () => {
      const { data } = await db
        .from('products')
        .select('*')
        .or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
        .limit(6)
      if (active) setResults(data ?? [])
    }, 200)
    return () => { active = false; clearTimeout(t) }
  }, [q])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    setShowResults(false)
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop')
  }

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      {/* Top bar */}
      <div className="bg-[#002A66] text-ink-200 text-xs">
        <div className="container-x flex h-9 items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span className="hidden sm:inline">Free delivery on orders over Rs 5,000</span>
            <span className="sm:hidden">Free delivery over Rs 5,000</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track" className="hover:text-white transition">Track Order</Link>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Cash on Delivery available</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-x flex h-16 items-center gap-3 sm:gap-6">
        <button
          className="lg:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-ink-100 transition"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={mobileOpen ? 'M6 6l12 12M6 18L18 6' : 'M3 6h18M3 12h18M3 18h18'}/></svg>
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white font-display font-bold text-lg">S</span>
          <span className="font-display text-xl font-bold text-ink-900 hidden sm:block">shopducts<span className="text-brand-600">.pk</span></span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
          <form onSubmit={submit}>
            <div className="relative">
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-[#FFB300] hover:bg-[#F59E00] transition"
                aria-label="Search"
              >
                <svg width="18" height="18" viewBox="0 0 25 25" fill="none" stroke="#002A66" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
              <input
                value={q}
                onChange={e => { setQ(e.target.value); setShowResults(true) }}
                onFocus={() => setShowResults(true)}
                placeholder="Search for products, brands and more..."
                className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2.5 pl-4 pr-12 text-sm focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
              />
            </div>
          </form>

          {showResults && q.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 card overflow-hidden animate-scale-in z-50">
              {results.length === 0 ? (
                <div className="p-4 text-sm text-ink-500">No results for "{q.trim()}"</div>
              ) : (
                <ul className="max-h-96 overflow-auto">
                  {results.map(p => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} className="flex items-center gap-3 p-2.5 hover:bg-ink-50 transition" onClick={() => setShowResults(false)}>
                        <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-ink-100" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-ink-900 truncate">{p.name}</div>
                          <div className="text-xs text-ink-500">{p.brand}</div>
                        </div>
                        <div className="text-sm font-bold text-brand-700">Rs {new Intl.NumberFormat('en-PK').format(p.price)}</div>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button onClick={submit} className="w-full p-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition text-center">
                      See all results →
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <Link to="/account" className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-ink-100 transition text-sm font-medium text-ink-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="hidden lg:inline">Account</span>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-ink-100 transition"
            aria-label="Open cart"
          >
            <span className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-800">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent-600 px-1 text-[11px] font-bold text-white animate-scale-in">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden lg:inline text-sm font-medium text-ink-700">Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="container-x pb-3 md:hidden">
        <form onSubmit={submit}>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>
        </form>
      </div>

      {/* Nav */}
      <nav className="border-t border-ink-100 hidden lg:block">
        <div className="container-x flex h-11 items-center gap-1">
          <Link to="/shop" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-900 hover:bg-ink-100 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            All Categories
          </Link>
          {NAV.map(n => (
            <Link key={n.slug} to={`/category/${n.slug}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:text-brand-700 hover:bg-brand-50 transition">
              {n.label}
            </Link>
          ))}
          <Link to="/deals" className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-accent-600 hover:bg-accent-50 transition">
            {/* <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5.926 20.574a7.26 7.26 0 0 0 3.039 1.511c.107.035.179-.105.107-.175-2.395-2.285-1.079-4.758-.107-5.873.693-.796 1.68-2.107 1.608-3.865 0-.176.18-.317.322-.211 1.359.703 2.288 2.25 2.538 3.515.394-.386.537-.984.537-1.511 0-.176.214-.317.393-.176 1.287 1.16 3.503 5.097-.072 8.19-.071.071 0 .212.072.177a8.761 8.761 0 0 0 3.003-1.442c5.827-4.5 2.037-12.48-.43-15.116-.321-.317-.893-.106-.893.351-.036.95-.322 2.004-1.072 2.707-.572-2.39-2.478-5.105-5.195-6.441-.357-.176-.786.105-.75.492.07 3.27-2.063 5.352-3.922 8.059-1.645 2.425-2.717 6.89.822 9.808z" fill="#FFB300"/></svg>
            Hot Deals
          </Link>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-100 bg-white animate-slide-up">
          <div className="container-x py-3 space-y-1">
            <Link to="/shop" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-100">All Categories</Link>
            {NAV.map(n => (
              <Link key={n.slug} to={`/category/${n.slug}`} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100">{n.label}</Link>
            ))}
            <Link to="/deals" className="block rounded-lg px-3 py-2.5 text-sm font-bold text-accent-600 hover:bg-accent-50">Hot Deals</Link>
          </div>
        </div>
      )}
    </header>
  )
}
