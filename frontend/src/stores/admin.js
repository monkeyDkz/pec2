import { defineStore } from 'pinia'
import ApiService from '@/services/api'
import { useNotificationStore } from './notifications'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    // Dashboard principal
    dashboardStats: null,
    platformSettings: null,
    
    // Merchants
    allMerchants: [],
    merchantRequests: [],
    selectedMerchantRequest: null,
    
    // Transactions
    allTransactions: [],
    
    // États de chargement
    loading: {
      dashboard: false,
      merchants: false,
      requests: false,
      transactions: false,
      settings: false
    },
    
    // Erreurs
    errors: {
      dashboard: null,
      merchants: null,
      requests: null,
      transactions: null,
      settings: null
    },
    
    // Filtres et pagination
    filters: {
      merchants: {
        status: 'all',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      requests: {
        status: 'pending',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      transactions: {
        status: 'all',
        merchantId: 'all',
        dateRange: null,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    },
    
    pagination: {
      merchants: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      requests: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      transactions: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    }
  }),

  getters: {
    pendingRequestsCount: (state) => {
      return state.merchantRequests.filter(req => req.status === 'pending').length
    },
    
    activeMerchantsCount: (state) => {
      return state.allMerchants.filter(m => m.status === 'active').length
    },
    
    suspendedMerchantsCount: (state) => {
      return state.allMerchants.filter(m => m.status === 'suspended').length
    },
    
    totalTransactionsVolume: (state) => {
      return state.allTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
    },
    
    recentTransactions: (state) => {
      return state.allTransactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    },
    
    criticalAlerts: (state) => {
      const alerts = []
      
      // Demandes en attente depuis plus de 24h
      const oldRequests = state.merchantRequests.filter(req => {
        const hoursSinceRequest = (Date.now() - new Date(req.createdAt)) / (1000 * 60 * 60)
        return req.status === 'pending' && hoursSinceRequest > 24
      })
      
      if (oldRequests.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${oldRequests.length} demande(s) en attente depuis plus de 24h`,
          action: 'Traiter les demandes'
        })
      }
      
      // Merchants suspendus
      const suspendedCount = state.suspendedMerchantsCount
      if (suspendedCount > 0) {
        alerts.push({
          type: 'error',
          message: `${suspendedCount} merchant(s) suspendu(s)`,
          action: 'Vérifier les suspensions'
        })
      }
      
      return alerts
    }
  },

  actions: {
    // =============================================================================
    // DASHBOARD ET STATISTIQUES
    // =============================================================================
    
    async fetchAdminDashboard() {
      this.loading.dashboard = true
      this.errors.dashboard = null

      try {
        const response = await ApiService.getAdminDashboard()
        this.dashboardStats = response.data
        return response
      } catch (error) {
        this.errors.dashboard = error.response?.data?.message || 'Erreur lors du chargement du dashboard'
        throw error
      } finally {
        this.loading.dashboard = false
      }
    },

    async fetchAdminStats() {
      try {
        const response = await ApiService.getAdminStats()
        this.dashboardStats = { ...this.dashboardStats, ...response.data }
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        throw error
      }
    },

    // =============================================================================
    // GESTION DES MERCHANTS
    // =============================================================================
    
    async fetchAllMerchants(params = {}) {
      this.loading.merchants = true
      this.errors.merchants = null

      try {
        const queryParams = {
          ...this.filters.merchants,
          ...params,
          page: this.pagination.merchants.page,
          limit: this.pagination.merchants.limit
        }

        const response = await ApiService.getAllMerchants(queryParams)
        this.allMerchants = response.data.merchants || response.data
        
        if (response.data.pagination) {
          this.pagination.merchants = response.data.pagination
        }
        
        return response
      } catch (error) {
        this.errors.merchants = error.response?.data?.message || 'Erreur lors du chargement des merchants'
        throw error
      } finally {
        this.loading.merchants = false
      }
    },

    async suspendMerchant(merchantId, reason = '') {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.suspendMerchant(merchantId, reason)
        
        // Mettre à jour le merchant dans la liste
        const index = this.allMerchants.findIndex(m => m.id === merchantId)
        if (index !== -1) {
          this.allMerchants[index] = { ...this.allMerchants[index], status: 'suspended' }
        }
        
        notifications.addSuccess('Merchant suspendu avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la suspension'
        notifications.addError(message)
        throw error
      }
    },

    async activateMerchant(merchantId, notes = '') {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.activateMerchant(merchantId, notes)
        
        // Mettre à jour le merchant dans la liste
        const index = this.allMerchants.findIndex(m => m.id === merchantId)
        if (index !== -1) {
          this.allMerchants[index] = { ...this.allMerchants[index], status: 'active' }
        }
        
        notifications.addSuccess('Merchant activé avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de l\'activation'
        notifications.addError(message)
        throw error
      }
    },

    async impersonateMerchant(merchantId) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.impersonateMerchant(merchantId)
        notifications.addInfo('Mode impersonification activé')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de l\'impersonification'
        notifications.addError(message)
        throw error
      }
    },

    // =============================================================================
    // GESTION DES DEMANDES DE MERCHANTS
    // =============================================================================
    
    async fetchMerchantRequests(params = {}) {
      this.loading.requests = true
      this.errors.requests = null

      try {
        const queryParams = {
          ...this.filters.requests,
          ...params,
          page: this.pagination.requests.page,
          limit: this.pagination.requests.limit
        }

        const response = await ApiService.getMerchantRequests(queryParams)
        this.merchantRequests = response.data.requests || response.data
        
        if (response.data.pagination) {
          this.pagination.requests = response.data.pagination
        }
        
        return response
      } catch (error) {
        this.errors.requests = error.response?.data?.message || 'Erreur lors du chargement des demandes'
        throw error
      } finally {
        this.loading.requests = false
      }
    },

    async approveMerchantRequest(requestId, adminNotes = '') {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.approveMerchantRequest(requestId, adminNotes)
        
        // Mettre à jour la demande dans la liste
        const index = this.merchantRequests.findIndex(req => req.id === requestId)
        if (index !== -1) {
          this.merchantRequests[index] = { 
            ...this.merchantRequests[index], 
            status: 'approved',
            adminNotes,
            processedAt: new Date().toISOString()
          }
        }
        
        notifications.addSuccess('Demande approuvée avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de l\'approbation'
        notifications.addError(message)
        throw error
      }
    },

    async rejectMerchantRequest(requestId, adminNotes = '') {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.rejectMerchantRequest(requestId, adminNotes)
        
        // Mettre à jour la demande dans la liste
        const index = this.merchantRequests.findIndex(req => req.id === requestId)
        if (index !== -1) {
          this.merchantRequests[index] = { 
            ...this.merchantRequests[index], 
            status: 'rejected',
            adminNotes,
            processedAt: new Date().toISOString()
          }
        }
        
        notifications.addSuccess('Demande rejetée avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors du rejet'
        notifications.addError(message)
        throw error
      }
    },

    // =============================================================================
    // GESTION DES TRANSACTIONS
    // =============================================================================
    
    async fetchAllTransactions(params = {}) {
      this.loading.transactions = true
      this.errors.transactions = null

      try {
        const queryParams = {
          ...this.filters.transactions,
          ...params,
          page: this.pagination.transactions.page,
          limit: this.pagination.transactions.limit
        }

        const response = await ApiService.getAllTransactions(queryParams)
        this.allTransactions = response.data.transactions || response.data
        
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

    async refundTransaction(transactionId, amount = null, reason = '') {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.refundTransaction(transactionId, amount, reason)
        
        // Mettre à jour la transaction dans la liste
        const index = this.allTransactions.findIndex(t => t.id === transactionId)
        if (index !== -1) {
          this.allTransactions[index] = { 
            ...this.allTransactions[index], 
            status: 'refunded',
            refundedAt: new Date().toISOString(),
            refundReason: reason
          }
        }
        
        notifications.addSuccess('Transaction remboursée avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors du remboursement'
        notifications.addError(message)
        throw error
      }
    },

    async exportTransactions(filters = {}) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.exportTransactions(filters)
        notifications.addSuccess('Export généré avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de l\'export'
        notifications.addError(message)
        throw error
      }
    },

    // =============================================================================
    // PARAMÈTRES PLATEFORME
    // =============================================================================
    
    async fetchPlatformSettings() {
      this.loading.settings = true
      this.errors.settings = null

      try {
        const response = await ApiService.getPlatformSettings()
        this.platformSettings = response.data
        return response
      } catch (error) {
        this.errors.settings = error.response?.data?.message || 'Erreur lors du chargement des paramètres'
        throw error
      } finally {
        this.loading.settings = false
      }
    },

    async savePlatformSettings(settings) {
      const notifications = useNotificationStore()

      try {
        const response = await ApiService.savePlatformSettings(settings)
        this.platformSettings = { ...this.platformSettings, ...settings }
        notifications.addSuccess('Paramètres sauvegardés avec succès')
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la sauvegarde'
        notifications.addError(message)
        throw error
      }
    },

    // =============================================================================
    // UTILITAIRES
    // =============================================================================
    
    updateMerchantsFilter(filterUpdate) {
      this.filters.merchants = { ...this.filters.merchants, ...filterUpdate }
      this.pagination.merchants.page = 1 // Reset à la première page
    },

    updateRequestsFilter(filterUpdate) {
      this.filters.requests = { ...this.filters.requests, ...filterUpdate }
      this.pagination.requests.page = 1
    },

    updateTransactionsFilter(filterUpdate) {
      this.filters.transactions = { ...this.filters.transactions, ...filterUpdate }
      this.pagination.transactions.page = 1
    },

    setMerchantsPage(page) {
      this.pagination.merchants.page = page
    },

    setRequestsPage(page) {
      this.pagination.requests.page = page
    },

    setTransactionsPage(page) {
      this.pagination.transactions.page = page
    },

    selectMerchantRequest(request) {
      this.selectedMerchantRequest = request
    },

    clearErrors() {
      this.errors = {
        dashboard: null,
        merchants: null,
        requests: null,
        transactions: null,
        settings: null
      }
    }
  }
})
