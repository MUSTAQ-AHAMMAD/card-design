export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'

/** Standard backend response envelope */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface TemplateDesignData {
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  logoUrl?: string
  backgroundImage?: string
  borderRadius: string
  pattern?: string
}

export interface Template {
  id: string
  name: string
  category: string
  designData: TemplateDesignData
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
  createdBy?: User
}

export type GiftCardStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'REDEEMED' | 'EXPIRED'

export interface GiftCard {
  id: string
  code: string
  amount: number
  occasion: string
  personalMessage?: string
  status: GiftCardStatus
  recipientEmail?: string
  recipientName?: string
  scheduledFor?: string
  sentAt?: string
  redeemedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  template?: Template
  sender?: User
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailLog {
  id: string
  to: string
  subject: string
  status: 'SENT' | 'FAILED' | 'PENDING'
  sentAt?: string
  error?: string
  createdAt: string
}

export interface DashboardStats {
  totalGiftCards: number
  sentThisMonth: number
  totalTemplates: number
  activeUsers: number
  recentActivity: ActivityItem[]
  monthlyStats: MonthlyStat[]
  upcomingOccasions: UpcomingOccasion[]
}

export interface ActivityItem {
  id: string
  type: 'GIFT_CARD_SENT' | 'TEMPLATE_CREATED' | 'USER_REGISTERED' | 'GIFT_CARD_REDEEMED'
  description: string
  user?: string
  timestamp: string
}

export interface MonthlyStat {
  month: string
  sent: number
  redeemed: number
}

export interface UpcomingOccasion {
  id: string
  name: string
  date: string
  type: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
