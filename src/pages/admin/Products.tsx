import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { db, type Product, type Category } from '../../lib/db'
import { fmtPKR } from '../../lib/format'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)

  const load = async () => {
    setLoading(true)
    const [{ data: prods, error }, { data: cats }] = await Promise.all([
      db.from('products').select('*').order('created_at', { ascending: false }),
      db.from('categories').select('*').order('sort_order'),
    ])
    if (error) setError(error.message)
    setProducts(prods ?? [])
    setCategories(cats ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async () => {
    if (!pendingDelete) return
    const { error } = await db.from('products').delete().eq('id', pendingDelete.id)
    if (error) { toast.error(error.message); setPendingDelete(null); return }
    setProducts(prev => prev.filter(x => x.id !== pendingDelete.id))
    toast.success(`Deleted "${pendingDelete.name}"`)
    setPendingDelete(null)
  }

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? '—'

  const filtered = products.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
        <Button asChild>
          <Link to="/admin/products/new"><Plus className="h-4 w-4" />Add Product</Link>
        </Button>
      </div>

      <div className="mt-4">
        <Input className="max-w-sm" placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="mt-5 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No products found.</TableCell></TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.brand}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{catName(p.category_id)}</TableCell>
                <TableCell>
                  <div className="font-semibold text-foreground">Rs {fmtPKR(p.price)}</div>
                  {p.old_price && <div className="text-xs text-muted-foreground line-through">Rs {fmtPKR(p.old_price)}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant={p.in_stock ? 'secondary' : 'destructive'}>
                    {p.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell>{p.is_featured ? '⭐' : ''}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <Link to={`/admin/products/${p.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="link" size="sm" className="ml-4 h-auto p-0 text-destructive" onClick={() => setPendingDelete(p)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={open => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{pendingDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
