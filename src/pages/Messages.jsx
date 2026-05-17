import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { messagesApi } from '../services/api'
import './Messages.css'

export default function Messages() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = () => {
    setLoading(true)
    messagesApi.getMessages()
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMessages() }, [])

  const handleMarkRead = async (id) => {
    try {
      await messagesApi.markAsRead(id)
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
    } catch {}
  }

  const unread = messages.filter((m) => !m.read)
  const read_ = messages.filter((m) => m.read)

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Mensajes</h1>
        {unread.length > 0 && <span className="unread-badge">{unread.length} sin leer</span>}
      </div>

      {loading ? (
        <div className="messages-loading"><div className="spinner-sm" /></div>
      ) : messages.length === 0 ? (
        <div className="messages-empty">
          <span className="empty-icon">💬</span>
          <h2>No tienes mensajes</h2>
          <p>Cuando alguien te contacte por un producto, aparecerá aquí</p>
        </div>
      ) : (
        <div className="messages-list">
          {unread.map((m) => (
            <div key={m.id} className="message-card unread" onClick={() => handleMarkRead(m.id)}>
              <div className="message-indicator" />
              <div className="message-body">
                <div className="message-header-row">
                  <span className="message-from">{m.from_name}</span>
                  <span className="message-date">{new Date(m.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="message-text">{m.message}</p>
                {m.product_title && (
                  <span className="message-product">Sobre producto: {m.product_title}</span>
                )}
              </div>
            </div>
          ))}
          {read_.map((m) => (
            <div key={m.id} className="message-card">
              <div className="message-body">
                <div className="message-header-row">
                  <span className="message-from">{m.from_name}</span>
                  <span className="message-date">{new Date(m.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="message-text">{m.message}</p>
                {m.product_title && (
                  <span className="message-product">Sobre producto: {m.product_title}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
