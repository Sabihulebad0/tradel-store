import { useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, Receipt, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '../../components/ui/sheet'
import { Toaster } from '../../components/ui/sonner'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {NAV.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const { session, loading, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading...</div>
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Toaster richColors position="top-right" />

      <aside className="hidden w-60 shrink-0 border-r bg-background sm:flex sm:flex-col">
        <div className="border-b px-5 py-5">
          <div className="font-display text-lg font-bold text-foreground">shopducts</div>
          <div className="text-xs text-muted-foreground">Admin panel</div>
        </div>
        <NavLinks />
        <div className="border-t p-3">
          <div className="truncate px-3 py-1 text-xs text-muted-foreground">{session.user.email}</div>
          <Button variant="outline" onClick={signOut} className="mt-1 w-full justify-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-display font-bold text-foreground">shopducts admin</div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="border-b px-5 py-5">
            <div className="font-display text-lg font-bold text-foreground">shopducts</div>
            <div className="text-xs text-muted-foreground">Admin panel</div>
          </div>
          <NavLinks onNavigate={() => setMobileOpen(false)} />
          <div className="border-t p-3">
            <div className="truncate px-3 py-1 text-xs text-muted-foreground">{session.user.email}</div>
            <Button variant="outline" onClick={signOut} className="mt-1 w-full justify-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
