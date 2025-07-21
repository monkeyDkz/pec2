import { defineStore } from 'pinia'
import ApiService from '@/services/api'
import { useNotificationStore } from './notifications'

export const useMerchantsStore = defineStore('merchants', {
  state: () => ({
    // Merchants de l'utilisateur
    myMerchants: [],
    selectedMerchant: null,
    
    // Merchants disponibles pour rejoindre
    availableMerchants: [],
    
    // Demandes de l'utilisateur
    myRequests: [],
    
    // Détails d'un merchant spécifique
    merchantDetails: null,
    merchantMembers: [],
    merchantCredentials: null,
    
    // Transactions et statistiques
    transactions: [],
    refunds: [],
    dashboardStats: null,
    
    // États de chargement
    loading: {
      merchants: false,
      requests: false,
      available: false,
      details: false,
      transactions: false,
      dashboard: false
    },
    
    // Erreurs
    errors: {
      merchants: null,
      requests: null,
      available: null,
      details: null,
      transactions: null
    },
    
    // Pagination
    pagination: {
      transactions: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      refunds: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    }
  }),

  getters: {
    isOwnerOf: (state) => (merchantId) => {
      const merchant = state.myMerchants.find(m => m.id === merchantId)
      return merchant?.role === 'owner'
    },
    
    isAdminOf: (state) => (merchantId) => {
      const merchant = state.myMerchants.find(m => m.id === merchantId)
      return ['owner', 'admin'].includes(merchant?.role)
    },
    
    hasPendingRequests: (state) => {
      return state.myRequests.some(req => req.status === 'pending')
    },
    
    canJoinMerchant: (state) => (merchantId) => {
      // Vérifier si l'utilisateur n'est pas déjà membre
      const isMember = state.myMerchants.some(m => m.id === merchantId)
      // Vérifier s'il n'y a pas déjà une demande en attente
      const hasPendingRequest = state.myRequests.some(
        req => req.merchantId === merchantId && req.status === 'pending'
      )
      
      return !isMember && !hasPendingRequest
    },
    
    recentTransactions: (state) => {
      return state.transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    },
    
    totalRevenue: (state) => {
      return state.transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
    }
  },

  actions: {
    // =============================================================================
    // GESTION DES MERCHANTS DE L'UTILISATEUR
    // =============================================================================
    
    async fetchMyMerchants() {
      this.loading.merchants = true
      this.errors.merchants = null

      try {
        const response = await ApiService.getMyMerchants()
        this.myMerchants = response.data
        
        // Si aucun merchant sélectionné, prendre le premier
        if (this.myMerchants.length > 0 && !this.selectedMerchant) {
          this.selectedMerchant = this.myMerchants[0]
        }
        
        return response
      } catch (error) {
        this.errors.merchants = error.response?.data?.message || 'Erreur lors du chargement des merchants'
        throw error
      } finally {
        this.loading.merchants = false
      }
    },

    async fetchAvailableMerchants(params = {}) {
      this.loading.available = true
      this.errors.available = null

      try {
        const response = await ApiService.getAvailableMerchants(params)
        this.availableMerchants = response.data
        return response
      } catch (error) {
        this.errors.available = error.response?.data?.message || 'Erreur lors du chargement des merchants disponibles'
        throw error
      } finally {
        this.loading.available = false
      }
    },

    async fetchMyRequests(params = {}) {
      this.loading.requests = true
      this.errors.requests = null

      try {
        const response = await ApiService.getMyRequests(params)
        this.myRequests = response.data
        return response
      } catch (error) {
        this.errors.requests = error.response?.data?.message || 'Erreur lors du chargement des demandes'
        throw error
      } finally {
        this.loading.requests = false
      }
    },

    // =============================================================================
    // CREATION ET DEMANDES
    // =============================================================================
    
    async createJoinRequest(data) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.createJoinRequest(data)
        
        // Mettre à jour la liste des demandes
        await this.fetchMyRequests()
        
        notifications.addSuccess('Demande de rejoindre envoyée avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de l\'envoi de la demande'
        notifications.addError(message)
        throw error
      }
    },

    async createMerchantRequest(data) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.createMerchantRequest(data)
        
        // Mettre à jour la liste des demandes
        await this.fetchMyRequests()
        
        notifications.addSuccess('Demande de création de merchant envoyée avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la création de la demande'
        notifications.addError(message)
        throw error
      }
    },

    // =============================================================================
    // DÉTAILS D'UN MERCHANT SPÉCIFIQUE
    // =============================================================================
    
    async fetchMerchantDetails(merchantId) {
      this.loading.details = true
      this.errors.details = null

      try {
        const response = await ApiService.getMerchantDetails(merchantId)
        this.merchantDetails = response.data
        return response
      } catch (error) {
        this.errors.details = error.response?.data?.message || 'Erreur lors du chargement des détails'
        throw error
      } finally {
        this.loading.details = false
      }
    },

    async fetchMerchantMembers(merchantId) {
      try {
        const response = await ApiService.getMerchantMembers(merchantId)
        this.merchantMembers = response.data
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error)
        throw error
      }
    },

    async fetchMerchantCredentials(merchantId) {
      try {
        const response = await ApiService.getMerchantCredentials(merchantId)
        this.merchantCredentials = response.data
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des identifiants:', error)
        throw error
      }
    },

    // =============================================================================
    // TRANSACTIONS ET STATISTIQUES
    // =============================================================================
    
    async fetchMerchantTransactions(merchantId, params = {}) {
      this.loading.transactions = true
      this.errors.transactions = null

      try {
        const response = await ApiService.getMerchantTransactions(merchantId, params)
        this.transactions = response.data.transactions || response.data
        
        if (response.data.pagination) {
          this.pagination.transactions = response.data.pagination
        }
        
        return response
      } catch (error) {
        this.errors.transactions = error.response?.data?.message || 'Erreur lors du chargement des transactions'
        throw error
      } finally {
        this.loading.transactions = false
      }
    },

    async fetchMerchantDashboard() {
      this.loading.dashboard = true

      try {
        const response = await ApiService.getMerchantDashboard()
        this.dashboardStats = response.data
        return response
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error)
        throw error
      } finally {
        this.loading.dashboard = false
      }
    },

    async fetchMerchantRefunds(merchantId, params = {}) {
      try {
        const response = await ApiService.getMerchantRefunds(merchantId, params)
        this.refunds = response.data.refunds || response.data
        
        if (response.data.pagination) {
          this.pagination.refunds = response.data.pagination
        }
        
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des remboursements:', error)
        throw error
      }
    },

    // =============================================================================
    // ACTIONS MERCHANT
    // =============================================================================
    
    async updateMerchant(merchantId, data) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.updateMerchant(merchantId, data)
        
        // Mettre à jour les détails si disponibles
        if (this.merchantDetails?.id === merchantId) {
          this.merchantDetails = { ...this.merchantDetails, ...response.data }
        }
        
        // Mettre à jour dans la liste des merchants
        const index = this.myMerchants.findIndex(m => m.id === merchantId)
        if (index !== -1) {
          this.myMerchants[index] = { ...this.myMerchants[index], ...response.data }
        }
        
        notifications.addSuccess('Merchant mis à jour avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
        notifications.addError(message)
        throw error
      }
    },

    async regenerateApiKeys(merchantId) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.regenerateApiKeys(merchantId)
        
        // Mettre à jour les identifiants
        if (this.merchantCredentials) {
          this.merchantCredentials = { ...this.merchantCredentials, ...response.data }
        }
        
        notifications.addSuccess('Clés API régénérées avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la régénération des clés'
        notifications.addError(message)
        throw error
      }
    },

    async createRefund(merchantId, data) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.createRefund(merchantId, data)
        
        // Recharger les transactions et remboursements
        await Promise.all([
          this.fetchMerchantTransactions(merchantId),
          this.fetchMerchantRefunds(merchantId)
        ])
        
        notifications.addSuccess('Remboursement créé avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la création du remboursement'
        notifications.addError(message)
        throw error
      }
    },

    // =============================================================================
    // UTILITAIRES
    // =============================================================================
    
    selectMerchant(merchant) {
      this.selectedMerchant = merchant
    },

    clearMerchantDetails() {
      this.merchantDetails = null
      this.merchantMembers = []
      this.merchantCredentials = null
    },

    clearTransactions() {
      this.transactions = []
      this.refunds = []
    },

    clearErrors() {
      this.errors = {
        merchants: null,
        requests: null,
        available: null,
        details: null,
        transactions: null
      }
    }
  }
})
