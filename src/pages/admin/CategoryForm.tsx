import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../../lib/db'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const MAX_DIMENSION = 800

function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not read image'))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not supported')); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function AdminCategoryForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', slug: '', icon: '🛍️', image: '', sort_order: 0 })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file'); return }
    setError('')
    setUploading(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      set('image', dataUrl)
    } catch {
      setError('Could not process that image')
    } finally {
      setUploading(false)
    }
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

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/categories" className="hover:text-foreground">Categories</Link><span>/</span>
        <span className="font-medium text-foreground">{isNew ? 'New' : 'Edit'}</span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-foreground">{isNew ? 'Add Category' : 'Edit Category'}</h1>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={e => onNameChange(e.target.value)} placeholder="Electronics" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={e => { setSlugTouched(true); set('slug', e.target.value) }} placeholder="electronics" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input id="icon" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🔌" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input id="sort_order" type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category Image</Label>
              {form.image && (
                <img src={form.image} alt="" className="h-32 w-full rounded-xl object-cover bg-muted" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageSelected}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? 'Uploading...' : form.image ? 'Replace Image' : 'Upload Image'}
                </Button>
                {form.image && (
                  <Button type="button" variant="ghost" onClick={() => set('image', '')}>Remove</Button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Category'}</Button>
              <Button type="button" variant="outline" asChild><Link to="/admin/categories">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
