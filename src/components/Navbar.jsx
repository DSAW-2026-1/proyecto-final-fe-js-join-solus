import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cartApi, notificationsApi } from '../services/api'
import './Navbar.css'

export default function Navbar() {
  const { user, isInternal, isSeller, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [cartCount, setCartCount] = useState(0)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    cartApi.getCart()
      .then((res) => {
        const count = res.data.items?.reduce((s, i) => s + i.quantity, 0) || 0
        setCartCount(count)
      })
      .catch(() => setCartCount(0))
    notificationsApi.getUnreadCount()
      .then((res) => setNotifCount(res.data.count))
      .catch(() => setNotifCount(0))
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-brand" onClick={() => navigate('/explore')}>
          <span className="brand-icon">S</span>
          <span className="brand-text">Marketplace</span>
        </button>
        <div className="navbar-links">
          <button
            className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
            onClick={() => navigate('/explore')}
          >
            Explorar
          </button>
          {isSeller && (
            <>
              <button
                className={`nav-link ${isActive('/products/my') ? 'active' : ''}`}
                onClick={() => navigate('/products/my')}
              >
                Mis productos
              </button>
              <button
                className={`nav-link ${isActive('/products/new') ? 'active' : ''}`}
                onClick={() => navigate('/products/new')}
              >
                Publicar
              </button>
            </>
          )}
          {isAdmin && (
            <button
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>
          )}
          <button
            className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}
            onClick={() => navigate('/wishlist')}
          >
            Favoritos
          </button>
          <button
            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
            onClick={() => navigate('/orders')}
          >
            Mis órdenes
          </button>
          <button
            className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
            onClick={() => navigate('/messages')}
          >
            Mensajes
          </button>
          <button
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Mi perfil
          </button>
        </div>
      </div>
      <div className="navbar-right">
        <button className="nav-icon-btn" onClick={() => navigate('/notifications')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifCount > 0 && <span className="cart-badge">{notifCount}</span>}
        </button>
        <button className="nav-icon-btn" onClick={() => navigate('/cart')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <div className="navbar-user">
          <span className="navbar-email">{user?.email}</span>
          {isSeller && <span className="badge badge-seller-sm">Vendedor</span>}
        </div>
        <button className="btn-logout-sm" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
