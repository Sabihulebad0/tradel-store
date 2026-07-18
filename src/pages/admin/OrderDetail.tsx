import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { db, type Order, type OrderItem, type OrderStatus } from '../../lib/db'
import { fmtPKR } from '../../lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

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
    if (error) { toast.error(error.message); return }
    setOrder({ ...order, status })
    toast.success(`Status updated to ${status}`)
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (!order) return <div className="text-muted-foreground">Order not found.{error && ` ${error}`}</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/orders" className="hover:text-foreground">Orders</Link><span>/</span>
        <span className="font-medium text-foreground">{order.order_number}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">{order.order_number}</h1>
        <Select value={order.status} disabled={saving} onValueChange={v => updateStatus(v as OrderStatus)}>
          <SelectTrigger className="w-auto min-w-[10rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-1.5 text-sm">
              <Row label="Name" value={order.customer_name} />
              <Row label="Phone" value={order.customer_phone} />
              {order.customer_email && <Row label="Email" value={order.customer_email} />}
              <Row label="City" value={order.city} />
              <Row label="Address" value={order.address} />
              {order.postal_code && <Row label="Postal Code" value={order.postal_code} />}
              {order.notes && <Row label="Notes" value={order.notes} />}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-1.5 text-sm">
              <Row label="Method" value={order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method} />
              <Row label="Subtotal" value={`Rs ${fmtPKR(order.subtotal)}`} />
              <Row label="Delivery" value={order.delivery_fee === 0 ? 'FREE' : `Rs ${fmtPKR(order.delivery_fee)}`} />
              <Row label="Total" value={`Rs ${fmtPKR(order.total)}`} bold />
              <Row label="Placed" value={new Date(order.created_at).toLocaleString()} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wide">Items</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {items.map(i => (
            <div key={i.id} className="flex items-center gap-3 px-5 py-3">
              <img src={i.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-muted" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">{i.name}</div>
                <div className="text-xs text-muted-foreground">Rs {fmtPKR(i.price)} × {i.qty}</div>
              </div>
              <div className="font-semibold text-foreground">Rs {fmtPKR(i.price * i.qty)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? 'text-right font-bold text-foreground' : 'text-right text-foreground'}>{value}</dd>
    </div>
  )
}
