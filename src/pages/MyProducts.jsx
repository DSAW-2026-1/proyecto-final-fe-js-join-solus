import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../services/api'
import { CATEGORIES } from '../data/categories'
import './MyProducts.css'

const CATEGORY_ICONS = {
  libros: '📚', tecnologia: '💻', comidas: '🍔', ropa: '👕',
  deportes: '⚽', musica: '🎵', muebles: '🪑', servicios: '🔧',
  arte: '🎨', juegos: '🎲', salud: '💄', otros: '📦',
}

export default function MyProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const fetchProducts = () => {
    setLoading(true)
    productsApi.getMyProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return
    setDeleting(productId)
    try {
      await productsApi.deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch {}
    setDeleting(null)
  }

  return (
    <div className="my-products-page">
      <div className="my-products-header">
        <div>
          <h1>Mis productos</h1>
          <p>{products.length} producto{products.length !== 1 ? 's' : ''} publicados</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/products/new')}>
          + Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="my-products-loading"><div className="spinner-sm" /></div>
      ) : products.length === 0 ? (
        <div className="my-products-empty">
          <span className="empty-icon">📦</span>
          <h2>No tienes productos</h2>
          <p>Publica tu primer producto para empezar a vender</p>
          <button className="btn-primary" onClick={() => navigate('/products/new')}>
            Publicar producto
          </button>
        </div>
      ) : (
        <div className="my-products-grid">
          {products.map((p) => (
            <div key={p.id} className="my-product-card">
              <div className="my-product-image">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} />
                ) : (
                  <div className="my-product-placeholder">{CATEGORY_ICONS[p.category] || '📦'}</div>
                )}
              </div>
              <div className="my-product-body">
                <div className="my-product-top">
                  <span className="my-product-category">
                    {CATEGORIES.find((c) => c.id === p.category)?.name || p.category}
                  </span>
                  <span className={`my-product-status badge-${p.status?.toLowerCase()}`}>{p.status}</span>
                </div>
                <h3 className="my-product-title">{p.title}</h3>
                <div className="my-product-price">${p.price?.toLocaleString('es-CO')}</div>
                <div className="my-product-meta">
                  <span>Stock: {p.stock}</span>
                  <span>{new Date(p.created_at).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="my-product-actions">
                  <button className="btn-action btn-edit" onClick={() => navigate(`/products/${p.id}/edit`)}>
                    Editar
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
