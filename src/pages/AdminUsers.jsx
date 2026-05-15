import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  INSTITUTIONAL_BUYER: 'Comprador Institucional',
  VISITOR: 'Visitante',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = () => {
    setLoading(true)
    adminApi.getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleAdmin = async (user) => {
    const action = user.is_admin ? 'remover' : 'otorgar'
    if (!window.confirm(`¿Estás seguro de ${action} permisos de administrador a ${user.email}?`)) return
    try {
      await adminApi.updateUser(user.id, { is_admin: !user.is_admin })
      fetchUsers()
    } catch (err) { console.error('Error al cambiar rol de admin:', err) }
  }

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Usuarios ({users.length})</h2>
        <input
          type="text"
          className="admin-search"
          placeholder="Buscar por email o nombre..."
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
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Tipo</th>
                <th>Vendedor</th>
                <th>Admin</th>
                <th>Onboarding</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="cell-email">{u.email}</td>
                  <td>{u.profile?.full_name || '—'}</td>
                  <td><span className={`badge-role badge-${u.role_status?.toLowerCase()}`}>{ROLE_LABELS[u.role_status] || u.role_status}</span></td>
                  <td>{u.is_internal ? <span className="badge-internal-sm">Interno</span> : <span className="badge-external-sm">Externo</span>}</td>
                  <td>{u.is_seller ? <span className="badge-yes">Sí</span> : <span className="badge-no">No</span>}</td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={!!u.is_admin} onChange={() => toggleAdmin(u)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>{u.onboarding_completed ? <span className="badge-yes">Completo</span> : <span className="badge-no">Pendiente</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="admin-empty">No se encontraron usuarios</div>}
        </div>
      )}
    </div>
  )
}
