import { Link } from 'react-router-dom'
import type { Product } from '../lib/supabase'
import { fmtPKR, pctOff } from '../lib/format'
import { Stars } from './Stars'
import { useCart } from '../lib/cart'

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const off = pctOff(product.price, product.old_price)

  return (
    <div className="group card overflow-hidden hover:shadow-cardhover hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-ink-50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {off && (
          <span className="absolute top-2.5 left-2.5 chip bg-accent-500 text-white text-xs font-bold shadow-sm">
            -{off}%
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute top-2.5 left-2.5 chip bg-ink-900/85 text-white text-xs font-semibold backdrop-blur-sm">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{product.brand}</div>
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 text-sm font-semibold text-ink-900 line-clamp-2 leading-snug min-h-[2.5rem] hover:text-brand-700 transition"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-ink-500">({product.reviews_count})</span>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <div className="font-display text-lg font-bold text-ink-900">Rs {fmtPKR(product.price)}</div>
            {product.old_price && (
              <div className="text-xs text-ink-400 line-through">Rs {fmtPKR(product.old_price)}</div>
            )}
          </div>
          <button
            onClick={() => add({
              id: product.id, slug: product.slug, name: product.name,
              price: product.price, image: product.image, maxQty: 10,
            })}
            disabled={!product.in_stock}
            aria-label={`Add ${product.name} to cart`}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFB300] text-white hover:bg-[#F59E00] active:scale-95 disabled:bg-ink-200 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="h-5 w-1/2 skeleton rounded mt-3" />
      </div>
    </div>
  )
}
