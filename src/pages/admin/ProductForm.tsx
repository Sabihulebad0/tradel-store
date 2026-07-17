import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db, type Category } from '../../lib/db'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const EMPTY = {
  name: '', slug: '', brand: '', category_id: '',
  price: '', old_price: '', rating: '0', reviews_count: '0',
  image: '', images: '', description: '', features: '',
  in_stock: true, is_featured: false,
}

export function AdminProductForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: cats } = await db.from('categories').select('*').order('sort_order')
      setCategories(cats ?? [])

      if (isNew) { setLoading(false); return }
      const { data, error } = await db.from('products').select('*').eq('id', id).maybeSingle()
      if (error) { setError(error.message); setLoading(false); return }
      if (data) {
        setForm({
          name: data.name, slug: data.slug, brand: data.brand, category_id: data.category_id ?? '',
          price: String(data.price), old_price: data.old_price != null ? String(data.old_price) : '',
          rating: String(data.rating), reviews_count: String(data.reviews_count),
          image: data.image, images: (data.images ?? []).join('\n'),
          description: data.description, features: (data.features ?? []).join('\n'),
          in_stock: data.in_stock, is_featured: data.is_featured,
        })
        setSlugTouched(true)
      }
      setLoading(false)
    })()
  }, [id, isNew])

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const onNameChange = (v: string) => {
    set('name', v)
    if (!slugTouched) set('slug', slugify(v))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.slug.trim() || !form.price) { setError('Name, slug, and price are required'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      brand: form.brand.trim(),
      category_id: form.category_id || null,
      price: Number(form.price) || 0,
      old_price: form.old_price ? Number(form.old_price) : null,
      rating: Number(form.rating) || 0,
      reviews_count: Number(form.reviews_count) || 0,
      image: form.image.trim(),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      description: form.description.trim(),
      features: form.features.split('\n').map(s => s.trim()).filter(Boolean),
      in_stock: form.in_stock,
      is_featured: form.is_featured,
    }
    const { error } = isNew
      ? await db.from('products').insert(payload)
      : await db.from('products').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/admin/products')
  }

  if (loading) return <div className="text-ink-400">Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Link to="/admin/products" className="hover:text-ink-800">Products</Link><span>/</span>
        <span className="text-ink-800 font-medium">{isNew ? 'New' : 'Edit'}</span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">{isNew ? 'Add Product' : 'Edit Product'}</h1>

      <form onSubmit={submit} className="mt-6 card space-y-4 p-6">
        {error && <div className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink-700">Name</span>
            <input className="input mt-1.5" value={form.name} onChange={e => onNameChange(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Slug</span>
            <input className="input mt-1.5" value={form.slug} onChange={e => { setSlugTouched(true); set('slug', e.target.value) }} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Brand</span>
            <input className="input mt-1.5" value={form.brand} onChange={e => set('brand', e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink-700">Category</span>
            <select className="input mt-1.5" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Price (PKR)</span>
            <input className="input mt-1.5" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Old Price (optional)</span>
            <input className="input mt-1.5" type="number" min="0" step="0.01" value={form.old_price} onChange={e => set('old_price', e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Rating (0-5)</span>
            <input className="input mt-1.5" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Reviews Count</span>
            <input className="input mt-1.5" type="number" min="0" value={form.reviews_count} onChange={e => set('reviews_count', e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">Primary Image URL</span>
          <input className="input mt-1.5" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." />
        </label>
        {form.image && <img src={form.image} alt="" className="h-40 w-full rounded-xl object-cover bg-ink-100" />}

        <label className="block">
          <span className="text-sm font-medium text-ink-700">Additional Image URLs (one per line)</span>
          <textarea className="input mt-1.5 min-h-[80px]" value={form.images} onChange={e => set('images', e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">Description</span>
          <textarea className="input mt-1.5 min-h-[100px]" value={form.description} onChange={e => set('description', e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">Features (one per line)</span>
          <textarea className="input mt-1.5 min-h-[80px]" value={form.features} onChange={e => set('features', e.target.value)} />
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600" checked={form.in_stock} onChange={e => set('in_stock', e.target.checked)} />
            In Stock
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
            Featured on Home
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Product'}</button>
          <Link to="/admin/products" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
