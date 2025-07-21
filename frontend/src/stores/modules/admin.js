import adminService from '@/services/adminService'

export default {
  namespaced: true,
  
  state: {
    merchantRequests: [],
    merchants: [],
    transactions: [],
    dashboardStats: {},
    loading: false,
    error: null
  },

  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_MERCHANT_REQUESTS(state, requests) {
      state.merchantRequests = requests
    },
    SET_MERCHANTS(state, merchants) {
      state.merchants = merchants
    },
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions
    },
    SET_DASHBOARD_STATS(state, stats) {
      state.dashboardStats = stats
    },
    UPDATE_MERCHANT_REQUEST(state, updatedRequest) {
      const index = state.merchantRequests.findIndex(r => r.id === updatedRequest.id)
      if (index !== -1) {
        state.merchantRequests.splice(index, 1, updatedRequest)
      }
    },
    UPDATE_MERCHANT(state, updatedMerchant) {
      const index = state.merchants.findIndex(m => m.id === updatedMerchant.id)
      if (index !== -1) {
        state.merchants.splice(index, 1, updatedMerchant)
      }
    }
  },

  actions: {
    async fetchMerchantRequests({ commit }) {
      commit('SET_LOADING', true)
      try {
        const requests = await adminService.getMerchantRequests()
        commit('SET_MERCHANT_REQUESTS', requests)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async approveMerchantRequest({ commit, dispatch }, requestId) {
      try {
        const updatedRequest = await adminService.approveMerchantRequest(requestId)
        commit('UPDATE_MERCHANT_REQUEST', updatedRequest)
        
        // Recharger toutes les demandes pour s'assurer que l'interface est à jour
        await dispatch('fetchMerchantRequests')
        
        return updatedRequest
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async rejectMerchantRequest({ commit, dispatch }, { requestId, reason }) {
      try {
        const updatedRequest = await adminService.rejectMerchantRequest(requestId, reason)
        commit('UPDATE_MERCHANT_REQUEST', updatedRequest)
        
        // Recharger toutes les demandes pour s'assurer que l'interface est à jour
        await dispatch('fetchMerchantRequests')
        
        return updatedRequest
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async fetchMerchants({ commit }) {
      commit('SET_LOADING', true)
      try {
        const merchants = await adminService.getAllMerchants()
        commit('SET_MERCHANTS', merchants)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchDashboardStats({ commit }) {
      try {
        const stats = await adminService.getDashboardStats()
        commit('SET_DASHBOARD_STATS', stats)
      } catch (error) {
        commit('SET_ERROR', error.message)
      }
    }
  },

  getters: {
    pendingRequests: state => state.merchantRequests.filter(r => r.status === 'pending'),
    activeMerchants: state => state.merchants.filter(m => m.status === 'active'),
    totalRevenue: state => state.dashboardStats.totalRevenue || 0,
    totalTransactions: state => state.dashboardStats.totalTransactions || 0
  }
}