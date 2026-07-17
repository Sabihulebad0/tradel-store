import { createContext, useContext, type ReactNode } from 'react'
import { db } from './db'

export const ADMIN_EMAIL = 'tahaaslam557@gmail.com'

type Session = { user: { email: string | null | undefined } } | null | undefined

type Ctx = {
  session: Session
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = db.auth.useSession()

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await db.auth.signIn.email({ email, password })
      return { error: error ? error.message ?? 'Sign in failed' : null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' }
    }
  }

  const signOut = async () => {
    await db.auth.signOut()
  }

  const isAdmin = session?.user?.email === ADMIN_EMAIL

  return (
    <AuthCtx.Provider value={{ session, loading: isPending, isAdmin, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
