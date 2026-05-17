import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, usersApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (idToken, provider) => {
    const res = await authApi.loginWithProvider(idToken, provider)
    const { user: userData, token: newToken } = res.data

    setUser(userData)
    setToken(newToken)
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))

    return userData
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }, [])

  const activateSeller = useCallback(async (sellerData) => {
    const res = await usersApi.activateSeller(sellerData)
    const updatedUser = {
      ...user,
      is_seller: true,
      seller_info: { store_name: sellerData.store_name, seller_type: sellerData.seller_type, ...res.data.reputation ? { reputation: res.data.reputation } : {} },
      role_status: 'VENDEDOR',
      permissions: { ...user.permissions, can_sell: true, seller_permissions: res.data.permissions },
    }
    updateUser(updatedUser)
    return res.data
  }, [user, updateUser])

  const isAuthenticated = !!token
  const isInternal = user?.is_internal ?? false
  const isAdmin = user?.is_admin ?? false
  const needsOnboarding = isAuthenticated && !user?.onboarding_completed
  const isSeller = user?.is_seller ?? false

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isInternal, isAdmin, needsOnboarding, isSeller, login, logout, activateSeller, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
