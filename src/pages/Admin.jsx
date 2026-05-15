import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminApi } from '../services/api'
import AdminUsers from './AdminUsers'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import './Admin.css'

const TABS = [
  { id: 'overview', label: 'Panel General', icon: '📊' },
  { id: 'users', label: 'Usuarios', icon: '👥' },
  { id: 'products', label: 'Productos', icon: '📦' },
  { id: 'orders', label: 'Órdenes', icon: '📋' },
]

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <span className="admin-stat-value">{value}</span>
        <span className="admin-stat-label">{label}</span>
        {sub && <span className="admin-stat-sub">{sub}</span>}
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const location = useLocation()
  const hash = location.hash.replace('#', '')
  const activeTab = TABS.find((t) => t.id === hash)?.id || 'overview'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const setTab = (id) => navigate(`/admin#${id}`, { replace: true })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Panel de Administración</h1>
          <p>Gestiona los usuarios, productos y órdenes del Marketplace</p>
        </div>
        <div className="admin-header-badge">ADMIN</div>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="admin-overview">
          {loading ? (
            <div className="admin-loading"><div className="spinner-sm" /></div>
          ) : stats ? (
            <>
              <div className="admin-stats-grid">
                <StatCard icon="👥" label="Usuarios totales" value={stats.total_users} sub={`${stats.internal_users} internos · ${stats.external_users} externos`} />
                <StatCard icon="🏪" label="Vendedores" value={stats.sellers} />
                <StatCard icon="📦" label="Productos" value={stats.total_products} sub={`${stats.active_products} activos · ${stats.inactive_products} inactivos`} />
                <StatCard icon="📋" label="Órdenes totales" value={stats.total_orders} />
              </div>
              <div className="admin-quick-links">
                <h3>Acceso rápido</h3>
                <div className="quick-links-grid">
                  <button className="quick-link" onClick={() => setTab('users')}>
                    <span className="ql-icon">👥</span>
                    <span className="ql-title">Usuarios</span>
                    <span className="ql-desc">Ver y gestionar usuarios registrados</span>
                  </button>
                  <button className="quick-link" onClick={() => setTab('products')}>
                    <span className="ql-icon">📦</span>
                    <span className="ql-title">Productos</span>
                    <span className="ql-desc">Administrar catálogo de productos</span>
                  </button>
                  <button className="quick-link" onClick={() => setTab('orders')}>
                    <span className="ql-icon">📋</span>
                    <span className="ql-title">Órdenes</span>
                    <span className="ql-desc">Ver todas las órdenes de compra</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-empty">Error al cargar estadísticas</div>
          )}
        </div>
      )}

      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'orders' && <AdminOrders />}
    </div>
  )
}
