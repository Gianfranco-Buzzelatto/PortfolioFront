import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(localStorage.getItem('portfolio_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('portfolio_user')
    if (stored && token) setUser(JSON.parse(stored))
    setLoading(false)
  }, [token])

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
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
