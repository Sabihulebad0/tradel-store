import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { db, type Category } from '../../lib/db'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await db.from('categories').select('*').order('sort_order')
    if (error) setError(error.message)
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async () => {
    if (!pendingDelete) return
    const { error } = await db.from('categories').delete().eq('id', pendingDelete.id)
    if (error) { toast.error(error.message); setPendingDelete(null); return }
    setCategories(prev => prev.filter(x => x.id !== pendingDelete.id))
    toast.success(`Deleted "${pendingDelete.name}"`)
    setPendingDelete(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
        <Button asChild>
          <Link to="/admin/categories/new"><Plus className="h-4 w-4" />Add Category</Link>
        </Button>
      </div>

      {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="mt-5 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No categories yet.</TableCell></TableRow>
            ) : categories.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <img src={c.image} alt="" className="h-9 w-9 rounded-lg object-cover bg-muted" />
                    <span className="font-medium text-foreground">{c.icon} {c.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-muted-foreground">{c.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <Link to={`/admin/categories/${c.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="link" size="sm" className="ml-4 h-auto p-0 text-destructive" onClick={() => setPendingDelete(c)}>
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{pendingDelete?.name}". Products in it will become uncategorized.
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
