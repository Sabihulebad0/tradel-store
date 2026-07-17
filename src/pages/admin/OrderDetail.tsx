import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db, type Order, type OrderItem, type OrderStatus } from '../../lib/db'
import { fmtPKR } from '../../lib/format'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const [{ data: o, error: oErr }, { data: its }] = await Promise.all([
        db.from('orders').select('*').eq('id', id).maybeSingle(),
        db.from('order_items').select('*').eq('order_id', id),
      ])
      if (!active) return
      if (oErr) setError(oErr.message)
      setOrder(o)
      setItems(its ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [id])

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return
    setSaving(true)
    const { error } = await db.from('orders').update({ status }).eq('id', order.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setOrder({ ...order, status })
  }

  if (loading) return <div className="text-ink-400">Loading...</div>
  if (!order) return <div className="text-ink-500">Order not found.{error && ` ${error}`}</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Link to="/admin/orders" className="hover:text-ink-800">Orders</Link><span>/</span>
        <span className="text-ink-800 font-medium">{order.order_number}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900">{order.order_number}</h1>
        <select
          className="input w-auto py-2"
          value={order.status}
          disabled={saving}
          onChange={e => updateStatus(e.target.value as OrderStatus)}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {error && <div className="mt-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">Customer</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="Name" value={order.customer_name} />
            <Row label="Phone" value={order.customer_phone} />
            {order.customer_email && <Row label="Email" value={order.customer_email} />}
            <Row label="City" value={order.city} />
            <Row label="Address" value={order.address} />
            {order.postal_code && <Row label="Postal Code" value={order.postal_code} />}
            {order.notes && <Row label="Notes" value={order.notes} />}
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">Payment</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="Method" value={order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method} />
            <Row label="Subtotal" value={`Rs ${fmtPKR(order.subtotal)}`} />
            <Row label="Delivery" value={order.delivery_fee === 0 ? 'FREE' : `Rs ${fmtPKR(order.delivery_fee)}`} />
            <Row label="Total" value={`Rs ${fmtPKR(order.total)}`} bold />
            <Row label="Placed" value={new Date(order.created_at).toLocaleString()} />
          </dl>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <h2 className="border-b border-ink-100 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink-900">Items</h2>
        <div className="divide-y divide-ink-100">
          {items.map(i => (
            <div key={i.id} className="flex items-center gap-3 px-5 py-3">
              <img src={i.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-ink-100" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-ink-900">{i.name}</div>
                <div className="text-xs text-ink-500">Rs {fmtPKR(i.price)} × {i.qty}</div>
              </div>
              <div className="font-semibold text-ink-900">Rs {fmtPKR(i.price * i.qty)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`text-right ${bold ? 'font-bold text-ink-900' : 'text-ink-800'}`}>{value}</dd>
    </div>
  )
}
