<template>
  <AppLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Demandes de Marchands
              </h1>
              <p class="mt-1 text-sm text-gray-500">
                Validez ou rejetez les demandes de création de comptes marchands
              </p>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <button
                @click="refreshRequests"
                class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="loading.requests"
              >
                <ArrowPathIcon 
                  class="h-4 w-4 mr-2" 
                  :class="{ 'animate-spin': loading.requests }" 
                />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="filters.requests.status"
                @change="applyFilters"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>

            <!-- Recherche -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input
                v-model="filters.requests.search"
                @input="debounceSearch"
                type="text"
                placeholder="Nom du marchand ou email..."
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <!-- Tri -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <select
                v-model="filters.requests.sortBy"
                @change="applyFilters"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="createdAt">Date de création</option>
                <option value="merchantName">Nom du marchand</option>
                <option value="userEmail">Email utilisateur</option>
              </select>
            </div>

            <!-- Ordre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
              <select
                v-model="filters.requests.sortOrder"
                @change="applyFilters"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="desc">Plus récent d'abord</option>
                <option value="asc">Plus ancien d'abord</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des demandes -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="bg-white shadow rounded-lg">
          <!-- Loading state -->
          <div v-if="loading.requests" class="p-6">
            <div class="space-y-4">
              <div v-for="i in 5" :key="i" class="animate-pulse">
                <div class="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="merchantRequests.length === 0" class="text-center py-12">
            <ExclamationCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ filters.requests.status === 'pending' ? 'Aucune demande en attente' : 'Aucune demande trouvée avec ces filtres' }}
            </p>
          </div>

          <!-- Demandes -->
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="request in merchantRequests"
              :key="request.id"
              class="p-6 hover:bg-gray-50 cursor-pointer"
              @click="selectRequest(request)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BuildingStorefrontIcon class="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-lg font-medium text-gray-900 truncate">
                        {{ request.merchantName || request.businessName }}
                      </h4>
                      <p class="text-sm text-gray-600">{{ request.userEmail }}</p>
                      <div class="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                        <span>{{ formatDate(request.createdAt) }}</span>
                        <span v-if="request.businessType">{{ request.businessType }}</span>
                        <span v-if="request.website">
                          <a :href="request.website" target="_blank" class="text-blue-600 hover:text-blue-500">
                            {{ request.website }}
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Description -->
                  <div v-if="request.description" class="mt-3">
                    <p class="text-sm text-gray-700 line-clamp-2">
                      {{ request.description }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-4">
                  <!-- Statut -->
                  <StatusBadge :status="request.status" />

                  <!-- Actions rapides pour les demandes en attente -->
                  <div v-if="request.status === 'pending'" class="flex items-center space-x-2">
                    <button
                      @click.stop="approveRequest(request.id)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckIcon class="w-3 h-3 mr-1" />
                      Approuver
                    </button>
                    <button
                      @click.stop="rejectRequest(request.id)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XMarkIcon class="w-3 h-3 mr-1" />
                      Rejeter
                    </button>
                  </div>

                  <!-- Flèche -->
                  <ChevronRightIcon class="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="merchantRequests.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  @click="previousPage"
                  :disabled="pagination.requests.page === 1"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  @click="nextPage"
                  :disabled="pagination.requests.page >= pagination.requests.totalPages"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Affichage de
                    <span class="font-medium">{{ (pagination.requests.page - 1) * pagination.requests.limit + 1 }}</span>
                    à
                    <span class="font-medium">{{ Math.min(pagination.requests.page * pagination.requests.limit, pagination.requests.total) }}</span>
                    sur
                    <span class="font-medium">{{ pagination.requests.total }}</span>
                    résultats
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      @click="previousPage"
                      :disabled="pagination.requests.page === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="nextPage"
                      :disabled="pagination.requests.page >= pagination.requests.totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon class="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <RequestDetailsModal
      v-if="selectedMerchantRequest"
      :request="selectedMerchantRequest"
      @close="selectedMerchantRequest = null"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/common/AppLayout.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import RequestDetailsModal from '@/components/admin/RequestDetailsModal.vue'
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

const {
  merchantRequests,
  loading,
  filters,
  pagination,
  selectedMerchantRequest
} = storeToRefs(adminStore)

const {
  fetchMerchantRequests,
  updateRequestsFilter,
  setRequestsPage,
  selectMerchantRequest,
  approveMerchantRequest,
  rejectMerchantRequest
} = adminStore

// Recherche avec debounce
let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// Méthodes
const refreshRequests = () => {
  fetchMerchantRequests()
}

const applyFilters = () => {
  fetchMerchantRequests()
}

const selectRequest = (request) => {
  selectMerchantRequest(request)
}

const approveRequest = async (requestId) => {
  try {
    await approveMerchantRequest(requestId, 'Approuvé automatiquement')
    await refreshRequests()
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
  }
}

const rejectRequest = async (requestId) => {
  try {
    await rejectMerchantRequest(requestId, 'Rejeté automatiquement')
    await refreshRequests()
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
  }
}

const handleApprove = async (requestId, notes) => {
  try {
    await approveMerchantRequest(requestId, notes)
    selectedMerchantRequest.value = null
    await refreshRequests()
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
  }
}

const handleReject = async (requestId, notes) => {
  try {
    await rejectMerchantRequest(requestId, notes)
    selectedMerchantRequest.value = null
    await refreshRequests()
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
  }
}

const previousPage = () => {
  if (pagination.value.requests.page > 1) {
    setRequestsPage(pagination.value.requests.page - 1)
    fetchMerchantRequests()
  }
}

const nextPage = () => {
  if (pagination.value.requests.page < pagination.value.requests.totalPages) {
    setRequestsPage(pagination.value.requests.page + 1)
    fetchMerchantRequests()
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Watchers
watch(() => filters.value.requests.status, () => {
  applyFilters()
})

// Initialisation
onMounted(() => {
  refreshRequests()
})
</script>
