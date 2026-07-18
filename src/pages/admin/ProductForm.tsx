import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db, type Category } from '../../lib/db'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const NONE = '__none__'

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

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/products" className="hover:text-foreground">Products</Link><span>/</span>
        <span className="font-medium text-foreground">{isNew ? 'New' : 'Edit'}</span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-foreground">{isNew ? 'Add Product' : 'Edit Product'}</h1>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={e => onNameChange(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} onChange={e => { setSlugTouched(true); set('slug', e.target.value) }} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={form.brand} onChange={e => set('brand', e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Category</Label>
                <Select value={form.category_id || NONE} onValueChange={v => set('category_id', v === NONE ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="— None —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— None —</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (PKR)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="old_price">Old Price (optional)</Label>
                <Input id="old_price" type="number" min="0" step="0.01" value={form.old_price} onChange={e => set('old_price', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input id="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reviews_count">Reviews Count</Label>
                <Input id="reviews_count" type="number" min="0" value={form.reviews_count} onChange={e => set('reviews_count', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">Primary Image URL</Label>
              <Input id="image" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            </div>
            {form.image && <img src={form.image} alt="" className="h-40 w-full rounded-xl object-cover bg-muted" />}

            <div className="space-y-1.5">
              <Label htmlFor="images">Additional Image URLs (one per line)</Label>
              <Textarea id="images" className="min-h-[80px]" value={form.images} onChange={e => set('images', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="min-h-[100px]" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea id="features" className="min-h-[80px]" value={form.features} onChange={e => set('features', e.target.value)} />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" checked={form.in_stock} onChange={e => set('in_stock', e.target.checked)} />
                In Stock
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                Featured on Home
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
              <Button type="button" variant="outline" asChild><Link to="/admin/products">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
