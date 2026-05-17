import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Órdenes ({orders.length})</h2>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-sm" /></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Comprador</th>
                <th>Email</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="cell-mono">#{o.id.slice(0, 8)}</td>
                  <td>{o.buyer_name}</td>
                  <td className="cell-email">{o.buyer_email}</td>
                  <td>{o.items?.length || 0}</td>
                  <td className="cell-price">${o.total?.toLocaleString('es-CO')}</td>
                  <td><span className="badge-status badge-confirmada">{o.status}</span></td>
                  <td className="cell-date">{new Date(o.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="admin-empty">No hay órdenes registradas</div>}
        </div>
      )}
    </div>
  )
}
