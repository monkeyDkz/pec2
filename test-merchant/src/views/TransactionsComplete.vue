<template>
  <div class="transactions-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header avec Stats -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">💰 Gestion des Transactions</h1>
              <p class="text-gray-600">Historique et gestion de tous les paiements</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="refreshTransactions"
                :disabled="isLoading"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                🔄 Actualiser
              </button>
              <button
                @click="exportTransactions"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                📥 Exporter
              </button>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-600 text-sm font-medium">Total Transactions</p>
                  <p class="text-2xl font-bold text-blue-800">{{ transactionsStore.transactions.length }}</p>
                </div>
                <div class="text-3xl text-blue-600">📊</div>
              </div>
            </div>

            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-600 text-sm font-medium">Succès</p>
                  <p class="text-2xl font-bold text-green-800">{{ transactionsStore.successfulTransactions.length }}</p>
                </div>
                <div class="text-3xl text-green-600">✅</div>
              </div>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-red-600 text-sm font-medium">Échecs</p>
                  <p class="text-2xl font-bold text-red-800">{{ transactionsStore.failedTransactions.length }}</p>
                </div>
                <div class="text-3xl text-red-600">❌</div>
              </div>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-purple-600 text-sm font-medium">Montant Total</p>
                  <p class="text-2xl font-bold text-purple-800">{{ formatCurrency(transactionsStore.totalAmount) }}</p>
                </div>
                <div class="text-3xl text-purple-600">💰</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">🔍 Filtres</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tous</option>
                <option value="captured">Capturé</option>
                <option value="authorized">Autorisé</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select v-model="filters.type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tous</option>
                <option value="standard">Standard</option>
                <option value="preauth">Pré-autorisation</option>
                <option value="recurring">Récurrent</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                v-model="filters.dateFrom"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                v-model="filters.dateTo"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              @click="applyFilters"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Appliquer les filtres
            </button>
            <button
              @click="clearFilters"
              class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">📋 Liste des Transactions</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {{ transaction.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(transaction.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {{ formatCurrency(transaction.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(transaction.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusText(transaction.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ transaction.type || 'standard' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      @click="viewTransaction(transaction)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      👁️ Voir
                    </button>
                    
                    <button
                      v-if="transaction.status === 'authorized'"
                      @click="captureTransaction(transaction)"
                      class="text-green-600 hover:text-green-900"
                    >
                      💰 Capturer
                    </button>
                    
                    <button
                      v-if="transaction.status === 'captured'"
                      @click="refundTransaction(transaction)"
                      class="text-orange-600 hover:text-orange-900"
                    >
                      ↩️ Rembourser
                    </button>
                    
                    <button
                      v-if="['authorized', 'captured'].includes(transaction.status)"
                      @click="cancelTransaction(transaction)"
                      class="text-red-600 hover:text-red-900"
                    >
                      ❌ Annuler
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="filteredTransactions.length === 0" class="text-center py-12">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Aucune transaction trouvée</h3>
              <p class="text-gray-600">Commencez par effectuer un paiement dans la boutique</p>
              <router-link to="/shop" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Aller à la boutique
              </router-link>
            </div>
          </div>
        </div>

        <!-- Transaction Detail Modal -->
        <div v-if="selectedTransaction" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Détails de la Transaction</h3>
              <button @click="selectedTransaction = null" class="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-700">ID Transaction</label>
                  <p class="font-mono text-sm bg-gray-100 p-2 rounded">{{ selectedTransaction.id }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Statut</label>
                  <p :class="getStatusClass(selectedTransaction.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(selectedTransaction.status) }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-700">Montant</label>
                  <p class="text-lg font-bold">{{ formatCurrency(selectedTransaction.amount) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Date</label>
                  <p>{{ formatDate(selectedTransaction.timestamp) }}</p>
                </div>
              </div>

              <div v-if="selectedTransaction.items" class="mt-4">
                <label class="text-sm font-medium text-gray-700">Articles</label>
                <div class="mt-2 bg-gray-50 rounded p-3">
                  <div v-for="item in selectedTransaction.items" :key="item.name" class="flex justify-between text-sm">
                    <span>{{ item.name }} x{{ item.quantity }}</span>
                    <span>{{ formatCurrency(item.total) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedTransaction.metadata" class="mt-4">
                <label class="text-sm font-medium text-gray-700">Métadonnées</label>
                <pre class="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">{{ JSON.stringify(selectedTransaction.metadata, null, 2) }}</pre>
              </div>
            </div>

            <div class="mt-6 flex gap-2">
              <button
                v-if="selectedTransaction.status === 'authorized'"
                @click="captureTransaction(selectedTransaction)"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                💰 Capturer
              </button>
              <button
                v-if="selectedTransaction.status === 'captured'"
                @click="refundTransaction(selectedTransaction)"
                class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                ↩️ Rembourser
              </button>
              <button
                @click="selectedTransaction = null"
                class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useTransactionsStore } from '../stores/index.js'

const transactionsStore = useTransactionsStore()

const isLoading = ref(false)
const selectedTransaction = ref(null)

const filters = reactive({
  status: '',
  type: '',
  dateFrom: '',
  dateTo: ''
})

const filteredTransactions = computed(() => {
  let transactions = [...transactionsStore.transactions]
  
  if (filters.status) {
    transactions = transactions.filter(t => t.status === filters.status)
  }
  
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type)
  }
  
  if (filters.dateFrom) {
    transactions = transactions.filter(t => new Date(t.timestamp) >= new Date(filters.dateFrom))
  }
  
  if (filters.dateTo) {
    transactions = transactions.filter(t => new Date(t.timestamp) <= new Date(filters.dateTo))
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

const getStatusClass = (status) => {
  const classes = {
    captured: 'bg-green-100 text-green-800',
    authorized: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    captured: 'Capturé',
    authorized: 'Autorisé',
    failed: 'Échoué',
    refunded: 'Remboursé',
    cancelled: 'Annulé'
  }
  return texts[status] || status
}

// Actions
const refreshTransactions = async () => {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    transactionsStore.loadTransactions()
  } finally {
    isLoading.value = false
  }
}

const applyFilters = () => {
  // Filters are reactive, so they automatically apply
  console.log('Filters applied:', filters)
}

const clearFilters = () => {
  Object.assign(filters, {
    status: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  })
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
}

const captureTransaction = async (transaction) => {
  if (confirm(`Capturer la transaction ${transaction.id} ?`)) {
    transactionsStore.updateTransaction(transaction.id, {
      status: 'captured',
      captureDate: new Date().toISOString()
    })
    selectedTransaction.value = null
    alert('Transaction capturée avec succès !')
  }
}

const refundTransaction = async (transaction) => {
  const amount = prompt(`Montant à rembourser (max: ${transaction.amount}€):`, transaction.amount)
  if (amount && parseFloat(amount) > 0) {
    transactionsStore.updateTransaction(transaction.id, {
      status: 'refunded',
      refundAmount: parseFloat(amount),
      refundDate: new Date().toISOString()
    })
    selectedTransaction.value = null
    alert('Remboursement effectué avec succès !')
  }
}

const cancelTransaction = async (transaction) => {
  if (confirm(`Annuler la transaction ${transaction.id} ?`)) {
    transactionsStore.updateTransaction(transaction.id, {
      status: 'cancelled',
      cancelDate: new Date().toISOString()
    })
    selectedTransaction.value = null
    alert('Transaction annulée avec succès !')
  }
}

const exportTransactions = () => {
  const dataStr = JSON.stringify(filteredTransactions.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `transactions-${Date.now()}.json`
  link.click()
}

onMounted(() => {
  transactionsStore.loadTransactions()
})
</script>
