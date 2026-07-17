import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type Category } from '../../lib/db'

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await db.from('categories').select('*').order('sort_order')
    if (error) setError(error.message)
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"? Products in it will become uncategorized.`)) return
    const { error } = await db.from('categories').delete().eq('id', c.id)
    if (error) { alert(error.message); return }
    setCategories(prev => prev.filter(x => x.id !== c.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Categories</h1>
        <Link to="/admin/categories/new" className="btn-primary">+ Add Category</Link>
      </div>

      {error && <div className="mt-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>}

      <div className="mt-5 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-400">No categories yet.</td></tr>
            ) : categories.map(c => (
              <tr key={c.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <img src={c.image} alt="" className="h-9 w-9 rounded-lg object-cover bg-ink-100" />
                    <span className="font-medium text-ink-900">{c.icon} {c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-500">{c.slug}</td>
                <td className="px-4 py-3 text-ink-500">{c.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/categories/${c.id}/edit`} className="text-sm font-medium text-brand-600 hover:text-brand-700">Edit</Link>
                  <button onClick={() => remove(c)} className="ml-4 text-sm font-medium text-accent-600 hover:text-accent-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
