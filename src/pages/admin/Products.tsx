import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type Product, type Category } from '../../lib/db'
import { fmtPKR } from '../../lib/format'

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const remove = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return
    const { error } = await db.from('products').delete().eq('id', p.id)
    if (error) { alert(error.message); return }
    setProducts(prev => prev.filter(x => x.id !== p.id))
  }

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? '—'

  const filtered = products.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      <div className="mt-4">
        <input className="input max-w-sm" placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {error && <div className="mt-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>}

      <div className="mt-5 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">No products found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-ink-100" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink-900">{p.name}</div>
                      <div className="text-xs text-ink-500">{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-500">{catName(p.category_id)}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink-900">Rs {fmtPKR(p.price)}</div>
                  {p.old_price && <div className="text-xs text-ink-400 line-through">Rs {fmtPKR(p.old_price)}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`chip text-xs ${p.in_stock ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-600'}`}>
                    {p.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-4 py-3">{p.is_featured ? '⭐' : ''}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/products/${p.id}/edit`} className="text-sm font-medium text-brand-600 hover:text-brand-700">Edit</Link>
                  <button onClick={() => remove(p)} className="ml-4 text-sm font-medium text-accent-600 hover:text-accent-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
