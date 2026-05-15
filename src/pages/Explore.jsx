import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { productsApi, wishlistApi } from '../services/api'
import { CATEGORIES, CONDITIONS } from '../data/categories'
import './Explore.css'

const CONDITION_LABELS = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como nuevo',
  bueno: 'Buen estado',
  aceptable: 'Aceptable',
}

const CATEGORY_ICONS = {
  libros: '📚', tecnologia: '💻', comidas: '🍔', ropa: '👕',
  deportes: '⚽', musica: '🎵', muebles: '🪑', servicios: '🔧',
  arte: '🎨', juegos: '🎲', salud: '💄', otros: '📦',
}

export default function Explore() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState({ data: [], meta: null })
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    wishlistApi.getWishlist()
      .then((res) => setFavorites(new Set(res.data.map((p) => p.id))))
      .catch(() => {})
  }, [])

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const condition = searchParams.get('condition') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    setLoading(true)
    const params = Object.fromEntries(searchParams.entries())
    productsApi.searchProducts(params)
      .then((res) => setResults(res))
      .catch(() => setResults({ data: [], meta: null }))
      .finally(() => setLoading(false))
  }, [searchParams])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('q', searchInput)
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const toggleFavorite = async (e, productId) => {
    e.stopPropagation()
    try {
      const res = await wishlistApi.toggle(productId)
      setFavorites((prev) => {
        const next = new Set(prev)
        if (res.data.added) next.add(productId)
        else next.delete(productId)
        return next
      })
    } catch {}
  }

  const hasFilters = category || condition || minPrice || maxPrice
  const activeCount = [category, condition, minPrice, maxPrice].filter(Boolean).length

  return (
    <div className="explore-page">
      <div className="explore-hero">
        <div className="explore-hero-content">
          <h1>¿Qué estás buscando?</h1>
          <p>Encuentra productos y servicios de la comunidad Unisabana</p>
          <form className="explore-search" onSubmit={handleSearch}>
            <div className="search-bar">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input type="text" className="search-input" placeholder="Buscar productos..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <button type="submit" className="btn-search">Buscar</button>
          </form>
        </div>
      </div>

      <div className="explore-body">
        <div className="explore-toolbar">
          <div className="toolbar-left">
            <span className="results-count">{results.meta ? `${results.meta.total_results} producto${results.meta.total_results !== 1 ? 's' : ''}` : ''}</span>
            {q && <span className="results-query">para &ldquo;{q}&rdquo;</span>}
          </div>
          <div className="toolbar-right">
            {hasFilters && <button className="btn-clear-filters" onClick={clearFilters}>Limpiar filtros ({activeCount})</button>}
            <button className={`btn-toggle-filters ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
              Filtros
            </button>
          </div>
        </div>

        <div className={`explore-layout ${showFilters ? 'filters-open' : ''}`}>
          {showFilters && (
            <aside className="filters-panel">
              <h3>Filtros</h3>
              <div className="filter-group">
                <label className="filter-label">Categoría</label>
                <select className="filter-select" value={category} onChange={(e) => updateParam('category', e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Estado</label>
                <select className="filter-select" value={condition} onChange={(e) => updateParam('condition', e.target.value)}>
                  <option value="">Todos los estados</option>
                  {CONDITIONS.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Precio mínimo</label>
                <input type="number" className="filter-input" placeholder="$ 0" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} min={0} />
              </div>
              <div className="filter-group">
                <label className="filter-label">Precio máximo</label>
                <input type="number" className="filter-input" placeholder="$ 999,999" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} min={0} />
              </div>
            </aside>
          )}

          <main className="explore-results">
            {loading ? (
              <div className="results-loading"><div className="spinner-sm" /><p>Buscando...</p></div>
            ) : results.data.length === 0 ? (
              <div className="results-empty">
                <span className="empty-icon">🔍</span>
                <h3>No encontramos resultados</h3>
                <p>Intenta con otros términos o ajusta los filtros</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {results.data.map((product) => (
                    <div key={product.id} className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
                      <div className="product-card-image">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.title} />
                        ) : (
                          <div className="product-placeholder">{CATEGORY_ICONS[product.category] || '📦'}</div>
                        )}
                        <button
                          className={`card-favorite-btn ${favorites.has(product.id) ? 'active' : ''}`}
                          onClick={(e) => toggleFavorite(e, product.id)}
                        >
                          {favorites.has(product.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <div className="product-card-body">
                        <span className="product-category-tag">{CATEGORIES.find((c) => c.id === product.category)?.name || product.category}</span>
                        <h3 className="product-title">{product.title}</h3>
                        <div className="product-price">${product.price.toLocaleString('es-CO')}</div>
                        <div className="product-meta">
                          <span className="product-condition">{CONDITION_LABELS[product.condition] || product.condition}</span>
                        </div>
                        <div className="product-seller">
                          <span className="seller-name">{product.seller.name}</span>
                          <span className="seller-reputation">
                            {'★'.repeat(Math.round(product.seller.reputation))}
                            <span className="reputation-score">{product.seller.reputation.toFixed(1)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {results.meta && results.meta.total_pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: results.meta.total_pages }, (_, i) => (
                      <button key={i} className={`page-btn ${results.meta.current_page === i + 1 ? 'active' : ''}`}
                        onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', String(i + 1)); setSearchParams(n); }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
