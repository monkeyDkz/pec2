# COMPOSANTS FRONTEND MANQUANTS

## 1. COMPOSANTS DE BASE
```vue
<!-- components/common/BaseModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen">
      <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close')"></div>
      <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<!-- components/common/BaseForm.vue -->
<template>
  <form @submit.prevent="$emit('submit')" class="space-y-6">
    <slot></slot>
  </form>
</template>

<!-- components/common/BaseInput.vue -->
<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <span v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</span>
  </div>
</template>

<!-- components/common/BasePagination.vue -->
<template>
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button @click="previousPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
        Précédent
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
        Suivant
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Affichage de <span class="font-medium">{{ startItem }}</span> à <span class="font-medium">{{ endItem }}</span>
          sur <span class="font-medium">{{ totalItems }}</span> résultats
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Pages de navigation -->
        </nav>
      </div>
    </div>
  </div>
</template>
```

## 2. COMPOSANTS MÉTIER
```vue
<!-- components/business/StatusBadge.vue -->
<template>
  <span :class="getStatusClass(status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
    <svg v-if="showIcon" class="-ml-0.5 mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
    {{ label || getStatusLabel(status) }}
  </span>
</template>

<!-- components/business/TransactionCard.vue -->
<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <CurrencyEuroIcon class="h-6 w-6 text-gray-400" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ transaction.reference }}</dt>
            <dd class="text-lg font-medium text-gray-900">{{ formatAmount(transaction.amount) }}</dd>
          </dl>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 px-5 py-3">
      <div class="text-sm">
        <StatusBadge :status="transaction.status" />
        <span class="text-gray-500 ml-2">{{ formatDate(transaction.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<!-- components/business/MerchantCard.vue -->
<template>
  <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
    <div class="p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BuildingOfficeIcon class="h-8 w-8 text-gray-400" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">{{ merchant.name }}</h3>
            <p class="text-sm text-gray-500">{{ merchant.business_type }}</p>
          </div>
        </div>
        <StatusBadge :status="merchant.status" />
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-600">{{ merchant.description }}</p>
      </div>
      <div class="mt-6 flex justify-between">
        <slot name="actions" :merchant="merchant"></slot>
      </div>
    </div>
  </div>
</template>

<!-- components/business/StatCard.vue -->
<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <component :is="icon" class="h-6 w-6 text-gray-400" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900">{{ value }}</div>
              <div v-if="change" :class="changeClass" class="ml-2 flex items-baseline text-sm font-semibold">
                <ArrowUpIcon v-if="change > 0" class="self-center flex-shrink-0 h-4 w-4" />
                <ArrowDownIcon v-else class="self-center flex-shrink-0 h-4 w-4" />
                {{ Math.abs(change) }}%
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 3. SERVICES FRONTEND MANQUANTS
```javascript
// services/merchantService.js
export default {
  async getMerchants() {
    const response = await ApiService.get('/merchants')
    return response.data
  },
  
  async getMerchant(id) {
    const response = await ApiService.get(`/merchants/${id}`)
    return response.data
  },
  
  async updateMerchant(id, data) {
    const response = await ApiService.put(`/merchants/${id}`, data)
    return response.data
  },
  
  async regenerateApiKeys(id) {
    const response = await ApiService.post(`/merchants/${id}/regenerate-keys`)
    return response.data
  }
}

// services/transactionService.js
export default {
  async getTransactions(filters = {}) {
    const response = await ApiService.get('/transactions', { params: filters })
    return response.data
  },
  
  async getTransaction(id) {
    const response = await ApiService.get(`/transactions/${id}`)
    return response.data
  },
  
  async refundTransaction(id, amount) {
    const response = await ApiService.post(`/transactions/${id}/refund`, { amount })
    return response.data
  }
}

// utils/formatters.js
export const formatAmount = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount / 100)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const formatStatus = (status) => {
  const statusMap = {
    pending: 'En attente',
    processing: 'En cours',
    success: 'Réussi',
    failed: 'Échoué',
    cancelled: 'Annulé'
  }
  return statusMap[status] || status
}
```

## 4. STORE VUEX MANQUANTS
```javascript
// stores/modules/merchant.js
export default {
  namespaced: true,
  state: {
    merchants: [],
    currentMerchant: null,
    transactions: [],
    stats: {},
    loading: false
  },
  mutations: {
    SET_MERCHANTS(state, merchants) {
      state.merchants = merchants
    },
    SET_CURRENT_MERCHANT(state, merchant) {
      state.currentMerchant = merchant
    },
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions
    },
    SET_STATS(state, stats) {
      state.stats = stats
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    async fetchMerchants({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await merchantService.getMerchants()
        commit('SET_MERCHANTS', response.merchants)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

// stores/modules/transaction.js
export default {
  namespaced: true,
  state: {
    transactions: [],
    currentTransaction: null,
    filters: {},
    pagination: {},
    loading: false
  },
  // mutations et actions similaires
}
```
