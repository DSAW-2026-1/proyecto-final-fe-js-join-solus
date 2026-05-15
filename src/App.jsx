import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'
import MyProducts from './pages/MyProducts'
import Messages from './pages/Messages'
import Wishlist from './pages/Wishlist'
import Landing from './pages/Landing'
import Notifications from './pages/Notifications'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import AdminRoute from './components/AdminRoute'

function ProtectedLayout({ children, requireOnboarding = true }) {
  return (
    <ProtectedRoute requireOnboarding={requireOnboarding}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedLayout>
                <Explore />
              </ProtectedLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedLayout>
                <ProductDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/my"
            element={
              <ProtectedLayout>
                <MyProducts />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedLayout>
                <CreateProduct />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedLayout>
                <CreateProduct />
              </ProtectedLayout>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedLayout>
                <Messages />
              </ProtectedLayout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedLayout>
                <Wishlist />
              </ProtectedLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedLayout>
                <Notifications />
              </ProtectedLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedLayout>
                <Cart />
              </ProtectedLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedLayout>
                <Orders />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AppLayout>
                  <Admin />
                </AppLayout>
              </AdminRoute>
            }
          />
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
