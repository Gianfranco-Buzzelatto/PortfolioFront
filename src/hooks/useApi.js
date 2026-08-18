import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function shouldRetry(error) {
  const status = error.response?.status
  const code = error.code
  if (status === 401 || status === 403 || status === 400 || status === 404) return false
  if ([502, 503, 504].includes(status)) return true
  if (['ECONNABORTED', 'ERR_NETWORK', 'ETIMEDOUT', 'ECONNRESET'].includes(code)) return true
  return !error.response
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const status = error.response?.status
    const url = config?.url || ''

    if (config && shouldRetry(error)) {
      config.__retryCount = config.__retryCount || 0
      if (config.__retryCount < 2) {
        config.__retryCount += 1
        await sleep(2000 * config.__retryCount)
        return api(config)
      }
    }

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
