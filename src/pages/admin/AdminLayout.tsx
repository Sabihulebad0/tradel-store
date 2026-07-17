import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { to: '/admin/orders', label: 'Orders', icon: '🧾' },
]

export function AdminLayout() {
  const { session, loading, isAdmin, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-500">Loading...</div>
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-60 shrink-0 border-r border-ink-200 bg-white sm:flex sm:flex-col">
        <div className="border-b border-ink-100 px-5 py-5">
          <div className="font-display text-lg font-bold text-ink-900">shopducts</div>
          <div className="text-xs text-ink-500">Admin panel</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
                }`
              }
            >
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <div className="truncate px-3 py-1 text-xs text-ink-500">{session.user.email}</div>
          <button onClick={signOut} className="btn-secondary mt-1 w-full justify-center py-2 text-sm">Sign Out</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 sm:hidden">
          <div className="font-display font-bold text-ink-900">shopducts admin</div>
          <button onClick={signOut} className="text-sm font-medium text-ink-600">Sign Out</button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-ink-200 bg-white px-2 py-2 sm:hidden">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600'}`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
