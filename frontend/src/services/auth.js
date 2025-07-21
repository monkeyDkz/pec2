import ApiService from './api'
import store from '../stores'

class AuthService {
  constructor() {
    this.api = ApiService
  }

  // Connexion utilisateur
  async login(email, password) {
    try {
      store.dispatch('setLoading', true)
      
      const response = await this.api.post('/auth/login', {
        email,
        password
      })

      // DEBUG: Voir la vraie structure de la réponse
      console.log('🔍 Structure de la réponse complète:', response.data)
      console.log('🔍 response.data:', response.data)

      // La structure est directe: { user, token, expiresIn }
      const { token, user } = response.data

      console.log('✅ Token extrait:', token ? 'Présent' : 'Manquant')
      console.log('✅ User extrait:', user)

      // Stocker les informations d'authentification
      console.log('🔄 Stockage des données auth...')
      this.setAuthData(token, user)
      console.log('✅ Données stockées dans localStorage')
      
      // Mettre à jour le store IMMÉDIATEMENT (de façon synchrone)
      console.log('🔄 Mise à jour synchrone du store...')
      try {
        store.dispatch('login', user)
        console.log('✅ Store mis à jour synchrone')
      } catch (storeError) {
        console.error('❌ Erreur store:', storeError)
      }
      
      const redirectPath = this.getRedirectPath(user.role)
      console.log('🎯 Redirection calculée vers:', redirectPath)
      
      // Vérifier que le store est bien mis à jour
      console.log('🔍 Vérification store - isAuthenticated:', store.getters.isAuthenticated)
      console.log('� Vérification store - userRole:', store.getters.userRole)
      
      // Afficher le message de succès en différé
      setTimeout(() => {
        try {
          store.dispatch('showSuccess', `Bienvenue ${user.first_name} !`)
        } catch (messageError) {
          console.error('❌ Erreur message (non bloquante):', messageError)
        }
      }, 100)
      
      console.log('✅ Login terminé avec succès - retour du résultat')
      return {
        success: true,
        user,
        redirectTo: redirectPath
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion'
      store.dispatch('showError', message)
      
      return {
        success: false,
        message
      }
    } finally {
      store.dispatch('setLoading', false)
    }
  }

  // Inscription utilisateur
  async register(userData) {
    try {
      store.dispatch('setLoading', true)
      
      const response = await this.api.post('/auth/register', userData)
      
      store.dispatch('showSuccess', 'Inscription réussie ! Vérifiez votre email pour activer votre compte.')
      
      return {
        success: true,
        data: response.data.data
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription'
      store.dispatch('showError', message)
      
      return {
        success: false,
        message,
        errors: error.response?.data?.errors
      }
    } finally {
      store.dispatch('setLoading', false)
    }
  }

  // Vérification email
  async verifyEmail(token) {
    try {
      store.dispatch('setLoading', true)
      
      const response = await this.api.post('/auth/verify-email', { token })
      console.log('🔍 Réponse API verify-email:', response.data)
      
      // Les données sont directement dans response.data, pas dans response.data.data
      const { token: authToken, user } = response.data

      // Stocker les informations d'authentification
      this.setAuthData(authToken, user)
      
      // Mettre à jour le store
      await store.dispatch('login', user)
      
      store.dispatch('showSuccess', 'Email vérifié avec succès ! Votre compte est maintenant actif.')
      
      return {
        success: true,
        user,
        redirectTo: this.getRedirectPath(user.role)
      }
      
    } catch (error) {
      console.error('🔍 Erreur détaillée verify-email:', error)
      const message = error.response?.data?.message || 'Erreur lors de la vérification'
      store.dispatch('showError', message)
      
      return {
        success: false,
        message
      }
    } finally {
      store.dispatch('setLoading', false)
    }
  }

  // Renvoyer email de vérification
  async resendVerification(email) {
    try {
      store.dispatch('setLoading', true)
      
      await this.api.post('/auth/resend-verification', { email })
      
      store.dispatch('showSuccess', 'Nouvel email de vérification envoyé avec succès')
      
      return { success: true }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi'
      store.dispatch('showError', message)
      
      return {
        success: false,
        message
      }
    } finally {
      store.dispatch('setLoading', false)
    }
  }

  // Obtenir le profil utilisateur
  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile')
      
      const user = response.data.data.user
      
      // Mettre à jour le store avec les données fraîches
      store.dispatch('login', user)
      
      return {
        success: true,
        user
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la récupération du profil'
      store.dispatch('showError', message)
      
      // Si erreur 401, déconnecter l'utilisateur
      if (error.response?.status === 401) {
        this.logout()
      }
      
      return {
        success: false,
        message
      }
    }
  }

  // Déconnexion
  logout() {
    console.log('🔄 Déconnexion en cours...')
    // Nettoyer les données locales
    this.clearAuthData()
    store.dispatch('logout')
    store.dispatch('showSuccess', 'Déconnexion réussie')
    console.log('✅ Déconnexion terminée')
  }

  // Gestion des données d'authentification
  setAuthData(token, user) {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userType', user.role)
    localStorage.setItem('userEmail', user.email)
    localStorage.setItem('userId', user.id)
    
    // Le token sera automatiquement ajouté par l'intercepteur d'axios
    console.log('✅ Données d\'authentification stockées')
  }

  clearAuthData() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userType')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    localStorage.removeItem('impersonationToken')
    localStorage.removeItem('originalAdminToken')
    
    // Supprimer le header d'autorisation (pas besoin d'appel API, l'intercepteur le gère)
    console.log('🧹 Données d\'authentification supprimées')
  }

