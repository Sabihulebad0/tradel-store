import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, type Product, type Category } from '../lib/supabase'
import { fmtPKR, pctOff } from '../lib/format'
import { Stars } from '../components/Stars'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../lib/cart'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { add, setOpen } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setProduct(null)
    setActiveImg(0)
    setQty(1)
    setAdded(false)
    ;(async () => {
      const { data: p } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (!active) return
      setProduct(p)
      if (!p) { setLoading(false); return }

      const [catRes, relRes] = await Promise.all([
        supabase.from('categories').select('*').eq('id', p.category_id).maybeSingle(),
        supabase.from('products').select('*').eq('category_id', p.category_id).neq('id', p.id).limit(5),
      ])
      if (!active) return
      setCategory(catRes.data)
      setRelated(relRes.data ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [slug])

  const handleAdd = () => {
    if (!product) return
    add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, maxQty: 10 }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="container-x py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 skeleton rounded" />
            <div className="h-8 w-3/4 skeleton rounded" />
            <div className="h-6 w-1/3 skeleton rounded" />
            <div className="h-24 w-full skeleton rounded" />
            <div className="h-12 w-full skeleton rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Product not found</h1>
        <p className="mt-2 text-ink-500">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="mt-4 inline-block btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  const images = (product.images as string[]).length ? (product.images as string[]) : [product.image]
  const off = pctOff(product.price, product.old_price)
  const features = product.features as string[]

  return (
    <div className="container-x py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink-800">Home</Link><span>/</span>
        {category && <><Link to={`/category/${category.slug}`} className="hover:text-ink-800">{category.name}</Link><span>/</span></>}
        <span className="text-ink-800 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-white card">
            <img src={images[activeImg]} alt={product.name} className="h-full w-full object-cover animate-fade-in" />
            {off && <span className="absolute top-4 left-4 chip bg-accent-500 text-white font-bold shadow">-{off}% OFF</span>}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImg === i ? 'border-brand-600' : 'border-transparent hover:border-ink-200'}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-brand-600">{product.brand}</div>
          <h1 className="mt-1.5 font-display text-2xl font-bold text-ink-900 sm:text-3xl leading-tight">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars rating={product.rating} size={18} />
            <span className="text-sm font-medium text-ink-700">{product.rating}</span>
            <span className="text-sm text-ink-400">({product.reviews_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl font-bold text-ink-900">Rs {fmtPKR(product.price)}</span>
            {product.old_price && <span className="text-lg text-ink-400 line-through">Rs {fmtPKR(product.old_price)}</span>}
            {off && <span className="chip bg-accent-100 text-accent-700 font-bold">Save {off}%</span>}
          </div>
          <p className="mt-1 text-xs text-ink-500">Inclusive of all taxes</p>

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            {product.in_stock ? (
              <><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /><span className="font-semibold text-brand-700">In Stock</span></>
            ) : (
              <><span className="h-2.5 w-2.5 rounded-full bg-accent-500" /><span className="font-semibold text-accent-600">Out of Stock</span></>
            )}
          </div>

          {/* Quantity + add */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-ink-200">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center text-ink-600 hover:text-ink-900 disabled:opacity-30" disabled={qty <= 1} aria-label="Decrease quantity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
              </button>
              <span className="w-12 text-center font-display font-bold text-ink-900">{qty}</span>
              <button onClick={() => setQty(q => Math.min(10, q + 1))} className="grid h-12 w-12 place-items-center text-ink-600 hover:text-ink-900 disabled:opacity-30" disabled={qty >= 10} aria-label="Increase quantity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
            <button onClick={handleAdd} disabled={!product.in_stock} className="btn-primary flex-1 min-w-[180px] py-3.5 text-base">
              {added ? (
                <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Added to Cart</>
              ) : (
                <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> Add to Cart</>
              )}
            </button>
            <button onClick={() => { handleAdd(); setOpen(true); }} disabled={!product.in_stock} className="btn-accent py-3.5 px-5 text-base">
              Buy Now
            </button>
          </div>

          {/* Delivery info */}
          <div className="mt-6 grid gap-3 rounded-2xl bg-ink-50 p-4 sm:grid-cols-3">
            {[
              ['🚚', 'Free Delivery', 'Orders over Rs 5,000'],
              ['💵', 'Cash on Delivery', 'Available'],
              ['↩️', '7-Day Returns', 'Easy & hassle-free'],
            ].map(([icon, title, sub]) => (
              <div key={title} className="flex items-center gap-2.5">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink-900">{title}</div>
                  <div className="text-[11px] text-ink-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-ink-900">Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{product.description}</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-ink-900">Key Features</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                    <svg className="mt-0.5 shrink-0 text-brand-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
