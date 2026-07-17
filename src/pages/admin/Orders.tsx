import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db, type Order, type OrderStatus } from '../../lib/db'
import { fmtPKR } from '../../lib/format'

const STATUSES: (OrderStatus | '')[] = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-accent-50 text-accent-600',
}

export function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? '') as OrderStatus | ''
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      let query = db.from('orders').select('*').order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (!active) return
      if (error) setError(error.message)
      setOrders(data ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [status])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={s || 'all'}
            onClick={() => setParams(s ? { status: s } : {})}
            className={`chip text-sm ${status === s ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
          >
            {s ? s[0].toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {error && <div className="mt-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>}

      <div className="mt-5 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">No orders found.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${o.id}`} className="font-medium text-brand-600 hover:text-brand-700">{o.order_number}</Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-900">{o.customer_name}</div>
                  <div className="text-xs text-ink-500">{o.customer_phone}</div>
                </td>
                <td className="px-4 py-3 text-ink-500">{o.city}</td>
                <td className="px-4 py-3 font-semibold text-ink-900">Rs {fmtPKR(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`chip text-xs ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-ink-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
