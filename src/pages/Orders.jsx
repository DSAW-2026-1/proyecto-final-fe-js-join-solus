import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersApi } from '../services/api'
import './Orders.css'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Mis órdenes</h1>
        {orders.length > 0 && <span className="orders-count">{orders.length} orden{orders.length !== 1 ? 'es' : ''}</span>}
      </div>

      {loading ? (
        <div className="orders-loading"><div className="spinner-sm" /></div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <span className="empty-icon">📋</span>
          <h2>No tienes órdenes</h2>
          <p>Cuando realices una compra, aparecerá aquí el resumen</p>
          <button className="btn-primary" onClick={() => navigate('/explore')}>Explorar productos</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-card-header">
                <div className="order-id">
                  <span className="order-id-label">Orden</span>
                  <span className="order-id-value">#{o.id.slice(0, 8)}</span>
                </div>
                <span className={`order-status badge-${o.status?.toLowerCase()}`}>{o.status}</span>
                <span className="order-date">
                  {new Date(o.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="order-card-body">
                {o.items.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <div className="order-item-info">
                      <span className="order-item-title">{item.title}</span>
                      <span className="order-item-seller">{item.seller_name}</span>
                    </div>
                    <div className="order-item-qty">x{item.quantity}</div>
                    <div className="order-item-price">${(item.price * item.quantity).toLocaleString('es-CO')}</div>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-total-label">Total</span>
                <span className="order-total-value">${o.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
