import { createContext, useContext, useState, useEffect } from 'react'
import api from '../hooks/useApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('portfolio_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('portfolio_token')
    if (!storedToken) {
      setLoading(false)
      return
    }

    api.get('/auth/me')
      .then((r) => {
        setUser(r.data.user)
        setToken(storedToken)
        localStorage.setItem('portfolio_user', JSON.stringify(r.data.user))
      })
      .catch(() => {
        localStorage.removeItem('portfolio_token')
        localStorage.removeItem('portfolio_user')
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem('portfolio_token', tokenData)
    localStorage.setItem('portfolio_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('portfolio_token')
    localStorage.removeItem('portfolio_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuth: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
