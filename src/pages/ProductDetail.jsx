import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi, cartApi, reviewsApi, messagesApi, wishlistApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES } from '../data/categories'
import './ProductDetail.css'

const CONDITION_LABELS = {
  nuevo: 'Nuevo', como_nuevo: 'Como nuevo', bueno: 'Buen estado', aceptable: 'Aceptable',
}

const CATEGORY_ICONS = {
  libros: '📚', tecnologia: '💻', comidas: '🍔', ropa: '👕',
  deportes: '⚽', musica: '🎵', muebles: '🪑', servicios: '🔧',
  arte: '🎨', juegos: '🎲', salud: '💄', otros: '📦',
}

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartFeedback, setCartFeedback] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [reviewSuccess, setReviewSuccess] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [contactError, setContactError] = useState(null)
  const [contactSuccess, setContactSuccess] = useState(null)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    if (!id) return
    wishlistApi.check(id).then((res) => setFavorited(res.data.favorited)).catch(() => {})
  }, [id])

  const handleToggleFavorite = async () => {
    try {
      const res = await wishlistApi.toggle(id)
      setFavorited(res.data.added)
    } catch {}
  }

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    productsApi.getProductDetail(id)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    reviewsApi.getProductReviews(id)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
  }, [id, reviewSuccess])

  const handleSubmitReview = async () => {
    if (reviewRating < 1) return
    setSubmittingReview(true)
    setReviewError(null)
    setReviewSuccess(null)
    try {
      await reviewsApi.createReview(id, reviewRating, reviewComment)
      setReviewSuccess('Reseña publicada exitosamente')
      setReviewRating(0)
      setReviewComment('')
      setTimeout(() => setReviewSuccess(null), 3000)
    } catch (err) {
      setReviewError(err.message || 'Error al publicar la reseña')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleSendMessage = async () => {
    if (!contactMessage.trim() || !data?.seller?.id) return
    setSendingMessage(true)
    setContactError(null)
    setContactSuccess(null)
    try {
      await messagesApi.sendMessage(data.seller.id, id, contactMessage)
      setContactSuccess('Mensaje enviado al vendedor')
      setContactMessage('')
      setTimeout(() => { setShowContactModal(false); setContactSuccess(null) }, 2000)
    } catch (err) {
      setContactError(err.message || 'Error al enviar mensaje')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)
    setCartFeedback(null)
    try {
      await cartApi.addItem(id)
      setCartFeedback('added')
      setTimeout(() => setCartFeedback(null), 2500)
    } catch {
      setCartFeedback('error')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <div className="detail-loading"><div className="spinner-sm" /></div>
  }

  if (notFound || !data) {
    return (
      <div className="detail-not-found">
        <span className="not-found-icon">🔍</span>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido eliminado.</p>
        <button className="btn-primary" onClick={() => navigate('/explore')}>Volver al explorador</button>
      </div>
    )
  }

  const { product, seller, related_products } = data
  const images = product.images?.length > 0 ? product.images : [null]

  return (
    <div className="detail-page">
      <div className="detail-container">
        <button className="detail-back" onClick={() => navigate(-1)}>&larr; Volver</button>

        <div className="detail-main">
          <div className="detail-gallery">
            <div className="detail-main-image">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.title} />
              ) : (
                <div className="detail-image-placeholder">{CATEGORY_ICONS[product.category] || '📦'}</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="detail-thumbnails">
                {images.map((img, i) => (
                  <button key={i} className={`thumb-btn ${i === selectedImage ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                    {img ? <img src={img} alt={`Vista ${i + 1}`} /> : <span>{CATEGORY_ICONS[product.category] || '📦'}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="detail-category">{CATEGORIES.find((c) => c.id === product.category)?.name || product.category}</span>
            <div className="detail-title-row">
              <h1 className="detail-title">{product.title}</h1>
              <button
                className={`favorite-btn ${favorited ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {favorited ? '❤️' : '🤍'}
              </button>
            </div>
            <div className="detail-price">${product.price.toLocaleString('es-CO')}</div>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Estado</span>
                <span className="meta-value">{CONDITION_LABELS[product.condition] || product.condition}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Stock</span>
                <span className="meta-value">{product.stock} disponible{product.stock !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="detail-description">
              <h3>Descripción</h3>
              <p>{product.description}</p>
            </div>

            <div className="detail-actions">
              <button className="btn-add-cart" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? 'Agregando...' : cartFeedback === 'added' ? '✓ Agregado' : 'Agregar al carrito'}
              </button>
              <button className="btn-buy" onClick={() => navigate('/cart')}>
                Comprar ahora
              </button>
              <button className="btn-contact" onClick={() => setShowContactModal(true)}>
                Contactar vendedor
              </button>
            </div>
            {cartFeedback === 'added' && (
              <div className="cart-feedback">Producto agregado al carrito</div>
            )}
            {cartFeedback === 'error' && (
              <div className="cart-feedback error">Error al agregar al carrito</div>
            )}
          </div>
        </div>

        <div className="detail-seller-section">
          <h2>Información del vendedor</h2>
          <div className="seller-detail-card">
            <div className="seller-detail-avatar">{seller.name.charAt(0).toUpperCase()}</div>
            <div className="seller-detail-info">
              <h3>{seller.name}</h3>
              <p className="seller-detail-career">{seller.career} · {seller.faculty}</p>
              <div className="seller-detail-reputation">
                <span className="reputation-stars-display">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`star ${s <= Math.round(seller.reputation_score) ? 'filled' : ''}`}>★</span>
                  ))}
                </span>
                <span className="reputation-text-detail">{seller.reputation_score.toFixed(1)} ({seller.total_reviews} reseñas)</span>
              </div>
              {seller.is_verified_student && <span className="verified-badge">✓ Verificado - Comunidad Unisabana</span>}
            </div>
          </div>
        </div>

        <div className="detail-reviews-section">
          <h2>Reseñas ({reviews.length})</h2>

          {user && data?.seller?.id !== user?.id && (
            <div className="review-form-card">
              <h3>Deja tu reseña</h3>
              {reviewError && <div className="form-message error">{reviewError}</div>}
              {reviewSuccess && <div className="form-message success">{reviewSuccess}</div>}
              <div className="star-rating-input">
                <span className="star-label">Calificación:</span>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`star-btn ${s <= reviewRating ? 'filled' : ''}`}
                      onClick={() => setReviewRating(s)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="review-textarea"
                placeholder="Cuenta tu experiencia con este producto (opcional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                maxLength={300}
              />
              <button
                className="btn-primary btn-sm"
                onClick={handleSubmitReview}
                disabled={reviewRating < 1 || submittingReview}
              >
                {submittingReview ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="no-reviews">Este producto aún no tiene reseñas. ¡Sé el primero en opinar!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((r) => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar">{r.user_name.charAt(0).toUpperCase()}</div>
                    <div className="review-user">
                      <span className="review-name">{r.user_name}</span>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`star ${s <= r.rating ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(r.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {related_products?.length > 0 && (
          <div className="detail-related">
            <h2>Productos relacionados</h2>
            <div className="related-grid">
              {related_products.map((rp) => (
                <div key={rp.id} className="related-card" onClick={() => { setSelectedImage(0); navigate(`/products/${rp.id}`); }}>
                  <div className="related-image">
                    {rp.thumbnail ? <img src={rp.thumbnail} alt={rp.title} /> : <span>{CATEGORY_ICONS[product.category] || '📦'}</span>}
                  </div>
                  <div className="related-body">
                    <h4>{rp.title}</h4>
                    <span className="related-price">${rp.price.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowContactModal(false)}>×</button>
            <h2>Contactar vendedor</h2>
            <p className="modal-desc">
              Envía un mensaje a <strong>{data?.seller?.name}</strong> sobre este producto.
            </p>

            {contactError && <div className="form-message error">{contactError}</div>}
            {contactSuccess && <div className="form-message success">{contactSuccess}</div>}

            <div className="modal-field">
              <label className="field-label">Producto</label>
              <div className="field-readonly">{data?.product?.title}</div>
            </div>
            <div className="modal-field">
              <label className="field-label" htmlFor="contactMsg">Mensaje</label>
              <textarea
                id="contactMsg"
                className="field-input field-textarea"
                placeholder="Ej: Hola, me interesa tu producto. ¿Aún está disponible?"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowContactModal(false)} disabled={sendingMessage}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleSendMessage}
                disabled={!contactMessage.trim() || sendingMessage}
              >
                {sendingMessage ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
