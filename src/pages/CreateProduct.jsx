import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsApi, uploadApi } from '../services/api'
import { CATEGORIES, CONDITIONS } from '../data/categories'
import './CreateProduct.css'

export default function CreateProduct() {
  const { id: editId } = useParams()
  const { user, isSeller } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loadingProduct, setLoadingProduct] = useState(!!editId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [imagePreviews, setImagePreviews] = useState([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'nuevo',
    stock: 1,
  })

  const isEditing = !!editId

  useEffect(() => {
    if (!editId) return
    productsApi.getProductById(editId)
      .then((res) => {
        const p = res.data?.product || res.data
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price || '',
          category: p.category || '',
          condition: p.condition || 'nuevo',
          stock: p.stock || 1,
        })
        setImagePreviews(p.images || [])
      })
      .catch(() => navigate('/products/my', { replace: true }))
      .finally(() => setLoadingProduct(false))
  }, [editId])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files || [])
    const previews = files.map((f) => URL.createObjectURL(f))
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 6))
  }

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const isValid =
    form.title.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    form.price > 0 &&
    form.category &&
    form.stock > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    setSaving(true)
    setError(null)

    try {
      const base64Images = imagePreviews.filter((img) => img.startsWith('data:'))
      let uploadedUrls = imagePreviews.filter((img) => !img.startsWith('data:'))

      if (base64Images.length > 0) {
        const uploadRes = await uploadApi.uploadImages(base64Images)
        uploadedUrls = [...uploadedUrls, ...uploadRes.data.urls]
      }

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: uploadedUrls,
      }

      if (isEditing) {
        await productsApi.updateProduct(editId, payload)
        navigate('/products/my', { replace: true })
      } else {
        const res = await productsApi.createProduct(payload)
        setSuccess({ message: res.message, productId: res.data.product_id })
        setForm({ title: '', description: '', price: '', category: '', condition: 'nuevo', stock: 1 })
        setImagePreviews([])
      }
    } catch (err) {
      setError(err.message || 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  if (!isSeller) {
    return <Navigate to="/dashboard" replace />
  }

  if (loadingProduct) {
    return <div className="create-product-page"><div className="create-product-container"><div className="my-products-loading"><div className="spinner-sm" /></div></div></div>
  }

  return (
    <div className="create-product-page">
      <div className="create-product-container">
        <div className="create-header">
          <button className="btn-back" onClick={() => navigate('/products/my')}>
            &larr; Volver a mis productos
          </button>
          <h1>{isEditing ? 'Editar producto' : 'Publicar producto'}</h1>
          <p className="create-subtitle">
            {isEditing
              ? 'Actualiza los detalles de tu producto'
              : 'Completa los detalles de tu producto para publicarlo en el Marketplace'}
          </p>
        </div>

        {error && <div className="form-message error">{error}</div>}

        {success && !isEditing && (
          <div className="success-banner">
            <div className="success-icon">✓</div>
            <div className="success-info">
              <h3>{success.message}</h3>
              <p>ID de producto: {success.productId}</p>
            </div>
            <button className="btn-primary btn-sm" onClick={() => setSuccess(null)}>
              Publicar otro
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Información del producto</h2>

            <div className="form-row">
              <div className="form-group flex-2">
                <label className="field-label" htmlFor="title">Título del producto</label>
                <input
                  id="title"
                  type="text"
                  className="field-input"
                  placeholder="Ej: Hamburguesa Especial"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  maxLength={100}
                />
                <span className="field-hint">{form.title.length}/100</span>
              </div>
              <div className="form-group flex-1">
                <label className="field-label" htmlFor="price">Precio ($)</label>
                <input
                  id="price"
                  type="number"
                  className="field-input"
                  placeholder="Ej: 18000"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="description">Descripción</label>
              <textarea
                id="description"
                className="field-input field-textarea"
                placeholder="Describe tu producto en detalle..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                maxLength={500}
              />
              <span className="field-hint">{form.description.length}/500</span>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="field-label" htmlFor="category">Categoría</label>
                <select
                  id="category"
                  className="field-input field-select"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group flex-1">
                <label className="field-label" htmlFor="condition">Estado</label>
                <select
                  id="condition"
                  className="field-input field-select"
                  value={form.condition}
                  onChange={(e) => update('condition', e.target.value)}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group flex-1">
                <label className="field-label" htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  type="number"
                  className="field-input"
                  value={form.stock}
                  onChange={(e) => update('stock', e.target.value)}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Imágenes</h2>
            <p className="section-desc">Agrega hasta 6 fotos de tu producto (opcional)</p>

            <div className="image-grid">
              {imagePreviews.map((src, i) => (
                <div key={i} className="image-preview-wrapper">
                  <img src={src} alt={`Producto ${i + 1}`} className="image-preview" />
                  <button type="button" className="image-remove" onClick={() => removeImage(i)}>×</button>
                </div>
              ))}
              {imagePreviews.length < 6 && (
                <button
                  type="button"
                  className="image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="upload-icon">+</span>
                  <span className="upload-text">Agregar foto</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/products/my')}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={!isValid || saving}>
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Publicar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
