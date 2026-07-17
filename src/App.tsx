import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './lib/cart'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Category } from './pages/Category'
import { Checkout } from './pages/Checkout'
import { NotFound } from './pages/NotFound'
import { SimplePage } from './pages/SimplePage'

export default function App() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/deals" element={<Shop dealsOnly />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<SimplePage title="Track Your Order" />} />
            <Route path="/account" element={<SimplePage title="My Account" />} />
            <Route path="/help" element={<SimplePage title="Help Center" />} />
            <Route path="/about" element={<SimplePage title="About shopducts.pk" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
