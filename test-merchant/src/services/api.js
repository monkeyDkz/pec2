import axios from 'axios'

// Default configuration for fallback
const defaultConfig = {
  merchantId: 'test-merchant-123',
  apiKey: 'test-api-key-123',
  backendUrl: 'http://localhost:3000',
  pspUrl: 'http://localhost:3002',
  webhookUrl: 'http://localhost:8081/webhook',
  returnUrl: 'http://localhost:8081/payment-return',
  cancelUrl: 'http://localhost:8081/payment-cancel',
  apiTimeout: 10000
}

// Create API composable
export const useApi = () => {
  // Get stores function - will be called when needed
  let credentialsStore = null
  let transactionsStore = null

  const getStores = async () => {
    if (!credentialsStore || !transactionsStore) {
      try {
        // Dynamic import to avoid circular dependencies
        const storesModule = await import('../stores/index.js')
        credentialsStore = storesModule.useCredentialsStore()
        transactionsStore = storesModule.useTransactionsStore()
      } catch (error) {
        console.warn('Could not load stores, using defaults:', error)
        credentialsStore = defaultConfig
        transactionsStore = {
          addTransaction: () => console.log('Mock addTransaction'),
          updateTransaction: () => console.log('Mock updateTransaction')
        }
      }
    }
    return { credentialsStore, transactionsStore }
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
  return {
    // Health Check methods
    health: {
      async checkBackend() {
        try {
          const { credentialsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          const response = await api.get('/health')
          return { status: 'ok', data: response.data }
        } catch (error) {
          return { status: 'error', error: error.message }
        }
      },

      async checkPSP() {
        try {
          const { credentialsStore } = await getStores()
          const pspApi = createApiInstance(credentialsStore.pspUrl || defaultConfig.pspUrl)
          setupInterceptors(pspApi, credentialsStore)
          const response = await pspApi.get('/health')
          return { status: 'ok', data: response.data }
        } catch (error) {
          return { status: 'error', error: error.message }
        }
      }
    },

    // Transaction methods
    transactions: {
      async create(orderData) {
        try {
          const { credentialsStore, transactionsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          
          const payload = {
            ...orderData,
            merchantId: credentialsStore.merchantId || defaultConfig.merchantId,
            returnUrl: credentialsStore.returnUrl || defaultConfig.returnUrl,
            cancelUrl: credentialsStore.cancelUrl || defaultConfig.cancelUrl,
            webhookUrl: credentialsStore.webhookUrl || defaultConfig.webhookUrl
          }
          
          const response = await api.post('/transactions', payload)
          
          // Store transaction locally
          if (transactionsStore.addTransaction) {
            transactionsStore.addTransaction({
              id: response.data.transactionId,
              status: 'pending',
              amount: orderData.amount,
              currency: orderData.currency,
              createdAt: new Date().toISOString(),
              ...response.data
            })
          }
          
          return { success: true, data: response.data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      async get(transactionId) {
        try {
          const { credentialsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          const response = await api.get(`/transactions/${transactionId}`)
          return { success: true, data: response.data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      async capture(transactionId, amount = null) {
        try {
          const { credentialsStore, transactionsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          
          const payload = amount ? { amount } : {}
          const response = await api.post(`/transactions/${transactionId}/capture`, payload)
          
          // Update local transaction
          if (transactionsStore.updateTransaction) {
            transactionsStore.updateTransaction(transactionId, {
              status: 'captured',
              capturedAmount: amount || response.data.amount,
              captureDate: new Date().toISOString()
            })
          }
          
          return { success: true, data: response.data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      async refund(transactionId, amount = null) {
        try {
          const { credentialsStore, transactionsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          
          const payload = amount ? { amount } : {}
          const response = await api.post(`/transactions/${transactionId}/refund`, payload)
          
          // Update local transaction
          if (transactionsStore.updateTransaction) {
            transactionsStore.updateTransaction(transactionId, {
              status: 'refunded',
              refundedAmount: amount || response.data.amount,
              refundDate: new Date().toISOString()
            })
          }
          
          return { success: true, data: response.data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      async cancel(transactionId) {
        try {
          const { credentialsStore, transactionsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          
          const response = await api.post(`/transactions/${transactionId}/cancel`)
          
          // Update local transaction
          if (transactionsStore.updateTransaction) {
            transactionsStore.updateTransaction(transactionId, {
              status: 'cancelled',
              cancelDate: new Date().toISOString()
            })
          }
          
          return { success: true, data: response.data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      async list(filters = {}) {
        try {
          const { credentialsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
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
      }
    },

    // Webhook methods
    webhooks: {
      async test() {
        try {
          const { credentialsStore } = await getStores()
          const api = createApiInstance(credentialsStore.backendUrl || defaultConfig.backendUrl)
          setupInterceptors(api, credentialsStore)
          
          const payload = {
            webhookUrl: credentialsStore.webhookUrl || defaultConfig.webhookUrl,
            eventType: 'test',
            data: { test: true, timestamp: new Date().toISOString() }
          }
          
          const response = await api.post('/webhooks/test', payload)
          return { success: true, data: response.data }
        } catch (error) {
          return { success: false, error: error.message }
        }
      }
    }
  }
}

// Default export for backward compatibility
export default useApi
