<template>
  <AppLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header avec statistiques -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard Administrateur
              </h1>
              <p class="mt-1 text-sm text-gray-500">
                Gérez la plateforme, validez les marchands et supervisez les transactions
              </p>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <button
                @click="refreshDashboard"
                class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="loading.dashboard"
              >
                <ArrowPathIcon 
                  class="h-4 w-4 mr-2" 
                  :class="{ 'animate-spin': loading.dashboard }" 
                />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertes critiques -->
      <div v-if="criticalAlerts.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div class="space-y-3">
          <div
            v-for="alert in criticalAlerts"
            :key="alert.message"
            class="rounded-md p-4"
            :class="{
              'bg-red-50 border border-red-200': alert.type === 'error',
              'bg-yellow-50 border border-yellow-200': alert.type === 'warning'
            }"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon 
                  class="h-5 w-5" 
                  :class="{
                    'text-red-400': alert.type === 'error',
                    'text-yellow-400': alert.type === 'warning'
                  }"
                />
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium" 
                   :class="{
                     'text-red-800': alert.type === 'error',
                     'text-yellow-800': alert.type === 'warning'
                   }">
                  {{ alert.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0">
                <button
                  class="text-sm font-medium underline"
                  :class="{
                    'text-red-800 hover:text-red-900': alert.type === 'error',
                    'text-yellow-800 hover:text-yellow-900': alert.type === 'warning'
                  }"
                >
                  {{ alert.action }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques principales -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Demandes en attente -->
          <StatsCard
            title="Demandes en attente"
            :value="pendingRequestsCount"
            icon="ExclamationCircleIcon"
            color="yellow"
            :loading="loading.dashboard"
            @click="$router.push('/admin/requests')"
            class="cursor-pointer hover:shadow-md transition-shadow"
          />

          <!-- Merchants actifs -->
          <StatsCard
            title="Merchants actifs"
            :value="activeMerchantsCount"
            icon="BuildingStorefrontIcon"
            color="green"
            :loading="loading.dashboard"
            @click="$router.push('/admin/merchants')"
            class="cursor-pointer hover:shadow-md transition-shadow"
          />

          <!-- Volume transactions -->
          <StatsCard
            title="Volume total"
            :value="formatCurrency(totalTransactionsVolume)"
            icon="BanknotesIcon"
            color="blue"
            :loading="loading.dashboard"
            @click="$router.push('/admin/transactions')"
            class="cursor-pointer hover:shadow-md transition-shadow"
          />

          <!-- Merchants suspendus -->
          <StatsCard
            title="Merchants suspendus"
            :value="suspendedMerchantsCount"
            icon="ExclamationTriangleIcon"
            :color="suspendedMerchantsCount > 0 ? 'red' : 'gray'"
            :loading="loading.dashboard"
            @click="$router.push('/admin/merchants?status=suspended')"
            class="cursor-pointer hover:shadow-md transition-shadow"
          />
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Demandes récentes -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Demandes récentes
                </h3>
                <router-link
                  to="/admin/requests"
                  class="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Voir tout
                </router-link>
              </div>

              <div v-if="loading.requests" class="space-y-3">
                <div v-for="i in 3" :key="i" class="animate-pulse">
                  <div class="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>

              <div v-else-if="merchantRequests.length === 0" class="text-center py-6">
                <ExclamationCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
                <p class="mt-1 text-sm text-gray-500">Toutes les demandes ont été traitées.</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="request in merchantRequests.slice(0, 5)"
                  :key="request.id"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="selectMerchantRequest(request)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-gray-900">
                        {{ request.merchantName || request.businessName }}
                      </h4>
                      <p class="text-sm text-gray-500">{{ request.userEmail }}</p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ formatDate(request.createdAt) }}
                      </p>
                    </div>
                    <StatusBadge :status="request.status" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Transactions récentes -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Transactions récentes
                </h3>
                <router-link
                  to="/admin/transactions"
                  class="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Voir tout
                </router-link>
              </div>

              <div v-if="loading.transactions" class="space-y-3">
                <div v-for="i in 5" :key="i" class="animate-pulse">
                  <div class="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>

              <div v-else-if="recentTransactions.length === 0" class="text-center py-6">
                <BanknotesIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
                <p class="mt-1 text-sm text-gray-500">Les transactions apparaîtront ici.</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="transaction in recentTransactions"
                  :key="transaction.id"
                  class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatCurrency(transaction.amount) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ transaction.merchantName }} • {{ formatDate(transaction.createdAt) }}
                    </p>
                  </div>
                  <StatusBadge :status="transaction.status" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/common/AppLayout.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

const {
  dashboardStats,
  merchantRequests,
  loading,
  pendingRequestsCount,
  activeMerchantsCount,
  suspendedMerchantsCount,
  totalTransactionsVolume,
  recentTransactions,
  criticalAlerts
} = storeToRefs(adminStore)

const {
  fetchAdminDashboard,
  fetchMerchantRequests,
  selectMerchantRequest
} = adminStore

// Méthodes
const refreshDashboard = async () => {
  try {
    await Promise.all([
      fetchAdminDashboard(),
      fetchMerchantRequests({ limit: 5 })
    ])
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error)
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Initialisation
onMounted(() => {
  refreshDashboard()
})
</script>
