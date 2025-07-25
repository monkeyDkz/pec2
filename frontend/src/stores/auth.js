// src/stores/auth.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('jwt') || ''
  }),
  actions: {
    async login(payload) {
      try {
        const res = await authService.login(payload)
        const token = res.data.data.token
        localStorage.setItem('jwt', token)
        this.token = token

        // 🔄 Ensuite fetch du profil
        await this.fetchProfile()

        // 🔁 Redirection manuelle selon le rôle
        const role = this.user.role
        if (role === 'admin') {
          window.location.href = '/admin/dashboard'
        } else if (role === 'merchant') {
          window.location.href = '/merchant/dashboard'
        } else {
          window.location.href = '/user/merchant-choice'
        }
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erreur lors de la connexion')
      }
    },
    async register(payload) {
      return await authService.register(payload)
    },
    async fetchProfile() {
      try {
        const res = await authService.getProfile()
        this.user = res.data.data.user
      } catch (err) {
        console.error('⚠️ fetchProfile failed', err.response?.status)
        this.logout()
      }
    },
    logout() {
      this.user = null
      this.token = ''
      localStorage.removeItem('jwt')
      window.location.href = '/login'
    }
  }
})
