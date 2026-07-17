import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { fmtPKR } from '../lib/format'

export function CartDrawer() {
  const { items, open, setOpen, subtotal, count, setQty, remove, clear } = useCart()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const delivery = subtotal >= 5000 || subtotal === 0 ? 0 : 200
  const total = subtotal + delivery

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ink-900">Your Cart</h2>
            {count > 0 && <span className="chip bg-brand-100 text-brand-700 text-xs">{count} item{count > 1 ? 's' : ''}</span>}
          </div>
          <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink-100 transition" aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-100">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
              </svg>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-ink-900">Your cart is empty</div>
              <p className="mt-1 text-sm text-ink-500">Browse our catalog and find something you love.</p>
            </div>
            <Link to="/shop" onClick={() => setOpen(false)} className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-ink-100 p-3 animate-fade-in">
                  <Link to={`/product/${item.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover bg-ink-100" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link to={`/product/${item.slug}`} onClick={() => setOpen(false)} className="text-sm font-semibold text-ink-900 line-clamp-2 hover:text-brand-700">{item.name}</Link>
                    <div className="mt-1 text-sm font-bold text-brand-700">Rs {fmtPKR(item.price)}</div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-ink-200">
                        <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-8 w-8 place-items-center text-ink-600 hover:text-ink-900 disabled:opacity-30" disabled={item.qty <= 1} aria-label="Decrease">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-8 w-8 place-items-center text-ink-600 hover:text-ink-900 disabled:opacity-30" disabled={item.qty >= item.maxQty} aria-label="Increase">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-xs font-medium text-ink-400 hover:text-accent-600 transition" aria-label="Remove">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="w-full pt-2 text-xs font-medium text-ink-400 hover:text-accent-600 transition">Clear cart</button>
            </div>

            <div className="border-t border-ink-100 p-5 space-y-3 bg-ink-50/50">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="font-semibold text-ink-900">Rs {fmtPKR(subtotal)}</span></div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'font-semibold text-brand-600' : 'font-semibold text-ink-900'}>
                    {delivery === 0 ? 'FREE' : `Rs ${fmtPKR(delivery)}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-brand-600">Add Rs {fmtPKR(5000 - subtotal)} more for free delivery</p>
                )}
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-3">
                <span className="font-display font-bold text-ink-900">Total</span>
                <span className="font-display text-xl font-bold text-ink-900">Rs {fmtPKR(total)}</span>
              </div>
              <Link to="/checkout" onClick={() => setOpen(false)} className="btn-primary w-full text-base">
                Proceed to Checkout
              </Link>
              <button onClick={() => setOpen(false)} className="w-full text-center text-sm font-medium text-ink-500 hover:text-ink-800 transition">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
