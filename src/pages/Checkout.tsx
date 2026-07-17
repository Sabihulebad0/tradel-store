import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { fmtPKR } from '../lib/format'
import { db } from '../lib/db'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Mardan', 'Other']

export function Checkout() {
  const { items, subtotal, count, clear } = useCart()
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: 'Karachi', postal: '', notes: '', payment: 'cod',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const delivery = subtotal >= 5000 ? 0 : 200
  const total = subtotal + delivery

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^\+?92\s?3\d{2}\s?\d{7}$|^03\d{2}-?\d{7}$/.test(form.phone.trim())) e.phone = 'Enter a valid Pakistani mobile (e.g. 0300-1234567)'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city) e.city = 'Select a city'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitError('')
    setSubmitting(true)

    const id = 'SD-' + Math.random().toString(36).slice(2, 8).toUpperCase()

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        order_number: id,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim() || null,
        address: form.address.trim(),
        city: form.city,
        postal_code: form.postal.trim() || null,
        notes: form.notes.trim() || null,
        payment_method: form.payment,
        subtotal,
        delivery_fee: delivery,
        total,
      })
      .select()
      .single()

    if (orderError || !order) {
      setSubmitError(orderError?.message ?? 'Could not place order. Please try again.')
      setSubmitting(false)
      return
    }

    const { error: itemsError } = await db.from('order_items').insert(
      items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
      }))
    )

    setSubmitting(false)
    if (itemsError) {
      setSubmitError(itemsError.message)
      return
    }

    setOrderId(id)
    setPlaced(true)
    clear()
    window.scrollTo(0, 0)
  }

  if (placed) {
    return (
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-lg text-center animate-slide-up">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-100">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink-900">Order Confirmed!</h1>
          <p className="mt-2 text-ink-600">Thank you for your order. We'll call you shortly to confirm delivery details.</p>
          <div className="mt-6 rounded-2xl bg-ink-50 p-5 text-left">
            <div className="flex items-center justify-between border-b border-ink-200 pb-3">
              <span className="text-sm text-ink-500">Order ID</span>
              <span className="font-display font-bold text-ink-900">{orderId}</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-ink-500">Payment Method</span>
              <span className="font-semibold text-ink-900">Cash on Delivery</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-500">Estimated delivery: 2-4 business days</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            <Link to="/track" className="btn-secondary">Track Order</Link>
          </div>
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="container-x py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink-100">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink-900">Your cart is empty</h1>
        <p className="mt-2 text-ink-500">Add some products before checking out.</p>
        <Link to="/shop" className="mt-5 inline-block btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="container-x py-6 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink-800">Home</Link><span>/</span><span className="text-ink-800 font-medium">Checkout</span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Checkout</h1>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Delivery Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.name}>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmed Khan" />
              </Field>
              <Field label="Mobile Number" required error={errors.phone}>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0300-1234567" />
              </Field>
              <Field label="Email (optional)" error={errors.email}>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ahmed@example.com" />
              </Field>
              <Field label="City" required error={errors.city}>
                <select className="input" value={form.city} onChange={e => set('city', e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street Address" required error={errors.address}>
                  <textarea className="input min-h-[80px] resize-none" value={form.address} onChange={e => set('address', e.target.value)} placeholder="House #, Street, Area, Landmark" />
                </Field>
              </div>
              <Field label="Postal Code (optional)">
                <input className="input" value={form.postal} onChange={e => set('postal', e.target.value)} placeholder="74000" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Order Notes (optional)">
                  <textarea className="input min-h-[60px] resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special delivery instructions..." />
                </Field>
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Payment Method</h2>
            <div className="mt-4 space-y-3">
              <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${form.payment === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300'}`}>
                <input type="radio" name="payment" value="cod" checked={form.payment === 'cod'} onChange={() => set('payment', 'cod')} className="h-4 w-4 text-brand-600" />
                <span className="text-2xl">💵</span>
                <div className="flex-1">
                  <div className="font-semibold text-ink-900">Cash on Delivery</div>
                  <div className="text-sm text-ink-500">Pay with cash when your order arrives</div>
                </div>
              </label>
              <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-not-allowed opacity-60 transition border-ink-200`}>
                <input type="radio" name="payment" disabled className="h-4 w-4" />
                <span className="text-2xl">💳</span>
                <div className="flex-1">
                  <div className="font-semibold text-ink-900">Card Payment</div>
                  <div className="text-sm text-ink-500">Coming soon</div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Order Summary</h2>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative shrink-0">
                    <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover bg-ink-100" />
                    <span className="absolute -top-2 -right-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-ink-900 px-1 text-[11px] font-bold text-white">{item.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-900 line-clamp-2">{item.name}</div>
                    <div className="text-xs text-ink-500">Rs {fmtPKR(item.price)} each</div>
                  </div>
                  <div className="text-sm font-bold text-ink-900">Rs {fmtPKR(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between text-ink-600"><span>Subtotal ({count} items)</span><span className="font-semibold text-ink-900">Rs {fmtPKR(subtotal)}</span></div>
              <div className="flex justify-between text-ink-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'font-semibold text-brand-600' : 'font-semibold text-ink-900'}>{delivery === 0 ? 'FREE' : `Rs ${fmtPKR(delivery)}`}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between border-t border-ink-100 pt-3">
              <span className="font-display font-bold text-ink-900">Total</span>
              <span className="font-display text-2xl font-bold text-ink-900">Rs {fmtPKR(total)}</span>
            </div>

            {submitError && (
              <div className="mt-4 rounded-xl bg-accent-50 px-3 py-2 text-sm text-accent-700">{submitError}</div>
            )}
            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-3.5 text-base">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="mt-3 text-center text-xs text-ink-500">By placing your order, you agree to our Terms & Privacy Policy.</p>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700">{label}{required && <span className="text-accent-500"> *</span>}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-accent-600">{error}</span>}
    </label>
  )
}
