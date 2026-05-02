/**
 * COMPREHENSIVE TYPE DEFINITIONS
 * Enterprise-grade TypeScript types for the Gift Card Management System
 */

// ============================================
// COMMON TYPES
// ============================================

export type UUID = string;
export type ISO8601DateTime = string;
export type JSONString = string;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ============================================
// USER TYPES
// ============================================

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER'
}

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  avatar?: string | null;
  isActive: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  deletedAt?: ISO8601DateTime | null;
}

export interface UserWithRoles extends User {
  roles: Role[];
  permissions: Permission[];
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole | string;
  avatar?: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole | string;
  avatar?: string;
  isActive?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface JWTPayload {
  userId: UUID;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ============================================
// BRAND TYPES
// ============================================

export enum BrandAssetType {
  LOGO = 'logo',
  ICON = 'icon',
  BANNER = 'banner',
  IMAGE = 'image',
  FONT = 'font'
}

export interface Brand {
  id: UUID;
  name: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  description?: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  deletedAt?: ISO8601DateTime | null;
}

export interface BrandWithAssets extends Brand {
  assets: BrandAsset[];
  templateCount?: number;
}

export interface CreateBrandDTO {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  website?: string;
}

export interface UpdateBrandDTO {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export interface BrandAsset {
  id: UUID;
  brandId: UUID;
  name: string;
  assetType: BrandAssetType | string;
  fileUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  metadata?: JSONString | null;
  isActive: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  deletedAt?: ISO8601DateTime | null;
}

export interface CreateBrandAssetDTO {
  brandId: UUID;
  name: string;
  assetType: BrandAssetType | string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface Template {
  id: UUID;
  name: string;
  category: string;
  designData: JSONString;
  thumbnail?: string | null;
  usageCount: number;
  isActive: boolean;
  createdById: UUID;
  brandId?: UUID | null;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  deletedAt?: ISO8601DateTime | null;
}

export interface TemplateWithRelations extends Template {
  createdBy: User;
  brand?: Brand | null;
  versions?: TemplateVersion[];
}

export interface CreateTemplateDTO {
  name: string;
  category: string;
  designData: Record<string, any> | JSONString;
  thumbnail?: string;
  brandId?: UUID;
}

export interface UpdateTemplateDTO {
  name?: string;
  category?: string;
  designData?: Record<string, any> | JSONString;
  thumbnail?: string;
  brandId?: UUID;
  isActive?: boolean;
}

export interface TemplateVersion {
  id: UUID;
  templateId: UUID;
  version: number;
  designData: JSONString;
  thumbnail?: string | null;
  changelog?: string | null;
  createdById: UUID;
  createdAt: ISO8601DateTime;
}

export interface CreateTemplateVersionDTO {
  templateId: UUID;
  designData: Record<string, any> | JSONString;
  thumbnail?: string;
  changelog?: string;
}

// ============================================
// GIFT CARD TYPES
// ============================================

export enum GiftCardStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export interface GiftCard {
  id: UUID;
  templateId?: UUID | null;
  employeeId: UUID;
  customizations: JSONString;
  amount: number;
  occasion: string;
  message?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  status: GiftCardStatus | string;
  sentAt?: ISO8601DateTime | null;
  scheduledAt?: ISO8601DateTime | null;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  deletedAt?: ISO8601DateTime | null;
}

export interface GiftCardWithRelations extends GiftCard {
  template?: Template | null;
  employee: User;
  emailLogs?: EmailLog[];
}

export interface CreateGiftCardDTO {
  templateId?: UUID;
  customizations: Record<string, any> | JSONString;
  amount: number;
  occasion: string;
  message?: string;
  recipientEmail?: string;
  recipientName?: string;
  scheduledAt?: ISO8601DateTime;
}

export interface UpdateGiftCardDTO {
  templateId?: UUID;
  customizations?: Record<string, any> | JSONString;
  amount?: number;
  occasion?: string;
  message?: string;
  recipientEmail?: string;
  recipientName?: string;
  status?: GiftCardStatus | string;
  scheduledAt?: ISO8601DateTime;
}

// ============================================
// EMAIL TYPES
// ============================================

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED'
}

export interface EmailLog {
  id: UUID;
  giftCardId?: UUID | null;
  userId?: UUID | null;
  recipient: string;
  subject: string;
  status: EmailStatus | string;
  error?: string | null;
  sentAt?: ISO8601DateTime | null;
  createdAt: ISO8601DateTime;
}

export interface EmailTemplate {
  id: UUID;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  deletedAt?: ISO8601DateTime | null;
}

export interface SendEmailDTO {
  recipient: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

// ============================================
// EMPLOYEE CACHE TYPES (Outlook Sync)
// ============================================

export interface EmployeeCache {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  officeLocation?: string | null;
  mobilePhone?: string | null;
  businessPhones?: string | null;
  thumbnailPhoto?: string | null;
  metadata?: JSONString | null;
  lastSyncedAt: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface OutlookSyncRequest {
  forceRefresh?: boolean;
}

export interface OutlookUser {
  id: string;
  mail: string;
  givenName: string;
  surname: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

// ============================================
// PERMISSION & ROLE TYPES
// ============================================

export interface Permission {
  id: UUID;
  name: string;
  description?: string | null;
  category: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface Role {
  id: UUID;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissionIds?: UUID[];
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: UUID[];
}

export interface AssignRoleDTO {
  userId: UUID;
  roleId: UUID;
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SEND = 'SEND',
  SCHEDULE = 'SCHEDULE'
}

export enum EntityType {
  USER = 'user',
  TEMPLATE = 'template',
  GIFT_CARD = 'gift-card',
  BRAND = 'brand',
  BRAND_ASSET = 'brand-asset',
  EMAIL = 'email',
  ROLE = 'role',
  PERMISSION = 'permission'
}

export interface ActivityLog {
  id: UUID;
  userId?: UUID | null;
  action: ActivityAction | string;
  entityType: EntityType | string;
  entityId?: UUID | null;
  description?: string | null;
  metadata?: JSONString | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: ISO8601DateTime;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: User | null;
}

export interface CreateActivityLogDTO {
  userId?: UUID;
  action: ActivityAction | string;
  entityType: EntityType | string;
  entityId?: UUID;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// AI TYPES
// ============================================

export interface GrammarCheckRequest {
  text: string;
  language?: string;
}

export interface GrammarCheckResponse {
  originalText: string;
  correctedText: string;
  suggestions: GrammarSuggestion[];
}

export interface GrammarSuggestion {
  offset: number;
  length: number;
  message: string;
  replacements: string[];
  type: 'spelling' | 'grammar' | 'style';
}

export interface ContentSuggestionRequest {
  context: string;
  occasion?: string;
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
}

export interface ContentSuggestionResponse {
  suggestions: string[];
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  totalUsers: number;
  totalTemplates: number;
  totalGiftCards: number;
  totalBrands: number;
  sentGiftCards: number;
  scheduledGiftCards: number;
  activeUsers: number;
  recentActivity: ActivityLog[];
}

export interface UsageStatistics {
  period: 'day' | 'week' | 'month' | 'year';
  data: {
    date: string;
    giftCardsSent: number;
    emailsSent: number;
    templatesCreated: number;
    newUsers: number;
  }[];
}

export interface PopularTemplate {
  template: Template;
  usageCount: number;
}
