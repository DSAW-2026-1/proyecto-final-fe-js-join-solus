import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '../services/api'
import './Notifications.css'

const TYPE_ICONS = {
  message: '💬',
  order: '🛒',
  review: '⭐',
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = () => {
    setLoading(true)
    notificationsApi.getNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifs() }, [])

  const handleClick = async (n) => {
    if (!n.read) {
      try {
        await notificationsApi.markAsRead(n.id)
        setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
      } catch {}
    }
    if (n.link) navigate(n.link)
  }

  const unread = notifications.filter((n) => !n.read)

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notificaciones</h1>
        {unread.length > 0 && <span className="unread-badge">{unread.length} sin leer</span>}
      </div>

      {loading ? (
        <div className="notifications-loading"><div className="spinner-sm" /></div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <span className="empty-icon">🔔</span>
          <h2>No hay notificaciones</h2>
          <p>Cuando recibas mensajes, órdenes o reseñas, aparecerán aquí</p>
        </div>
      ) : (
        <div className="notifications-list">
          {unread.map((n) => (
            <div key={n.id} className="notif-card unread" onClick={() => handleClick(n)}>
              <div className="notif-indicator" />
              <span className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="notif-body">
                <div className="notif-header-row">
                  <span className="notif-title">{n.title}</span>
                  <span className="notif-date">{new Date(n.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="notif-message">{n.message}</p>
              </div>
            </div>
          ))}
          {notifications.filter((n) => n.read).map((n) => (
            <div key={n.id} className="notif-card" onClick={() => handleClick(n)}>
              <span className="notif-icon dim">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="notif-body">
                <div className="notif-header-row">
                  <span className="notif-title">{n.title}</span>
                  <span className="notif-date">{new Date(n.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="notif-message">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
