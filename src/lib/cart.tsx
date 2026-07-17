import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image: string
  qty: number
  maxQty: number
}

type State = { items: CartItem[]; open: boolean }

type Action =
  | { type: 'add'; item: Omit<CartItem, 'qty'>; qty?: number }
  | { type: 'remove'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'clear' }
  | { type: 'open'; open: boolean }

const STORAGE = 'shopducts_cart'

const load = (): State => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return { items: JSON.parse(raw), open: false }
  } catch { /* ignore */ }
  return { items: [], open: false }
}

const save = (items: CartItem[]) => {
  try { localStorage.setItem(STORAGE, JSON.stringify(items)) } catch { /* ignore */ }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const qty = action.qty ?? 1
      const existing = state.items.find(i => i.id === action.item.id)
      let items: CartItem[]
      if (existing) {
        items = state.items.map(i =>
          i.id === action.item.id ? { ...i, qty: Math.min(i.qty + qty, i.maxQty) } : i
        )
      } else {
        items = [...state.items, { ...action.item, qty: Math.min(qty, action.item.maxQty) }]
      }
      return { ...state, items, open: true }
    }
    case 'remove':
      return { ...state, items: state.items.filter(i => i.id !== action.id) }
    case 'setQty':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, qty: Math.max(1, Math.min(action.qty, i.maxQty)) } : i
        ),
      }
    case 'clear':
      return { ...state, items: [] }
    case 'open':
      return { ...state, open: action.open }
    default:
      return state
  }
}

type Ctx = {
  items: CartItem[]
  open: boolean
  count: number
  subtotal: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

const CartCtx = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => { save(state.items) }, [state.items])

  const value = useMemo<Ctx>(() => ({
    items: state.items,
    open: state.open,
    count: state.items.reduce((s, i) => s + i.qty, 0),
    subtotal: state.items.reduce((s, i) => s + i.qty * i.price, 0),
    add: (item, qty) => dispatch({ type: 'add', item, qty }),
    remove: id => dispatch({ type: 'remove', id }),
    setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
    clear: () => dispatch({ type: 'clear' }),
    setOpen: open => dispatch({ type: 'open', open }),
  }), [state])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
