import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../../lib/db'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function AdminCategoryForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', slug: '', icon: '🛍️', image: '', sort_order: 0 })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (isNew) return
    ;(async () => {
      const { data, error } = await db.from('categories').select('*').eq('id', id).maybeSingle()
      if (error) { setError(error.message); setLoading(false); return }
      if (data) {
        setForm({ name: data.name, slug: data.slug, icon: data.icon, image: data.image, sort_order: data.sort_order })
        setSlugTouched(true)
      }
      setLoading(false)
    })()
  }, [id, isNew])

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const onNameChange = (v: string) => {
    set('name', v)
    if (!slugTouched) set('slug', slugify(v))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.slug.trim()) { setError('Name and slug are required'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      icon: form.icon.trim() || '🛍️',
      image: form.image.trim(),
      sort_order: Number(form.sort_order) || 0,
    }
    const { error } = isNew
      ? await db.from('categories').insert(payload)
      : await db.from('categories').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/admin/categories')
  }

  if (loading) return <div className="text-ink-400">Loading...</div>

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Link to="/admin/categories" className="hover:text-ink-800">Categories</Link><span>/</span>
        <span className="text-ink-800 font-medium">{isNew ? 'New' : 'Edit'}</span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">{isNew ? 'Add Category' : 'Edit Category'}</h1>

      <form onSubmit={submit} className="mt-6 card space-y-4 p-6">
        {error && <div className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>}
        <label className="block">
          <span className="text-sm font-medium text-ink-700">Name</span>
          <input className="input mt-1.5" value={form.name} onChange={e => onNameChange(e.target.value)} placeholder="Electronics" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-700">Slug</span>
          <input className="input mt-1.5" value={form.slug} onChange={e => { setSlugTouched(true); set('slug', e.target.value) }} placeholder="electronics" required />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Icon (emoji)</span>
            <input className="input mt-1.5" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🔌" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Sort Order</span>
            <input className="input mt-1.5" type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink-700">Image URL</span>
          <input className="input mt-1.5" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." />
        </label>
        {form.image && <img src={form.image} alt="" className="h-32 w-full rounded-xl object-cover bg-ink-100" />}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Category'}</button>
          <Link to="/admin/categories" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
