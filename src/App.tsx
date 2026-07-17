import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './lib/cart'
import { AuthProvider } from './lib/auth'
import { StorefrontLayout } from './components/StorefrontLayout'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Category } from './pages/Category'
import { Checkout } from './pages/Checkout'
import { NotFound } from './pages/NotFound'
import { SimplePage } from './pages/SimplePage'
import { AdminLogin } from './pages/admin/Login'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminProducts } from './pages/admin/Products'
import { AdminProductForm } from './pages/admin/ProductForm'
import { AdminCategories } from './pages/admin/Categories'
import { AdminCategoryForm } from './pages/admin/CategoryForm'
import { AdminOrders } from './pages/admin/Orders'
import { AdminOrderDetail } from './pages/admin/OrderDetail'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<StorefrontLayout />}>
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
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/new" element={<AdminCategoryForm />} />
            <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
