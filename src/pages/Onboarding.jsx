import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usersApi } from '../services/api'
import { FACULTIES, CAREERS_BY_FACULTY, AVATARS } from '../data/unisabana'
import './Onboarding.css'

export default function Onboarding() {
  const { user, isInternal, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    full_name: '',
    profile_picture: AVATARS[0].id,
    is_student: isInternal,
    faculty: '',
    career: '',
    bio: '',
  })

  const totalSteps = isInternal ? 3 : 2

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const careers = form.faculty ? CAREERS_BY_FACULTY[form.faculty] || [] : []

  const isValidStep1 = form.full_name.trim().length >= 3
  const isValidStep2 = !isInternal || (form.faculty && form.career)
  const canContinue = step === 1 ? isValidStep1 : step === 2 ? isValidStep2 : true

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        full_name: form.full_name,
        profile_picture: form.profile_picture,
        bio: form.bio,
        academic_info: form.is_student ? { is_student: true, career: form.career, faculty: form.faculty } : null,
      }

      const res = await usersApi.completeOnboarding(payload)

      const updatedUser = {
        ...user,
        onboarding_completed: true,
        profile: {
          full_name: form.full_name,
          profile_picture: form.profile_picture,
          bio: form.bio,
          academic_info: form.is_student ? { is_student: true, career: form.career, faculty: form.faculty } : null,
        },
        role_status: res.data.role_status,
        can_list_products: res.data.can_list_products,
      }

      updateUser(updatedUser)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const selectedAvatar = AVATARS.find((a) => a.id === form.profile_picture) || AVATARS[0]
  const initials = form.full_name
    ? form.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <button className="btn-back" onClick={() => logout()}>
            &larr; Salir
          </button>
          <h1>Completa tu perfil</h1>
          <p className="onboarding-subtitle">
            Cuéntanos quién eres para empezar a usar el Marketplace
          </p>
        </div>

        <div className="steps-indicator">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`step-dot ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
          ))}
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        {step === 1 && (
          <div className="onboarding-step">
            <h2>Tu identidad</h2>
            <p className="step-desc">¿Cómo quieres que te conozcan en el Marketplace?</p>

            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <div className="field-readonly">{user?.email}</div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="full_name">Nombre completo</label>
              <input
                id="full_name"
                type="text"
                className="field-input"
                placeholder="Ej: Camilo Andres Moncada"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Elige tu avatar</label>
              <div className="avatar-grid">
                {AVATARS.map((a) => (
                  <button
                    key={a.id}
                    className={`avatar-option ${form.profile_picture === a.id ? 'selected' : ''}`}
                    style={{ background: a.bg }}
                    onClick={() => update('profile_picture', a.id)}
                  >
                    <span className="avatar-emoji">{a.emoji}</span>
                  </button>
                ))}
              </div>
              <div className="avatar-preview">
                <div className="preview-avatar" style={{ background: selectedAvatar.bg }}>
                  {initials}
                </div>
                <div className="preview-name">
                  {form.full_name || 'Tu nombre'}
                  <span className="preview-email">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && isInternal && (
          <div className="onboarding-step">
            <h2>Información académica</h2>
            <p className="step-desc">Selecciona tu facultad y carrera para que otros usuarios te reconozcan.</p>

            <div className="field-group">
              <label className="field-label" htmlFor="faculty">Facultad</label>
              <select
                id="faculty"
                className="field-input field-select"
                value={form.faculty}
                onChange={(e) => { update('faculty', e.target.value); update('career', '') }}
              >
                <option value="">Selecciona una facultad</option>
                {FACULTIES.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {form.faculty && (
              <div className="field-group">
                <label className="field-label" htmlFor="career">Carrera</label>
                <select
                  id="career"
                  className="field-input field-select"
                  value={form.career}
                  onChange={(e) => update('career', e.target.value)}
                >
                  <option value="">Selecciona una carrera</option>
                  {careers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 2 && !isInternal && (
          <div className="onboarding-step">
            <h2>Casi listo</h2>
            <p className="step-desc">
              Como usuario externo, podrás navegar y comprar productos.
              Si eres parte de la Universidad, inicia sesión con tu correo @unisabana.edu.co.
            </p>
            <div className="info-box">
              <span className="info-box-icon">💡</span>
              <p>Los vendedores en Marketplace Sabana son siempre miembros verificados de la comunidad Unisabana.</p>
            </div>
          </div>
        )}

        {step === 3 && isInternal && (
          <div className="onboarding-step">
            <h2>Cuéntanos de ti</h2>
            <p className="step-desc">Agrega una breve descripción para que los compradores te conozcan.</p>

            <div className="field-group">
              <label className="field-label" htmlFor="bio">Biografía</label>
              <textarea
                id="bio"
                className="field-input field-textarea"
                placeholder="Ej: Busco libros de cálculo y componentes de electrónica."
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                rows={4}
                maxLength={200}
              />
              <span className="field-hint">{form.bio.length}/200 caracteres</span>
            </div>

            <div className="summary-card">
              <h3>Resumen de tu perfil</h3>
              <div className="summary-row">
                <span className="summary-label">Nombre</span>
                <span className="summary-value">{form.full_name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Facultad</span>
                <span className="summary-value">{FACULTIES.find((f) => f.id === form.faculty)?.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Carrera</span>
                <span className="summary-value">{form.career}</span>
              </div>
              {form.bio && (
                <div className="summary-row">
                  <span className="summary-label">Bio</span>
                  <span className="summary-value">{form.bio}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(step - 1)} disabled={saving}>
              Atrás
            </button>
          )}
          {step < totalSteps ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!canContinue}>
              Continuar
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : 'Completar perfil'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
