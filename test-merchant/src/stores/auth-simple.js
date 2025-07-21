// Ce store est simplifié pour le test merchant
// Pas besoin d'authentification utilisateur complexe

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Store minimal - le test merchant n'a pas besoin d'auth utilisateur
  }),
  
  getters: {
    isAuthenticated: () => true // Toujours "connecté" pour simplifier
  },
  
  actions: {
    // Pas d'actions d'auth nécessaires
  }
})
