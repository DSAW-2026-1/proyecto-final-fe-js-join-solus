import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AVATARS } from '../data/unisabana'
import './Dashboard.css'

export default function Dashboard() {
  const { user, isInternal, isSeller, isAdmin, logout, activateSeller } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState(null)
  const [sellerForm, setSellerForm] = useState({
    accept_selling_policies: false,
    store_name: '',
    seller_type: 'estudiante',
  })

  if (!user) return null

  const profile = user.profile
  const seller = user.seller_info

  const handleActivate = async () => {
    if (!sellerForm.accept_selling_policies) return
    setActivating(true)
    setError(null)

    try {
      await activateSeller({
        accept_selling_policies: sellerForm.accept_selling_policies,
        store_name: sellerForm.store_name,
        seller_type: sellerForm.seller_type,
      })
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Error al activar modo vendedor')
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-avatar" style={profile ? { background: (AVATARS.find((a) => a.id === profile.profile_picture)?.bg || '#3b82f6') } : {}}>
            {profile
              ? profile.full_name.charAt(0).toUpperCase()
              : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="welcome-info">
            <h2>{profile ? profile.full_name : '¡Bienvenido!'}</h2>
            <p className="welcome-email">{user.email}</p>
            <p className="welcome-role">
              {isAdmin
                ? 'Administrador del Marketplace'
                : isSeller
                  ? `Vendedor - ${seller.store_name}`
                  : isInternal
                    ? 'Miembro verificad@ de la comunidad Unisabana'
                    : 'Usuario externo - puedes navegar y comprar'}
            </p>
          </div>
        </div>

        <div className="permissions-grid">
          <div className={`perm-card ${user.permissions.can_buy ? 'active' : ''}`}>
            <div className="perm-icon">🛒</div>
            <h3>Comprar</h3>
            <p>{user.permissions.can_buy ? 'Tienes permiso para comprar productos' : 'Sin permiso de compra'}</p>
            {user.permissions.can_buy && <span className="perm-status enabled">Habilitado</span>}
          </div>
          <div className={`perm-card ${isSeller ? 'active' : ''}`}>
            <div className="perm-icon">🏪</div>
            <h3>Vender</h3>
            <p>
              {isSeller
                ? 'Puedes publicar y vender productos'
                : isInternal
                  ? 'Activa tu perfil de vendedor para publicar productos'
                  : 'Solo miembros institucionales pueden vender'}
            </p>
            {isSeller && <span className="perm-status enabled">Habilitado</span>}
            {!isSeller && isInternal && <span className="perm-status disabled">Inactivo</span>}
            {!isInternal && <span className="perm-status disabled">No disponible</span>}
          </div>
        </div>

        {isInternal && !isSeller && (
          <div className="seller-cta-card">
            <div className="seller-cta-icon">🚀</div>
            <div className="seller-cta-info">
              <h3>Conviértete en vendedor</h3>
              <p>Publica productos y llega a toda la comunidad Unisabana.</p>
            </div>
            <button className="btn-activate" onClick={() => setShowModal(true)}>
              Activar
            </button>
          </div>
        )}

        {isSeller && seller && (
          <div className="seller-card">
            <div className="seller-card-header">
              <h3>Mi tienda</h3>
              <span className="badge badge-seller">{seller.reputation.status.replace('_', ' ')}</span>
            </div>
            <div className="seller-store-name">{seller.store_name}</div>
            <div className="seller-reputation">
              <div className="reputation-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`star ${star <= Math.round(seller.reputation.score) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="reputation-text">
                {seller.reputation.score.toFixed(1)} · {seller.reputation.total_reviews} reseñas
              </span>
            </div>
            <div className="seller-permissions">
              {user.permissions.seller_permissions?.map((perm) => (
                <span key={perm} className="perm-tag">{perm.replace(/_/g, ' ')}</span>
              ))}
            </div>
            <div className="seller-actions">
              <button className="btn-publish" onClick={() => navigate('/products/new')}>
                + Publicar producto
              </button>
              <button className="btn-secondary btn-sm" onClick={() => navigate('/products/my')}>
                Mis productos
              </button>
            </div>
          </div>
        )}

        <div className="info-card">
          <h3>Información de la sesión</h3>
          <div className="info-row">
            <span className="info-label">ID de usuario</span>
            <span className="info-value">{user.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Correo</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tipo de cuenta</span>
            <span className="info-value">{isInternal ? 'Interno (unisabana.edu.co)' : 'Externo'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rol</span>
            <span className="info-value">{isAdmin ? 'Administrador' : isSeller ? 'Vendedor' : isInternal ? 'Comprador Institucional' : 'Visitante'}</span>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2>Activar modo vendedor</h2>
            <p className="modal-desc">
              Como miembro de la comunidad Unisabana, puedes activar tu perfil de vendedor y empezar a publicar productos.
            </p>

            {error && <div className="login-error">{error}</div>}

            <div className="modal-field">
              <label className="field-label" htmlFor="store_name">Nombre de la tienda</label>
              <input
                id="store_name"
                type="text"
                className="field-input"
                placeholder="Ej: Hamburguesas de Camilo"
                value={sellerForm.store_name}
                onChange={(e) => setSellerForm((f) => ({ ...f, store_name: e.target.value }))}
              />
            </div>

            <div className="modal-field">
              <label className="field-label" htmlFor="seller_type">Tipo de vendedor</label>
              <select
                id="seller_type"
                className="field-input field-select"
                value={sellerForm.seller_type}
                onChange={(e) => setSellerForm((f) => ({ ...f, seller_type: e.target.value }))}
              >
                <option value="estudiante">Estudiante</option>
                <option value="egresado">Egresado</option>
                <option value="docente">Docente</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <label className="policy-checkbox">
              <input
                type="checkbox"
                checked={sellerForm.accept_selling_policies}
                onChange={(e) => setSellerForm((f) => ({ ...f, accept_selling_policies: e.target.checked }))}
              />
              <span className="policy-checkbox-label">
                Acepto las <a href="#">políticas de venta</a> del Marketplace Sabana y confirmo que los productos que publique cumplen con el Reglamento de TI (TRD) de la Universidad.
              </span>
            </label>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={activating}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleActivate}
                disabled={!sellerForm.accept_selling_policies || !sellerForm.store_name.trim() || activating}
              >
                {activating ? 'Activando...' : 'Activar modo vendedor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
