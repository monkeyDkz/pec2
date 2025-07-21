import { defineStore } from 'pinia'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('auth_token') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isVerified: (state) => state.user?.is_verified || false
  },

  actions: {
    async register(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.register(userData)
        
        if (response.success) {
          // Ne pas connecter automatiquement, attendre la vérification email
          return response
        } else {
          throw new Error(response.message || 'Erreur lors de l\'inscription')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.login(credentials)
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.token
          
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('auth_token', response.data.token)
          
          return response
        } else {
          throw new Error(response.message || 'Erreur lors de la connexion')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async verifyEmail(token) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.verifyEmail(token)
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.token
          
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('auth_token', response.data.token)
          
          return response
        } else {
          throw new Error(response.message || 'Erreur lors de la vérification')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async resendVerification(email) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.resendVerification(email)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('merchant_credentials')
    },

    clearError() {
      this.error = null
    }
  }
})
