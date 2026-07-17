import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export function AdminLogin() {
  const { session, isAdmin, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (session && isAdmin) {
    const to = (location.state as { from?: string } | null)?.from ?? '/admin'
    return <Navigate to={to} replace />
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl font-bold text-ink-900">shopducts</div>
          <div className="mt-1 text-sm text-ink-500">Admin sign in</div>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div>
          )}
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Email</span>
            <input className="input mt-1.5" type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Password</span>
            <input className="input mt-1.5" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          <button type="submit" disabled={busy} className="btn-primary w-full py-3">{busy ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}
