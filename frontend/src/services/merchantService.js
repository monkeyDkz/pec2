import apiClient from './api'

export default {
  // Dashboard
  async getDashboardData() {
    const response = await apiClient.get('/merchants/dashboard')
    return response.data
  },

  // Transactions
  async getTransactions(params = {}) {
    const response = await apiClient.get('/merchants/transactions', { params })
    return response.data
  },

  async getTransactionDetails(transactionId) {
    const response = await apiClient.get(`/merchants/transactions/${transactionId}`)
    return response.data
  },

  // Settings
  async updateSettings(settings) {
    const response = await apiClient.put('/merchants/settings', settings)
    return response.data
  },

  async getApiKeys() {
    const response = await apiClient.get('/merchants/api-keys')
    return response.data
  },

  async regenerateApiKey() {
    const response = await apiClient.post('/merchants/api-keys/regenerate')
    return response.data
  },

  // Integration
  async getIntegrationGuide() {
    const response = await apiClient.get('/merchants/integration')
    return response.data
  },

  async testWebhook(webhookUrl) {
    const response = await apiClient.post('/merchants/webhook/test', { webhookUrl })
    return response.data
  }
}