import api from './api'

export default {
  createTransaction(merchantId, data) {
    return api.post(`/merchants/${merchantId}/transactions`, data)
  },
  getTransaction(id) {
    return api.get(`/transactions/${id}`)
  },
  confirmPayment(id, card) {
    return api.post(`/transactions/${id}/confirm`, card)
  }
}
