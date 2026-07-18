import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Tags, Receipt, Clock, Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { fmtPKR } from '../../lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

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
    { label: 'Products', value: stats.products, to: '/admin/products', icon: Package },
    { label: 'Categories', value: stats.categories, to: '/admin/categories', icon: Tags },
    { label: 'Total Orders', value: stats.orders, to: '/admin/orders', icon: Receipt },
    { label: 'Pending Orders', value: stats.pending, to: '/admin/orders?status=pending', icon: Clock },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your store.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(c => (
          <Link key={c.label} to={c.to}>
            <Card className="transition hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-5">
                <c.icon className="h-6 w-6 text-muted-foreground" />
                <div className="mt-3 font-display text-2xl font-bold text-foreground">{loading ? '—' : c.value}</div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Revenue from delivered orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-bold text-foreground">Rs {loading ? '—' : fmtPKR(stats.revenue)}</div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/admin/products/new"><Plus className="h-4 w-4" />Add Product</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/categories/new"><Plus className="h-4 w-4" />Add Category</Link>
        </Button>
      </div>
    </div>
  )
}
