import axios from 'axios'

// Configuration de l'URL de base selon l'environnement
// Dans Docker, le frontend s'exécute dans le navigateur, donc il doit utiliser localhost
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: parseInt(process.env.VUE_APP_API_TIMEOUT) || 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('🌐 API Base URL:', API_BASE_URL) // Debug log

    // Intercepteur pour ajouter le token d'authentification
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log('📡 API Request:', config.method?.toUpperCase(), config.url) // Debug log
        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Intercepteur pour gérer les réponses
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.config.url) // Debug log
        return response.data
      },
      (error) => {
        console.error('❌ API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          code: error.code
        })

        if (error.response?.status === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('userType')
          localStorage.removeItem('userEmail')
          localStorage.removeItem('userId')
          window.location.href = '/login'
        }

        // Gestion des erreurs de réseau
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.error('🚫 Connexion au backend impossible')
          return Promise.reject(new Error('Impossible de se connecter au serveur'))
        }

        return Promise.reject(error)
      }
    )
  }

  // =============================================================================
  // MÉTHODES HTTP GÉNÉRIQUES (OBLIGATOIRE POUR AUTHSERVICE)
  // =============================================================================
  
  async get(url, config = {}) {
    console.log('🌍 GET:', `${this.client.defaults.baseURL}${url}`)
    return this.client.get(url, config)
  }

  async post(url, data = {}, config = {}) {
    console.log('🌍 POST:', `${this.client.defaults.baseURL}${url}`, data)
    return this.client.post(url, data, config)
  }

  async put(url, data = {}, config = {}) {
    console.log('🌍 PUT:', `${this.client.defaults.baseURL}${url}`, data)
    return this.client.put(url, data, config)
  }

  async delete(url, config = {}) {
    console.log('🌍 DELETE:', `${this.client.defaults.baseURL}${url}`)
    return this.client.delete(url, config)
  }

  // =============================================================================
  // AUTHENTIFICATION
  // =============================================================================
  
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials)
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userType', response.data.user.role)
      localStorage.setItem('userEmail', response.data.user.email)
      localStorage.setItem('userId', response.data.user.id)
    }
    return response
  }

  async register(userData) {
    return this.client.post('/auth/register', userData)
  }

  async logout() {
    return this.client.post('/auth/logout')
  }

  async getProfile() {
    return this.client.get('/auth/profile')
  }

  async verifyEmail(token) {
    return this.client.post('/auth/verify-email', { token })
  }

  // =============================================================================
  // ADMIN ROUTES
  // =============================================================================

  async getAdminDashboard() {
    return this.client.get('/admin/dashboard')
  }

  async getAllMerchants(params = {}) {
    return this.client.get('/admin/merchants', { params })
  }

  async getAllTransactions(params = {}) {
    return this.client.get('/admin/transactions', { params })
  }

  async getMerchantRequests(params = {}) {
    return this.client.get('/admin/merchant-requests', { params })
  }

  async approveMerchantRequest(requestId, adminNotes = '') {
    return this.client.post(`/admin/merchant-requests/${requestId}/approve`, { adminNotes })
  }

  async rejectMerchantRequest(requestId, adminNotes = '') {
    return this.client.post(`/admin/merchant-requests/${requestId}/reject`, { adminNotes })
  }

  async suspendMerchant(merchantId, reason = '') {
    return this.client.post(`/admin/merchants/${merchantId}/suspend`, { reason })
  }

  async activateMerchant(merchantId, notes = '') {
    return this.client.post(`/admin/merchants/${merchantId}/activate`, { notes })
  }

  async impersonateMerchant(merchantId) {
    return this.client.post(`/admin/impersonate/${merchantId}`)
  }

  async refundTransaction(transactionId, amount = null, reason = '') {
    return this.client.post(`/admin/transactions/${transactionId}/refund`, { amount, reason })
  }

  async exportTransactions(filters = {}) {
    return this.client.post('/admin/transactions/export', filters)
  }

  async getPlatformSettings() {
    return this.client.get('/admin/settings')
  }

  async savePlatformSettings(settings) {
    return this.client.post('/admin/settings', settings)
  }

  async getAdminStats() {
    return this.client.get('/admin/stats')
  }

  // =============================================================================
  // MERCHANT ROUTES
  // =============================================================================

  async getMerchantDashboard() {
    return this.client.get('/merchants/dashboard')
  }

  async getMyMerchants() {
    return this.client.get('/merchants')
  }

  async getAvailableMerchants(params = {}) {
    return this.client.get('/merchants/available', { params })
  }

  async createJoinRequest(data) {
    return this.client.post('/merchants/join-request', data)
  }

  async createMerchantRequest(data) {
    return this.client.post('/merchants/create-request', data)
  }

  async getMyRequests(params = {}) {
    return this.client.get('/merchants/my-requests', { params })
  }

  async getMerchantDetails(merchantId) {
    return this.client.get(`/merchants/${merchantId}/details`)
  }

  async getMerchantMembers(merchantId) {
    return this.client.get(`/merchants/${merchantId}/members`)
  }

  async updateMerchant(merchantId, data) {
    return this.client.put(`/merchants/${merchantId}`, data)
  }

  async regenerateApiKeys(merchantId) {
    return this.client.post(`/merchants/${merchantId}/regenerate-keys`)
  }

  // Nouvelles méthodes pour le dashboard marchand
  async getMerchantTransactions(merchantId, params = {}) {
    return this.client.get(`/merchants/${merchantId}/transactions`, { params })
  }

  async getMerchantCredentials(merchantId) {
    return this.client.get(`/merchants/${merchantId}/credentials`)
  }

  async createRefund(merchantId, data) {
    return this.client.post(`/merchants/${merchantId}/refund`, data)
  }

  async getMerchantRefunds(merchantId, params = {}) {
    return this.client.get(`/merchants/${merchantId}/refunds`, { params })
  }

  async regenerateSecret(merchantId) {
    return this.client.post(`/merchants/${merchantId}/regenerate-secret`)
  }

  async testWebhook(merchantId) {
    return this.client.post(`/merchants/${merchantId}/test-webhook`)
  }

  // =============================================================================
  // TRANSACTIONS (PUBLIC API)
  // =============================================================================

  async getTransaction(transactionId) {
    return this.client.get(`/transactions/${transactionId}`)
  }

  async processPayment(transactionId, paymentData) {
    return this.client.post(`/transactions/${transactionId}/process`, paymentData)
  }

  async cancelTransaction(transactionId, token) {
    return this.client.post(`/transactions/${transactionId}/cancel`, { token })
  }
}

export default new ApiService()