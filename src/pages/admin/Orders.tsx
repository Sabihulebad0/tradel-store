import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db, type Order, type OrderStatus } from '../../lib/db'
import { fmtPKR } from '../../lib/format'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table'

const STATUSES: (OrderStatus | '')[] = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'secondary',
  shipped: 'secondary',
  delivered: 'default',
  cancelled: 'destructive',
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
      <h1 className="font-display text-2xl font-bold text-foreground">Orders</h1>

      <Tabs value={status || 'all'} onValueChange={v => setParams(v === 'all' ? {} : { status: v })} className="mt-4">
        <TabsList>
          {STATUSES.map(s => (
            <TabsTrigger key={s || 'all'} value={s || 'all'}>
              {s ? s[0].toUpperCase() + s.slice(1) : 'All'}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="mt-5 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No orders found.</TableCell></TableRow>
            ) : orders.map(o => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link to={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">{o.order_number}</Link>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{o.city}</TableCell>
                <TableCell className="font-semibold text-foreground">Rs {fmtPKR(o.total)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status]}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
