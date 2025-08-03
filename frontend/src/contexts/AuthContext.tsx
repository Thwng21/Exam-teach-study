'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiService, getAuthToken, removeAuthToken, setAuthToken } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'teacher' | 'student' | 'admin'
  studentId?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const userData = await apiService.getProfile() as { success: boolean, data: { user: User } }
          if (userData.success && userData.data) {
            setUser(userData.data.user)
          } else {
            removeAuthToken()
          }
        } catch (error) {
          console.error('Failed to get user profile:', error)
          removeAuthToken()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password) as { success: boolean, data: { token: string, user: User } }
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    removeAuthToken()
    setUser(null)
  }

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData) as { success: boolean, data: { token: string, user: User } }
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      throw error
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
