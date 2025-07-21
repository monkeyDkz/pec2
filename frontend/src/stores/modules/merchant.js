import merchantService from '@/services/merchantService'

export default {
  namespaced: true,
  
  state: {
    dashboardData: {},
    transactions: [],
    settings: {},
    apiKeys: {},
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
    SET_DASHBOARD_DATA(state, data) {
      state.dashboardData = data
    },
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions
    },
    SET_SETTINGS(state, settings) {
      state.settings = settings
    },
    SET_API_KEYS(state, apiKeys) {
      state.apiKeys = apiKeys
    }
  },

  actions: {
    async fetchDashboardData({ commit }) {
      commit('SET_LOADING', true)
      try {
        const data = await merchantService.getDashboardData()
        commit('SET_DASHBOARD_DATA', data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchTransactions({ commit }, params) {
      commit('SET_LOADING', true)
      try {
        const transactions = await merchantService.getTransactions(params)
        commit('SET_TRANSACTIONS', transactions)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateSettings({ commit }, settings) {
      try {
        const updatedSettings = await merchantService.updateSettings(settings)
        commit('SET_SETTINGS', updatedSettings)
        return updatedSettings
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async regenerateApiKey({ commit }) {
      try {
        const newApiKeys = await merchantService.regenerateApiKey()
        commit('SET_API_KEYS', newApiKeys)
        return newApiKeys
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
}