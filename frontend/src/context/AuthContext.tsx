import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, LoginCredentials, RegisterData } from '../types'
import { authApi, usersApi } from '../services/api'
import toast from 'react-hot-toast'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await usersApi.getProfile()
      setUser(data)
    } catch {
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      refreshProfile().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refreshProfile])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('accessToken', data.tokens.accessToken)
    localStorage.setItem('refreshToken', data.tokens.refreshToken)
    setUser(data.user)
  }, [])

  const register = useCallback(async (registerData: RegisterData) => {
    const { data } = await authApi.register(registerData)
    localStorage.setItem('accessToken', data.tokens.accessToken)
    localStorage.setItem('refreshToken', data.tokens.refreshToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
