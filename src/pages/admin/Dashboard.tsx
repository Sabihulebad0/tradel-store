import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { fmtPKR } from '../../lib/format'

export function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, pending: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const [{ count: products }, { count: categories }, { count: orders }, { count: pending }, { data: delivered }] = await Promise.all([
        db.from('products').select('*', { count: 'exact', head: true }),
        db.from('categories').select('*', { count: 'exact', head: true }),
        db.from('orders').select('*', { count: 'exact', head: true }),
        db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('orders').select('total').eq('status', 'delivered'),
      ])
      if (!active) return
      const revenue = (delivered ?? []).reduce((s, o) => s + Number(o.total), 0)
      setStats({ products: products ?? 0, categories: categories ?? 0, orders: orders ?? 0, pending: pending ?? 0, revenue })
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  const cards = [
    { label: 'Products', value: stats.products, to: '/admin/products', icon: '📦' },
    { label: 'Categories', value: stats.categories, to: '/admin/categories', icon: '🗂️' },
    { label: 'Total Orders', value: stats.orders, to: '/admin/orders', icon: '🧾' },
    { label: 'Pending Orders', value: stats.pending, to: '/admin/orders?status=pending', icon: '⏳' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Overview of your store.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="card p-5 transition hover:border-brand-200 hover:shadow-md">
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-3 font-display text-2xl font-bold text-ink-900">{loading ? '—' : c.value}</div>
            <div className="text-sm text-ink-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-4 card p-5">
        <div className="text-sm text-ink-500">Revenue from delivered orders</div>
        <div className="mt-1 font-display text-3xl font-bold text-ink-900">Rs {loading ? '—' : fmtPKR(stats.revenue)}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
        <Link to="/admin/categories/new" className="btn-secondary">+ Add Category</Link>
      </div>
    </div>
  )
}
