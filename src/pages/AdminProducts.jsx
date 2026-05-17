import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

const STATUS_OPTIONS = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    adminApi.getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const changeStatus = async (productId, status) => {
    try {
      await adminApi.updateProductStatus(productId, status)
      fetchProducts()
    } catch (err) { console.error('Error al cambiar estado del producto:', err) }
  }

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Productos ({products.length})</h2>
        <input
          type="text"
          className="admin-search"
          placeholder="Buscar por título o vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-sm" /></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Vendedor</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="cell-title">{p.title}</td>
                  <td>{p.owner?.name || '—'}</td>
                  <td className="cell-price">${p.price?.toLocaleString('es-CO')}</td>
                  <td><span className="badge-category">{p.category}</span></td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`badge-status badge-${p.status?.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={p.status}
                      onChange={(e) => changeStatus(p.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="admin-empty">No se encontraron productos</div>}
        </div>
      )}
    </div>
  )
}
