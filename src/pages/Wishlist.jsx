import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { wishlistApi } from '../services/api'
import { CATEGORIES } from '../data/categories'
import './Wishlist.css'

const CATEGORY_ICONS = {
  libros: '📚', tecnologia: '💻', comidas: '🍔', ropa: '👕',
  deportes: '⚽', musica: '🎵', muebles: '🪑', servicios: '🔧',
  arte: '🎨', juegos: '🎲', salud: '💄', otros: '📦',
}

export default function Wishlist() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = () => {
    setLoading(true)
    wishlistApi.getWishlist()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWishlist() }, [])

  const handleRemove = async (productId) => {
    await wishlistApi.toggle(productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>Mis favoritos</h1>
        {products.length > 0 && <span className="wishlist-count">{products.length} producto{products.length !== 1 ? 's' : ''}</span>}
      </div>

      {loading ? (
        <div className="wishlist-loading"><div className="spinner-sm" /></div>
      ) : products.length === 0 ? (
        <div className="wishlist-empty">
          <span className="empty-icon">🤍</span>
          <h2>No tienes favoritos</h2>
          <p>Guarda productos que te interesen para encontrarlos rápido después</p>
          <button className="btn-primary" onClick={() => navigate('/explore')}>Explorar productos</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((p) => (
            <div key={p.id} className="wishlist-card" onClick={() => navigate(`/products/${p.id}`)}>
              <div className="wishlist-card-image">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} />
                ) : (
                  <div className="wishlist-placeholder">{CATEGORY_ICONS[p.category] || '📦'}</div>
                )}
              </div>
              <div className="wishlist-card-body">
                <span className="wishlist-category">
                  {CATEGORIES.find((c) => c.id === p.category)?.name || p.category}
                </span>
                <h3 className="wishlist-title">{p.title}</h3>
                <div className="wishlist-price">${p.price?.toLocaleString('es-CO')}</div>
                <button
                  className="wishlist-remove-btn"
                  onClick={(e) => { e.stopPropagation(); handleRemove(p.id) }}
                >
                  Quitar de favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
