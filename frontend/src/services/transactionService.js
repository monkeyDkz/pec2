import apiClient from './api'

export default {
  // Create Payment
  async createPayment(paymentData) {
    const response = await apiClient.post('/transactions/create', paymentData)
    return response.data
  },

  // Get Transaction Status
  async getTransactionStatus(transactionId) {
    const response = await apiClient.get(`/transactions/${transactionId}/status`)
    return response.data
  },

  // Process Payment
  async processPayment(transactionId, paymentMethod) {
    const response = await apiClient.post(`/transactions/${transactionId}/process`, paymentMethod)
    return response.data
  },

  // Cancel Transaction
  async cancelTransaction(transactionId) {
    const response = await apiClient.post(`/transactions/${transactionId}/cancel`)
    return response.data
  },

  // Get Transaction History
  async getTransactionHistory(filters = {}) {
    const response = await apiClient.get('/transactions/history', { params: filters })
    return response.data
  }
}