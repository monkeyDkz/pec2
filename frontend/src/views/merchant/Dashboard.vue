<template>
  <AppLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Dashboard Marchand</h1>
              <p class="mt-1 text-sm text-gray-500">
                Gérez vos transactions, paramètres et équipe
              </p>
            </div>
            
            <!-- Sélecteur de marchand -->
            <div v-if="myMerchants.length > 1" class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">Marchand actuel:</label>
              <select
                v-model="selectedMerchantId"
                @change="handleMerchantChange"
                class="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option
                  v-for="merchant in myMerchants"
                  :key="merchant.id"
                  :value="merchant.id"
                >
                  {{ merchant.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="loading.merchants || loading.dashboard" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="bg-white overflow-hidden shadow rounded-lg h-24"></div>
          </div>
        </div>
      </div>

      <!-- État vide - Aucun marchand -->
      <div v-else-if="myMerchants.length === 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <BuildingStorefrontIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun marchand associé</h3>
          <p class="mt-1 text-sm text-gray-500">
            Vous n'êtes membre d'aucun compte marchand.
          </p>
          <div class="mt-6">
            <router-link
              to="/dashboard"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour au Dashboard
            </router-link>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Statistiques -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Transactions ce mois"
            :value="dashboardStats?.currentMonth?.count || 0"
            icon="BanknotesIcon"
            color="blue"
            :trend="dashboardStats?.currentMonth?.trend"
            :loading="loading.dashboard"
          />
          
          <StatsCard
            title="Chiffre d'affaires"
            :value="formatCurrency(dashboardStats?.currentMonth?.revenue || 0)"
            icon="CurrencyEuroIcon"
            color="green"
            :trend="dashboardStats?.revenue?.trend"
            :loading="loading.dashboard"
          />
          
          <StatsCard
            title="Taux de succès"
            :value="`${dashboardStats?.successRate || 0}%`"
            icon="CheckCircleIcon"
            :color="getSuccessRateColor(dashboardStats?.successRate)"
            :loading="loading.dashboard"
          />
          
          <StatsCard
            title="Remboursements"
            :value="dashboardStats?.refunds?.count || 0"
            icon="ArrowUturnLeftIcon"
            color="orange"
            :loading="loading.dashboard"
          />
        </div>

        <!-- Actions rapides -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Transactions récentes -->
          <div class="lg:col-span-2">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Transactions récentes
                  </h3>
                  <router-link
                    :to="`/merchant/${selectedMerchantId}/transactions`"
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
                    class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">
                        {{ formatCurrency(transaction.amount) }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ transaction.customerEmail }} • {{ formatDate(transaction.createdAt) }}
                      </p>
                    </div>
                    <StatusBadge :status="transaction.status" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="space-y-6">
            <!-- Informations du marchand -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ selectedMerchant?.name }}
                </h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Statut</span>
                    <StatusBadge :status="selectedMerchant?.status" size="sm" />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Rôle</span>
                    <span class="text-sm font-medium text-gray-900 capitalize">
                      {{ selectedMerchant?.role }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Membre depuis</span>
                    <span class="text-sm text-gray-900">
                      {{ formatDate(selectedMerchant?.joinedAt) }}
                    </span>
                  </div>
                </div>
                
                <div class="mt-6 flex space-x-3">
                  <router-link
                    :to="`/merchant/${selectedMerchantId}/settings`"
                    class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CogIcon class="w-4 h-4 mr-1" />
                    Paramètres
                  </router-link>
                  <router-link
                    v-if="isAdminOf(selectedMerchantId)"
                    :to="`/merchant/${selectedMerchantId}/team`"
                    class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <UsersIcon class="w-4 h-4 mr-1" />
                    Équipe
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Actions rapides
                </h3>
                <div class="space-y-3">
                  <button
                    @click="testWebhook"
                    :disabled="loading.webhook"
                    class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <GlobeAltIcon class="w-4 h-4 mr-2" />
                    <span v-if="!loading.webhook">Tester Webhook</span>
                    <span v-else>Test en cours...</span>
                  </button>
                  
                  <button
                    @click="regenerateSecret"
                    :disabled="loading.secret"
                    class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <KeyIcon class="w-4 h-4 mr-2" />
                    <span v-if="!loading.secret">Régénérer Secret</span>
                    <span v-else>Génération...</span>
                  </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMerchantsStore } from '@/stores/merchants'
import { useNotificationStore } from '@/stores/notifications'
import AppLayout from '@/components/common/AppLayout.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ApiService from '@/services/api'
import {
  BuildingStorefrontIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  CurrencyEuroIcon,
  CogIcon,
  UsersIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'

const merchantsStore = useMerchantsStore()
const notificationStore = useNotificationStore()

const {
  myMerchants,
  selectedMerchant,
  dashboardStats,
  recentTransactions,
  loading,
  isAdminOf
} = storeToRefs(merchantsStore)

const {
  fetchMyMerchants,
  fetchMerchantDashboard,
  fetchMerchantTransactions,
  selectMerchant
} = merchantsStore

// État local
const selectedMerchantId = ref(null)
const loadingStates = ref({
  webhook: false,
  secret: false
})

// Computed
const loading_webhook = computed(() => loadingStates.value.webhook)
const loading_secret = computed(() => loadingStates.value.secret)

// Méthodes
const handleMerchantChange = () => {
  const merchant = myMerchants.value.find(m => m.id === selectedMerchantId.value)
  if (merchant) {
    selectMerchant(merchant)
    loadMerchantData()
  }
}

const loadMerchantData = async () => {
  if (!selectedMerchantId.value) return

  try {
    await Promise.all([
      fetchMerchantDashboard(),
      fetchMerchantTransactions(selectedMerchantId.value, { limit: 5 })
    ])
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

const testWebhook = async () => {
  if (!selectedMerchantId.value) return

  loadingStates.value.webhook = true
  try {
    await ApiService.testWebhook(selectedMerchantId.value)
    notificationStore.addSuccess('Test webhook envoyé avec succès')
  } catch (error) {
    notificationStore.addError('Erreur lors du test webhook')
  } finally {
    loadingStates.value.webhook = false
  }
}

const regenerateSecret = async () => {
  if (!selectedMerchantId.value) return

  if (!confirm('Êtes-vous sûr de vouloir régénérer le secret ? L\'ancien secret ne fonctionnera plus.')) {
    return
  }

  loadingStates.value.secret = true
  try {
    await ApiService.regenerateSecret(selectedMerchantId.value)
    notificationStore.addSuccess('Secret régénéré avec succès')
  } catch (error) {
    notificationStore.addError('Erreur lors de la régénération du secret')
  } finally {
    loadingStates.value.secret = false
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

const getSuccessRateColor = (rate) => {
  if (rate >= 95) return 'green'
  if (rate >= 85) return 'yellow'
  return 'red'
}

// Watchers
watch(selectedMerchant, (newMerchant) => {
  if (newMerchant && newMerchant.id !== selectedMerchantId.value) {
    selectedMerchantId.value = newMerchant.id
  }
})

watch(selectedMerchantId, (newId) => {
  if (newId) {
    loadMerchantData()
  }
})

// Initialisation
onMounted(async () => {
  try {
    await fetchMyMerchants()
    
    // Sélectionner le premier marchand si disponible
    if (myMerchants.value.length > 0) {
      const firstMerchant = myMerchants.value[0]
      selectedMerchantId.value = firstMerchant.id
      selectMerchant(firstMerchant)
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
  }
})
</script>
