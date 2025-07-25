// ✅ src/services/merchantService.js
import api from './api'

export default {
  createRequest(data) {
    return api.post('/merchants/create-request', {
      type: 'create_merchant',
      ...data
    })
  },
  joinRequest(data) {
    return api.post('/merchants/join-request', {
      type: 'join_merchant',
      ...data
    })
  },
  getMyRequests() {
    return api.get('/merchants/my-requests')
  },
  getUserMerchants() {
    return api.get('/merchants')
  },
  getAvailableMerchants() {
    return api.get('/merchants/available')
  },
  getDashboard() {
    return api.get('/merchants/dashboard')
  },

  // 🔁 Routes spécifiques
  getMerchantDetails(merchantId) {
    return api.get(`/merchants/${merchantId}/details`) // ✅ fix ici
  },
  updateMerchant(merchantId, data) {
    return api.put(`/merchants/${merchantId}`, data)
  },
  getMerchantMembers(merchantId) {
    return api.get(`/merchants/${merchantId}/members`)
  },
  getMerchantCredentials(merchantId) {
    return api.get(`/merchants/${merchantId}/credentials`)
  },
  getMerchantTransactions(merchantId) {
    return api.get(`/merchants/${merchantId}/transactions`)
  },
  getMerchantRefunds(merchantId) {
    return api.get(`/merchants/${merchantId}/refunds`)
  },
  regenerateApiKeys(merchantId) {
    return api.post(`/merchants/${merchantId}/regenerate-keys`)
  },
  testWebhook(merchantId) {
    return api.post(`/merchants/${merchantId}/test-webhook`)
  },
  regenerateApiSecret(merchantId) {
    return api.post(`/merchants/${merchantId}/regenerate-secret`)
  }
}
