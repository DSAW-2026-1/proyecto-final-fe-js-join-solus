import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES } from '../data/categories'
import './Landing.css'

const CATEGORY_ICONS = {
  libros: '📚', tecnologia: '💻', comidas: '🍔', ropa: '👕',
  deportes: '⚽', musica: '🎵', muebles: '🪑', servicios: '🔧',
  arte: '🎨', juegos: '🎲', salud: '💄', otros: '📦',
}

const STEPS = [
  { icon: '🔍', title: 'Explora', desc: 'Navega por productos y servicios de la comunidad Unisabana' },
  { icon: '💬', title: 'Contacta', desc: 'Habla directamente con el vendedor y resuelve tus dudas' },
  { icon: '🛒', title: 'Compra', desc: 'Coordina la entrega y disfruta tu producto' },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-logo">S</div>
          <h1>Marketplace Sabana</h1>
          <p className="hero-subtitle">
            El marketplace exclusivo para la comunidad de la <strong>Universidad de La Sabana</strong>
          </p>
          <p className="hero-desc">
            Compra y vende productos entre estudiantes, docentes y personal administrativo de forma segura y confiable.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-hero" onClick={() => navigate('/explore')}>
              Explorar productos
            </button>
            {!isAuthenticated && (
              <button className="btn-secondary btn-hero" onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="landing-categories">
        <h2>Categorías</h2>
        <p className="section-desc">Encuentra lo que necesitas por categoría</p>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/explore?category=${cat.id}`)}
            >
              <span className="category-icon">{CATEGORY_ICONS[cat.id] || '📦'}</span>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="landing-how">
        <h2>Cómo funciona</h2>
        <p className="section-desc">En tres pasos simples</p>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{i + 1}</div>
              <span className="step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-card">
          <h2>¿Eres miembro de la comunidad?</h2>
          <p>
            Si tienes correo <strong>@unisabana.edu.co</strong>, puedes publicar productos y llegar a cientos de estudiantes.
          </p>
          <button className="btn-primary btn-hero" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
            {isAuthenticated ? 'Ir a mi perfil' : 'Comenzar ahora'}
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-logo">
          <span className="footer-icon">S</span>
          <span>Marketplace Sabana</span>
        </div>
        <p className="footer-text">
          Universidad de La Sabana · Campus del Puente del Común · Chía, Colombia
        </p>
        <p className="footer-copy">© {new Date().getFullYear()} Marketplace Sabana. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
