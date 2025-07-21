import transactionService from '@/services/transactionService'

export default {
  namespaced: true,
  
  state: {
    transactions: [],
    currentTransaction: null,
    paymentMethods: ['card', 'bank_transfer', 'paypal'],
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
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions
    },
    SET_CURRENT_TRANSACTION(state, transaction) {
      state.currentTransaction = transaction
    },
    UPDATE_TRANSACTION(state, updatedTransaction) {
      const index = state.transactions.findIndex(t => t.id === updatedTransaction.id)
      if (index !== -1) {
        state.transactions.splice(index, 1, updatedTransaction)
      }
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.unshift(transaction)
    }
  },

  actions: {
    async createPayment({ commit }, paymentData) {
      commit('SET_LOADING', true)
      try {
        const transaction = await transactionService.createPayment(paymentData)
        commit('ADD_TRANSACTION', transaction)
        commit('SET_CURRENT_TRANSACTION', transaction)
        return transaction
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async processPayment({ commit }, { transactionId, paymentMethod }) {
      commit('SET_LOADING', true)
      try {
        const transaction = await transactionService.processPayment(transactionId, paymentMethod)
        commit('UPDATE_TRANSACTION', transaction)
        return transaction
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async getTransactionStatus({ commit }, transactionId) {
      try {
        const transaction = await transactionService.getTransactionStatus(transactionId)
        commit('UPDATE_TRANSACTION', transaction)
        return transaction
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },

  getters: {
    completedTransactions: state => state.transactions.filter(t => t.status === 'completed'),
    pendingTransactions: state => state.transactions.filter(t => t.status === 'processing'),
    failedTransactions: state => state.transactions.filter(t => t.status === 'failed')
  }
}