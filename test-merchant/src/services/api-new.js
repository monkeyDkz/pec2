import axios from 'axios'

// Create API composable
export const useApi = () => {
  // Get stores inside the function to avoid circular imports
  const getStores = () => {
    try {
      const { useCredentialsStore, useTransactionsStore } = require('../stores/index.js')
      return {
        credentialsStore: useCredentialsStore(),
        transactionsStore: useTransactionsStore()
      }
    } catch (error) {
      // Fallback if stores are not available
      return {
        credentialsStore: {
          merchantId: 'test-merchant-123',
          apiKey: 'test-api-key-123',
          backendUrl: 'http://localhost:3000',
          pspUrl: 'http://localhost:3002',
          webhookUrl: 'http://localhost:8081/webhook',
          returnUrl: 'http://localhost:8081/payment-return',
          cancelUrl: 'http://localhost:8081/payment-cancel',
          apiTimeout: 10000
        },
        transactionsStore: {
          addTransaction: () => {},
          updateTransaction: () => {}
        }
      }
    }
  }

  // Configuration axios
  const createApiInstance = (baseUrl) => {
    return axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Setup interceptors
  const setupInterceptors = (instance, credentials) => {
    instance.interceptors.request.use(
      config => {
        if (credentials.merchantId) {
          config.headers['X-Merchant-ID'] = credentials.merchantId
        }
        if (credentials.apiKey) {
          config.headers['X-API-Key'] = credentials.apiKey
        }
        return config
      },
      error => Promise.reject(error)
    )

    instance.interceptors.response.use(
      response => response,
      error => {
        console.warn('Erreur API:', error.message)
        return Promise.reject(error)
      }
    )
  }

  // API Methods
  const apiMethods = {
    // Health Check
    async healthCheck() {
      try {
        const { credentialsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        const response = await api.get('/health')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // PSP Health Check
    async pspHealthCheck() {
      try {
        const { credentialsStore } = getStores()
        const pspApi = createApiInstance(credentialsStore.pspUrl)
        setupInterceptors(pspApi, credentialsStore)
        const response = await pspApi.get('/health')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // Create Transaction
    async createTransaction(orderData) {
      try {
        const { credentialsStore, transactionsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)

        const transactionPayload = {
          merchant_id: credentialsStore.merchantId,
          amount: orderData.amount,
          currency: orderData.currency || 'EUR',
          description: orderData.description,
          return_url: credentialsStore.returnUrl,
          cancel_url: credentialsStore.cancelUrl,
          webhook_url: credentialsStore.webhookUrl,
          metadata: {
            ...orderData.metadata,
            items: orderData.items,
            source: 'test-merchant'
          }
        }

        const response = await api.post('/transactions', transactionPayload)
        
        // Store transaction locally
        const transaction = {
          id: response.data.id || response.data.transaction_id,
          amount: orderData.amount,
          currency: orderData.currency || 'EUR',
          status: response.data.status || 'pending',
          type: orderData.metadata?.orderType || 'standard',
          items: orderData.items,
          metadata: orderData.metadata,
          timestamp: new Date().toISOString()
        }
        
        transactionsStore.addTransaction(transaction)
        
        return { success: true, data: response.data }
      } catch (error) {
        console.error('Transaction creation failed:', error)
        return { success: false, error: error.message }
      }
    },

    // Get Transaction
    async getTransaction(transactionId) {
      try {
        const { credentialsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        const response = await api.get(`/transactions/${transactionId}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // Capture Transaction
    async captureTransaction(transactionId, amount = null) {
      try {
        const { credentialsStore, transactionsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        
        const payload = amount ? { amount } : {}
        const response = await api.post(`/transactions/${transactionId}/capture`, payload)
        
        // Update local transaction
        transactionsStore.updateTransaction(transactionId, {
          status: 'captured',
          captureDate: new Date().toISOString(),
          captureAmount: amount
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // Refund Transaction
    async refundTransaction(transactionId, amount = null) {
      try {
        const { credentialsStore, transactionsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        
        const payload = amount ? { amount } : {}
        const response = await api.post(`/transactions/${transactionId}/refund`, payload)
        
        // Update local transaction
        transactionsStore.updateTransaction(transactionId, {
          status: 'refunded',
          refundDate: new Date().toISOString(),
          refundAmount: amount
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // Cancel Transaction
    async cancelTransaction(transactionId) {
      try {
        const { credentialsStore, transactionsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        
        const response = await api.post(`/transactions/${transactionId}/cancel`)
        
        // Update local transaction
        transactionsStore.updateTransaction(transactionId, {
          status: 'cancelled',
          cancelDate: new Date().toISOString()
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // Get Transactions List
    async getTransactions(filters = {}) {
      try {
        const { credentialsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        
        const params = new URLSearchParams()
        if (filters.status) params.append('status', filters.status)
        if (filters.limit) params.append('limit', filters.limit)
        if (filters.offset) params.append('offset', filters.offset)
        
        const response = await api.get(`/transactions?${params}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    // Test Webhook
    async testWebhook() {
      try {
        const { credentialsStore } = getStores()
        const api = createApiInstance(credentialsStore.backendUrl)
        setupInterceptors(api, credentialsStore)
        
        const response = await api.post('/webhooks/test', {
          webhook_url: credentialsStore.webhookUrl,
          event: 'webhook.test',
          data: {
            message: 'Test webhook',
            timestamp: new Date().toISOString()
          }
        })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }

  return apiMethods
}
