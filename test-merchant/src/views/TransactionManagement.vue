<template>
  <div class="transaction-management">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">💰 Gestion des Transactions</h1>
              <p class="text-gray-600">Visualisez et gérez toutes les transactions de paiement</p>
            </div>
            <div class="flex gap-3">
              <button
                @click="refreshTransactions"
                :disabled="loading"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ loading ? '🔄' : '🔄' }} Actualiser
              </button>
              <button
                @click="exportTransactions"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                📥 Exporter
              </button>
            </div>
          </div>
        </div>

        <!-- Filters & Stats -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <!-- Filters -->
          <div class="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">🔍 Filtres</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  v-model="filters.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="authorized">Autorisé</option>
                  <option value="captured">Capturé</option>
                  <option value="failed">Échoué</option>
                  <option value="refunded">Remboursé</option>
                  <option value="partially_refunded">Partiellement remboursé</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant min</label>
                <input
                  v-model.number="filters.minAmount"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant max</label>
                <input
                  v-model.number="filters.maxAmount"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9999.99"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                <input
                  v-model="filters.search"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID, description..."
                />
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">📊 Statistiques</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total transactions:</span>
                <span class="font-medium">{{ stats.total }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Volume total:</span>
                <span class="font-medium">{{ formatCurrency(stats.totalAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Remboursements:</span>
                <span class="font-medium">{{ formatCurrency(stats.refundedAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Taux de succès:</span>
                <span class="font-medium text-green-600">{{ stats.successRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">📋 Liste des Transactions</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="transaction in filteredTransactions"
                  :key="transaction.id"
                  :class="{ 'bg-yellow-50': isHighlighted(transaction.id) }"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-2xl mr-3">{{ getTransactionIcon(transaction.status) }}</div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ transaction.id }}</div>
                        <div class="text-sm text-gray-500">{{ transaction.description || 'Aucune description' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatCurrency(transaction.amount) }}</div>
                    <div v-if="transaction.refundedAmount > 0" class="text-sm text-red-600">
                      Remboursé: {{ formatCurrency(transaction.refundedAmount) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(transaction.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatusText(transaction.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(transaction.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewTransaction(transaction)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Voir détails"
                      >
                        👁️
                      </button>
                      <button
                        v-if="canCapture(transaction)"
                        @click="captureTransaction(transaction)"
                        class="text-green-600 hover:text-green-900"
                        title="Capturer"
                      >
                        💰
                      </button>
                      <button
                        v-if="canRefund(transaction)"
                        @click="initiateRefund(transaction)"
                        class="text-red-600 hover:text-red-900"
                        title="Rembourser"
                      >
                        💸
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTransactions.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📭</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
            <p class="text-gray-500">{{ loading ? 'Chargement en cours...' : 'Aucune transaction ne correspond aux critères' }}</p>
          </div>
        </div>

        <!-- Transaction Detail Modal -->
        <div v-if="selectedTransaction" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-800">
                {{ getTransactionIcon(selectedTransaction.status) }} Détails de la Transaction
              </h3>
              <button
                @click="selectedTransaction = null"
                class="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Info -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">ID Transaction</label>
                  <p class="mt-1 text-sm text-gray-900 font-mono">{{ selectedTransaction.id }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Montant</label>
                  <p class="mt-1 text-lg text-gray-900 font-semibold">{{ formatCurrency(selectedTransaction.amount) }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Statut</label>
                  <span :class="getStatusClass(selectedTransaction.status)" class="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(selectedTransaction.status) }}
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Date de création</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedTransaction.createdAt) }}</p>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedTransaction.description || 'Aucune description' }}</p>
                </div>

                <div v-if="selectedTransaction.refundedAmount > 0">
                  <label class="block text-sm font-medium text-gray-700">Montant remboursé</label>
                  <p class="mt-1 text-sm text-red-600 font-semibold">{{ formatCurrency(selectedTransaction.refundedAmount) }}</p>
                </div>

                <div v-if="selectedTransaction.metadata">
                  <label class="block text-sm font-medium text-gray-700">Métadonnées</label>
                  <pre class="mt-1 text-xs text-gray-900 bg-gray-50 p-2 rounded overflow-x-auto">{{ JSON.stringify(selectedTransaction.metadata, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex justify-end space-x-3">
              <button
                @click="selectedTransaction = null"
                class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
              <button
                v-if="canCapture(selectedTransaction)"
                @click="captureTransaction(selectedTransaction)"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                💰 Capturer
              </button>
              <button
                v-if="canRefund(selectedTransaction)"
                @click="initiateRefund(selectedTransaction)"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                💸 Rembourser
              </button>
            </div>
          </div>
        </div>

        <!-- Refund Modal -->
        <div v-if="refundModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">💸 Remboursement</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <p class="text-sm text-gray-900 font-mono">{{ refundModal.transaction?.id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant disponible</label>
                <p class="text-lg text-gray-900 font-semibold">{{ formatCurrency(refundModal.availableAmount) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant à rembourser</label>
                <input
                  v-model.number="refundModal.amount"
                  type="number"
                  step="0.01"
                  :max="refundModal.availableAmount"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Raison du remboursement</label>
                <textarea
                  v-model="refundModal.reason"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Raison du remboursement..."
                ></textarea>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                @click="refundModal.show = false"
                class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="processRefund"
                :disabled="refundModal.processing || refundModal.amount <= 0"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {{ refundModal.processing ? 'Traitement...' : 'Confirmer le remboursement' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/services/api'

export default {
  name: 'TransactionManagement',
  setup() {
    const route = useRoute()
    const api = useApi()

    const loading = ref(false)
    const selectedTransaction = ref(null)
    
    const transactions = ref([])
    const filters = reactive({
      status: '',
      minAmount: null,
      maxAmount: null,
      search: ''
    })

    const refundModal = reactive({
      show: false,
      transaction: null,
      amount: 0,
      availableAmount: 0,
      reason: '',
      processing: false
    })

    // Computed properties
    const filteredTransactions = computed(() => {
      return transactions.value.filter(transaction => {
        // Filter by status
        if (filters.status && transaction.status !== filters.status) {
          return false
        }

        // Filter by amount range
        if (filters.minAmount !== null && transaction.amount < filters.minAmount) {
          return false
        }
        if (filters.maxAmount !== null && transaction.amount > filters.maxAmount) {
          return false
        }

        // Filter by search term
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          const matchesId = transaction.id.toLowerCase().includes(searchLower)
          const matchesDescription = transaction.description?.toLowerCase().includes(searchLower)
          if (!matchesId && !matchesDescription) {
            return false
          }
        }

        return true
      })
    })

    const stats = computed(() => {
      const total = transactions.value.length
      const totalAmount = transactions.value.reduce((sum, t) => sum + t.amount, 0)
      const refundedAmount = transactions.value.reduce((sum, t) => sum + (t.refundedAmount || 0), 0)
      const successfulTransactions = transactions.value.filter(t => 
        ['authorized', 'captured', 'refunded', 'partially_refunded'].includes(t.status)
      ).length
      const successRate = total > 0 ? Math.round((successfulTransactions / total) * 100) : 0

      return {
        total,
        totalAmount,
        refundedAmount,
        successRate
      }
    })

    // Helper functions
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('fr-FR')
    }

    const getTransactionIcon = (status) => {
      const icons = {
        pending: '⏳',
        authorized: '🔒',
        captured: '✅',
        failed: '❌',
        refunded: '💸',
        partially_refunded: '🔄'
      }
      return icons[status] || '❓'
    }

    const getStatusClass = (status) => {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        authorized: 'bg-blue-100 text-blue-800',
        captured: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-purple-100 text-purple-800',
        partially_refunded: 'bg-orange-100 text-orange-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: 'En attente',
        authorized: 'Autorisé',
        captured: 'Capturé',
        failed: 'Échoué',
        refunded: 'Remboursé',
        partially_refunded: 'Partiellement remboursé'
      }
      return texts[status] || status
    }

    const canCapture = (transaction) => {
      return transaction.status === 'authorized'
    }

    const canRefund = (transaction) => {
      return ['captured', 'partially_refunded'].includes(transaction.status) &&
             (transaction.refundedAmount || 0) < transaction.amount
    }

    const isHighlighted = (transactionId) => {
      return route.query.highlight === transactionId
    }

    // Actions
    const refreshTransactions = async () => {
      loading.value = true
      try {
        // Try to load from API
        try {
          const response = await api.transactions.list()
          if (response.success && response.data) {
            transactions.value = response.data
            return
          }
        } catch (apiError) {
          console.warn('API non disponible, chargement des données de démonstration')
        }

        // Fallback to demo data
        await loadDemoTransactions()
      } catch (error) {
        console.error('Erreur lors du chargement des transactions:', error)
      } finally {
        loading.value = false
      }
    }

    const loadDemoTransactions = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      transactions.value = [
        {
          id: 'TXN_CAPTURED_1234567890',
          amount: 299.99,
          status: 'captured',
          description: 'Achat Casque Audio',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          refundedAmount: 0,
          metadata: { orderType: 'standard', items: 1 }
        },
        {
          id: 'TXN_AUTHORIZED_1234567891',
          amount: 899.99,
          status: 'authorized',
          description: 'Achat Smartphone Pro',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          refundedAmount: 0,
          metadata: { orderType: 'preauth', items: 1 }
        },
        {
          id: 'TXN_FAILED_1234567892',
          amount: 1299.99,
          status: 'failed',
          description: 'Achat Ordinateur Portable',
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          refundedAmount: 0,
          metadata: { orderType: 'fail', error: 'Insufficient funds' }
        },
        {
          id: 'TXN_REFUNDED_1234567893',
          amount: 449.99,
          status: 'refunded',
          description: 'Achat Tablette Graphique',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          refundedAmount: 449.99,
          metadata: { orderType: 'standard', refundReason: 'Client insatisfait' }
        },
        {
          id: 'TXN_PARTIAL_1234567894',
          amount: 499.99,
          status: 'partially_refunded',
          description: 'Achat Console de Jeu',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          refundedAmount: 100.00,
          metadata: { orderType: 'standard', refundReason: 'Frais de livraison' }
        }
      ]
    }

    const viewTransaction = (transaction) => {
      selectedTransaction.value = transaction
    }

    const captureTransaction = async (transaction) => {
      if (!canCapture(transaction)) return

      try {
        // Try to call API
        try {
          await api.transactions.capture(transaction.id, transaction.amount)
        } catch (apiError) {
          console.warn('API non disponible, simulation de la capture')
        }

        // Update transaction status
        const index = transactions.value.findIndex(t => t.id === transaction.id)
        if (index !== -1) {
          transactions.value[index].status = 'captured'
        }

        // Close modal if open
        if (selectedTransaction.value?.id === transaction.id) {
          selectedTransaction.value.status = 'captured'
        }

      } catch (error) {
        console.error('Erreur lors de la capture:', error)
        alert('Erreur lors de la capture de la transaction')
      }
    }

    const initiateRefund = (transaction) => {
      if (!canRefund(transaction)) return

      const availableAmount = transaction.amount - (transaction.refundedAmount || 0)
      
      refundModal.transaction = transaction
      refundModal.amount = availableAmount
      refundModal.availableAmount = availableAmount
      refundModal.reason = ''
      refundModal.show = true
    }

    const processRefund = async () => {
      if (!refundModal.transaction || refundModal.amount <= 0) return

      refundModal.processing = true

      try {
        // Try to call API
        try {
          await api.transactions.refund(refundModal.transaction.id, refundModal.amount)
        } catch (apiError) {
          console.warn('API non disponible, simulation du remboursement')
        }

        // Update transaction
        const index = transactions.value.findIndex(t => t.id === refundModal.transaction.id)
        if (index !== -1) {
          const transaction = transactions.value[index]
          const newRefundedAmount = (transaction.refundedAmount || 0) + refundModal.amount
          
          transaction.refundedAmount = newRefundedAmount
          
          if (newRefundedAmount >= transaction.amount) {
            transaction.status = 'refunded'
          } else {
            transaction.status = 'partially_refunded'
          }
        }

        // Update selected transaction if open
        if (selectedTransaction.value?.id === refundModal.transaction.id) {
          const newRefundedAmount = (selectedTransaction.value.refundedAmount || 0) + refundModal.amount
          selectedTransaction.value.refundedAmount = newRefundedAmount
          
          if (newRefundedAmount >= selectedTransaction.value.amount) {
            selectedTransaction.value.status = 'refunded'
          } else {
            selectedTransaction.value.status = 'partially_refunded'
          }
        }

        refundModal.show = false

      } catch (error) {
        console.error('Erreur lors du remboursement:', error)
        alert('Erreur lors du remboursement')
      } finally {
        refundModal.processing = false
      }
    }

    const exportTransactions = () => {
      const csvContent = [
        ['ID', 'Montant', 'Statut', 'Description', 'Date', 'Remboursé'].join(','),
        ...filteredTransactions.value.map(t => [
          t.id,
          t.amount,
          t.status,
          `"${t.description || ''}"`,
          new Date(t.createdAt).toISOString(),
          t.refundedAmount || 0
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }

    // Watchers
    watch(() => route.query.highlight, (newHighlight) => {
      if (newHighlight) {
        // Scroll to highlighted transaction after a short delay
        setTimeout(() => {
          const element = document.querySelector(`tr.bg-yellow-50`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    })

    onMounted(() => {
      refreshTransactions()
    })

    return {
      loading,
      transactions,
      filteredTransactions,
      filters,
      stats,
      selectedTransaction,
      refundModal,
      formatCurrency,
      formatDate,
      getTransactionIcon,
      getStatusClass,
      getStatusText,
      canCapture,
      canRefund,
      isHighlighted,
      refreshTransactions,
      viewTransaction,
      captureTransaction,
      initiateRefund,
      processRefund,
      exportTransactions
    }
  }
}
</script>

<style scoped>
/* Animations pour les modales */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Highlight animation */
@keyframes highlight {
  0% { background-color: #fef3cd; }
  100% { background-color: transparent; }
}

.highlight-row {
  animation: highlight 2s ease-in-out;
}

/* Table responsive */
@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }
}
</style>
