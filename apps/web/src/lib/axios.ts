import axios from 'axios'

const BASE_URL = 'http://localhost:3333/api/v1'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// ── Request interceptor — attach Bearer token if available ────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('transit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle 401 globally ────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('transit_token')
      localStorage.removeItem('transit_user')
      window.dispatchEvent(new Event('auth-changed'))
    }
    return Promise.reject(error)
  }
)

/** Generic SWR-compatible fetcher using the Axios instance */
export const axiosFetcher = <T>(url: string): Promise<T> =>
  axiosInstance.get<T>(url).then((res) => res.data)

export default axiosInstance
