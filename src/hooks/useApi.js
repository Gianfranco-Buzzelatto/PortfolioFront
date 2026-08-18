import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/me')) {
      localStorage.removeItem('portfolio_token')
      localStorage.removeItem('portfolio_user')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