  // Getters pour les données d'authentification
  getToken() {
    return localStorage.getItem('authToken')
  }

  getUserType() {
    return localStorage.getItem('userType')
  }

  getUserEmail() {
    return localStorage.getItem('userEmail')
  }

  getUserId() {
    return localStorage.getItem('userId')
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken()
  }

  // Obtenir le chemin de redirection selon le rôle
  getRedirectPath(role) {
    switch (role) {
      case 'admin':
        return '/admin'
      case 'merchant':
        return '/merchant'
      default:
        // Les utilisateurs normaux vont d'abord vers la sélection de marchand
        return '/merchant-selection'
    }
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    const userType = this.getUserType()
    if (Array.isArray(role)) {
      return role.includes(userType)
    }
    return userType === role
  }

  // Initialiser l'authentification au démarrage de l'app
  async initialize() {
    try {
      const token = this.getToken()
      if (!token) return false

      // Configurer le token pour l'API
      this.api.setAuthToken(token)
      
      // Vérifier le profil utilisateur pour valider le token
      const profileResult = await this.getProfile()
      
      return profileResult.success
      
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation de l\'auth:', error.message)
      this.clearAuthData()
      return false
    }
  }

  // Gestion de l'impersonation (pour les admins)
  async startImpersonation(merchantId) {
    try {
      if (!this.hasRole('admin')) {
        throw new Error('Seuls les administrateurs peuvent utiliser l\'impersonation')
      }

      store.dispatch('setLoading', true)
      
      const response = await this.api.post(`/admin/impersonate/${merchantId}`)
      const { token, merchant } = response.data.data
      
      // Sauvegarder le token admin original
      const originalToken = this.getToken()
      localStorage.setItem('originalAdminToken', originalToken)
      localStorage.setItem('impersonationToken', token)
      
      // Utiliser le token d'impersonation
      this.api.setAuthToken(token)
      localStorage.setItem('authToken', token)
      
      // Mettre à jour le store
      store.dispatch('startImpersonation', {
        merchant,
        originalAdmin: store.state.user
      })
      
      store.dispatch('showSuccess', `Impersonation de ${merchant.company_name} activée`)
      
      return {
        success: true,
        merchant
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'impersonation'
      store.dispatch('showError', message)
      
      return {
        success: false,
        message
      }
    } finally {
      store.dispatch('setLoading', false)
    }
  }

  async stopImpersonation() {
    try {
      const originalToken = localStorage.getItem('originalAdminToken')
      if (!originalToken) {
        throw new Error('Aucune session d\'impersonation active')
      }

      // Restaurer le token admin original
      this.api.setAuthToken(originalToken)
      localStorage.setItem('authToken', originalToken)
      localStorage.removeItem('originalAdminToken')
      localStorage.removeItem('impersonationToken')
      
      // Mettre à jour le store
      store.dispatch('stopImpersonation')
      
      store.dispatch('showSuccess', 'Impersonation terminée')
      
      return { success: true }
      
    } catch (error) {
      const message = error.message || 'Erreur lors de l\'arrêt de l\'impersonation'
      store.dispatch('showError', message)
      
      return {
        success: false,
        message
      }
    }
  }
}

export default new AuthService()