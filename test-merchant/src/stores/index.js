import { createPinia } from 'pinia'
import { defineStore } from 'pinia'

// Cart Store
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    lastTransaction: null
  }),

  getters: {
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    total: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },

  actions: {
    addItem(product) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          ...product,
          quantity: 1
        })
      }
      
      this.saveCart()
    },

    updateQuantity(itemId, quantity) {
      const item = this.items.find(item => item.id === itemId)
      if (item) {
        item.quantity = Math.max(0, quantity)
        if (item.quantity === 0) {
          this.removeItem(itemId)
        } else {
          this.saveCart()
        }
      }
    },

    removeItem(itemId) {
      const index = this.items.findIndex(item => item.id === itemId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.saveCart()
      }
    },

    clearCart() {
      this.items = []
      this.saveCart()
    },

    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },

    loadCart() {
      const saved = localStorage.getItem('cart')
      if (saved) {
        this.items = JSON.parse(saved)
      }
    },

    setLastTransaction(transaction) {
      this.lastTransaction = transaction
      localStorage.setItem('lastTransaction', JSON.stringify(transaction))
    }
  }
})

// Credentials Store
export const useCredentialsStore = defineStore('credentials', {
  state: () => ({
    merchantId: 'test-merchant-123',
    apiKey: 'test-api-key-123',
    backendUrl: 'http://localhost:3000',
    pspUrl: 'http://localhost:3002',
    webhookUrl: 'http://localhost:8081/webhook',
    returnUrl: 'http://localhost:8081/payment-return',
    cancelUrl: 'http://localhost:8081/payment-cancel',
    isConfigured: false
  }),

  actions: {
    updateCredentials(credentials) {
      Object.assign(this.$state, credentials)
      this.saveCredentials()
    },

    saveCredentials() {
      localStorage.setItem('merchantCredentials', JSON.stringify(this.$state))
    },

    loadCredentials() {
      const saved = localStorage.getItem('merchantCredentials')
      if (saved) {
        Object.assign(this.$state, JSON.parse(saved))
      }
    },

    testConnection() {
      // Cette fonction sera implémentée pour tester la connexion
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isConfigured = true
          resolve(true)
        }, 1000)
      })
    }
  }
})

// Transactions Store
export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    isLoading: false
  }),

  getters: {
    successfulTransactions: (state) => state.transactions.filter(t => t.status === 'captured' || t.status === 'authorized'),
    failedTransactions: (state) => state.transactions.filter(t => t.status === 'failed'),
    totalAmount: (state) => state.transactions
      .filter(t => t.status === 'captured')
      .reduce((sum, t) => sum + t.amount, 0)
  },

  actions: {
    addTransaction(transaction) {
      this.transactions.unshift({
        ...transaction,
        timestamp: new Date().toISOString(),
        id: transaction.id || `TXN_${Date.now()}`
      })
      this.saveTransactions()
    },

    updateTransaction(transactionId, updates) {
      const transaction = this.transactions.find(t => t.id === transactionId)
      if (transaction) {
        Object.assign(transaction, updates)
        this.saveTransactions()
      }
    },

    clearTransactions() {
      this.transactions = []
      this.saveTransactions()
    },

    saveTransactions() {
      localStorage.setItem('transactions', JSON.stringify(this.transactions))
    },

    loadTransactions() {
      const saved = localStorage.getItem('transactions')
      if (saved) {
        this.transactions = JSON.parse(saved)
      }
    }
  }
})

// Create Pinia instance
export const pinia = createPinia()
