import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type {
  User, Template, GiftCard, EmailTemplate, EmailLog,
  DashboardStats, AuthTokens, LoginCredentials, RegisterData,
  PaginatedResponse
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach Bearer token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 with token refresh
let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processPendingQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        processPendingQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processPendingQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/login', data),

  register: (data: RegisterData) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
}

// ── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),

  getProfile: () => api.get<User>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<User>('/users/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/change-password', { currentPassword, newPassword }),

  getById: (id: string) => api.get<User>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
}

// ── Templates ───────────────────────────────────────────────────────────────
export const templatesApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    api.get<PaginatedResponse<Template>>('/templates', { params }),

  getCategories: () => api.get<string[]>('/templates/categories'),

  getById: (id: string) => api.get<Template>(`/templates/${id}`),

  create: (data: Partial<Template>) =>
    api.post<Template>('/templates', data),

  update: (id: string, data: Partial<Template>) =>
    api.put<Template>(`/templates/${id}`, data),

  delete: (id: string) => api.delete(`/templates/${id}`),

  uploadDesignImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post<{ success: boolean; data: { imageUrl: string } }>('/templates/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ── Gift Cards ───────────────────────────────────────────────────────────────
export const giftCardsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<GiftCard>>('/gift-cards', { params }),

  getHistory: () => api.get<GiftCard[]>('/gift-cards/history'),

  getById: (id: string) => api.get<GiftCard>(`/gift-cards/${id}`),

  create: (data: Partial<GiftCard> & { templateId?: string }) =>
    api.post<GiftCard>('/gift-cards', data),

  update: (id: string, data: Partial<GiftCard>) =>
    api.put<GiftCard>(`/gift-cards/${id}`, data),

  delete: (id: string) => api.delete(`/gift-cards/${id}`),

  send: (id: string, recipientEmail: string, scheduledFor?: string) =>
    api.post(`/gift-cards/${id}/send`, { recipientEmail, scheduledFor }),
}

// ── Email ────────────────────────────────────────────────────────────────────
export const emailApi = {
  getTemplates: () => api.get<EmailTemplate[]>('/email/templates'),

  createTemplate: (data: Partial<EmailTemplate>) =>
    api.post<EmailTemplate>('/email/templates', data),

  updateTemplate: (id: string, data: Partial<EmailTemplate>) =>
    api.put<EmailTemplate>(`/email/templates/${id}`, data),

  deleteTemplate: (id: string) => api.delete(`/email/templates/${id}`),

  sendTest: (to: string, subject: string, templateId?: string) =>
    api.post('/email/send-test', { to, subject, templateId }),

  getLogs: () => api.get<EmailLog[]>('/email/logs'),
}

// ── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get<DashboardStats>('/analytics/dashboard'),
  getReports: () => api.get('/analytics/reports'),
}

export default api
