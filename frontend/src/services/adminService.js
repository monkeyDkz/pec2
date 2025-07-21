import apiClient from './api'

export default {
  // Merchant Requests
  async getMerchantRequests() {
    const response = await apiClient.get('/admin/merchant-requests')
    return response.data.requests || response.data || []
  },

  async approveMerchantRequest(requestId) {
    const response = await apiClient.post(`/admin/merchant-requests/${requestId}/approve`)
    return response.data?.request || response.data || response
  },

  async rejectMerchantRequest(requestId, reason) {
    const response = await apiClient.post(`/admin/merchant-requests/${requestId}/reject`, { reason })
    return response.data?.request || response.data || response
  },

  // Merchant Management
  async getAllMerchants() {
    const response = await apiClient.get('/admin/merchants')
    return response.data.merchants || response.data || []
  },

  async suspendMerchant(merchantId, reason) {
    const response = await apiClient.post(`/admin/merchants/${merchantId}/suspend`, { reason })
    return response.data
  },

  async activateMerchant(merchantId) {
    const response = await apiClient.post(`/admin/merchants/${merchantId}/activate`)
    return response.data
  },

  async regenerateApiKey(merchantId) {
    const response = await apiClient.post(`/admin/merchants/${merchantId}/regenerate-key`)
    return response.data
  },

  // Transaction Management
  async getAllTransactions() {
    const response = await apiClient.get('/admin/transactions')
    return response.data
  },

  async refundTransaction(transactionId, amount) {
    const response = await apiClient.post(`/admin/transactions/${transactionId}/refund`, { amount })
    return response.data
  },

  async forceCompleteTransaction(transactionId) {
    const response = await apiClient.post(`/admin/transactions/${transactionId}/force-complete`)
    return response.data
  },

  // Dashboard Stats
  async getDashboardStats() {
    const response = await apiClient.get('/admin/dashboard/stats')
    return response.data
  }
}