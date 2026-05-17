import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartApi, ordersApi } from '../services/api'
import { CATEGORIES } from '../data/categories'
import './Cart.css'

const CATEGORY_ICONS = {
  libros: '📚', tecnologia: '💻', comidas: '🍔', ropa: '👕',
  deportes: '⚽', musica: '🎵', muebles: '🪑', servicios: '🔧',
  arte: '🎨', juegos: '🎲', salud: '💄', otros: '📦',
}

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [error, setError] = useState(null)

  const fetchCart = () => {
    setLoading(true)
    cartApi.getCart()
      .then((res) => setCart(res.data))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0)

  const handleQuantity = async (productId, newQty) => {
    if (newQty < 1) return
    try {
      const res = await cartApi.updateItem(productId, newQty)
      setCart(res.data)
    } catch { fetchCart() }
  }

  const handleRemove = async (productId) => {
    try {
      const res = await cartApi.removeItem(productId)
      setCart(res.data)
    } catch { fetchCart() }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    setError(null)
    try {
      const res = await ordersApi.createOrder()
      setOrderResult(res.data)
      setCart({ items: [] })
    } catch (err) {
      setError(err.message || 'Error al crear la orden')
    } finally {
      setCheckingOut(false)
    }
  }

  if (orderResult) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="order-success">
            <div className="order-success-icon">✓</div>
            <h1>¡Orden confirmada!</h1>
            <p className="order-success-id">Orden #{orderResult.id.slice(0, 8)}</p>
            <p className="order-success-desc">
              Recibirás un correo con los detalles de tu compra en los próximos minutos.
            </p>
            <div className="order-summary-card">
              <h3>Resumen de la orden</h3>
              {orderResult.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <span>{item.title} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                </div>
              ))}
              <div className="order-total-row">
                <span>Total</span>
                <span>${orderResult.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
            <div className="order-actions">
              <button className="btn-primary" onClick={() => navigate('/explore')}>
                Seguir explorando
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Ir a mi perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Carrito de compras</h1>
          {totalItems > 0 && (
            <span className="cart-count">{totalItems} producto{totalItems !== 1 ? 's' : ''}</span>
          )}
        </div>

        {error && <div className="form-message error">{error}</div>}

        {loading ? (
          <div className="cart-loading"><div className="spinner-sm" /><p>Cargando carrito...</p></div>
        ) : cart.items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos desde el explorador para empezar a comprar</p>
            <button className="btn-primary" onClick={() => navigate('/explore')}>
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <div className="cart-item-placeholder">{CATEGORY_ICONS[item.category] || '📦'}</div>
                    )}
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <div className="cart-item-info">
                        <span className="cart-item-category">
                          {CATEGORIES.find((c) => c.id === item.category)?.name || item.category}
                        </span>
                        <h3 className="cart-item-title">{item.title}</h3>
                        <span className="cart-item-seller">Vendedor: {item.seller_name}</span>
                      </div>
                      <div className="cart-item-price">
                        ${item.price.toLocaleString('es-CO')}
                      </div>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="cart-quantity">
                        <button className="qty-btn" onClick={() => handleQuantity(item.product_id, item.quantity - 1)}>-</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleQuantity(item.product_id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="cart-item-subtotal">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </div>
                      <button className="cart-remove-btn" onClick={() => handleRemove(item.product_id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Resumen</h2>
              <div className="summary-row">
                <span>Productos ({totalItems})</span>
                <span>${totalPrice.toLocaleString('es-CO')}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${totalPrice.toLocaleString('es-CO')}</span>
              </div>
              <p className="summary-note">Impuestos incluidos donde aplique</p>
              <button
                className="btn-primary btn-checkout"
                onClick={handleCheckout}
                disabled={checkingOut || cart.items.length === 0}
              >
                {checkingOut ? 'Procesando...' : 'Confirmar compra'}
              </button>
              <button className="btn-secondary btn-continue" onClick={() => navigate('/explore')}>
                Seguir comprando
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
