<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Demandes de Marchands</h1>
      <p class="text-gray-600 mt-2">Gérez les demandes de création de comptes marchands</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-500">Chargement des demandes...</p>
    </div>

    <!-- Liste des demandes -->
    <div v-else class="bg-white rounded-lg shadow p-6">
      <BaseTable 
        v-if="requests.length > 0"
        :headers="tableHeaders"
        :data="requests"
      >
        <template #status="{ item }">
          <span :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </span>
        </template>
        
        <template #actions="{ item }">
          <div class="flex space-x-2">
            <BaseButton 
              v-if="item.status === 'pending'"
              variant="success"
              size="sm"
              :disabled="actionLoading"
              @click="approveRequest(item.id)"
            >
              {{ actionLoading ? '...' : 'Approuver' }}
            </BaseButton>
            <BaseButton 
              v-if="item.status === 'pending'"
              variant="danger"
              size="sm"
              :disabled="actionLoading"
              @click="rejectRequest(item.id)"
            >
              {{ actionLoading ? '...' : 'Rejeter' }}
            </BaseButton>
            <BaseButton 
              variant="secondary"
              size="sm"
              @click="viewRequest(item)"
            >
              Voir détails
            </BaseButton>
          </div>
        </template>
      </BaseTable>

      <div v-else class="text-center py-8 text-gray-500">
        <p>Aucune demande de marchand trouvée.</p>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="selectedRequest" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Détails de la demande</h3>
          <BaseButton variant="secondary" size="sm" @click="closeModal">
            Fermer
          </BaseButton>
        </div>
        
        <div class="space-y-4">
          <div>
            <strong>Nom du marchand :</strong>
            <span class="ml-2">{{ selectedRequest.requested_merchant_name || 'N/A' }}</span>
          </div>
          <div>
            <strong>Email :</strong>
            <span class="ml-2">{{ selectedRequest.user?.email || 'N/A' }}</span>
          </div>
          <div>
            <strong>Statut :</strong>
            <span :class="getStatusClass(selectedRequest.status)" class="ml-2">
              {{ getStatusText(selectedRequest.status) }}
            </span>
          </div>
          <div>
            <strong>Date de création :</strong>
            <span class="ml-2">{{ formatDate(selectedRequest.created_at) }}</span>
          </div>
          <div v-if="selectedRequest.justification">
            <strong>Justification :</strong>
            <p class="mt-2 p-3 bg-gray-50 rounded">{{ selectedRequest.justification }}</p>
          </div>
        </div>

        <div v-if="selectedRequest.status === 'pending'" class="flex space-x-3 mt-6">
          <BaseButton 
            variant="success"
            :disabled="actionLoading"
            @click="approveRequest(selectedRequest.id)"
          >
            {{ actionLoading ? 'En cours...' : 'Approuver' }}
          </BaseButton>
          <BaseButton 
            variant="danger"
            :disabled="actionLoading"
            @click="rejectRequest(selectedRequest.id)"
          >
            {{ actionLoading ? 'En cours...' : 'Rejeter' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ApiService from '@/services/api'

export default {
  name: 'MerchantRequests',
  components: {
    BaseTable,
    BaseButton
  },
  setup() {
    const requests = ref([])
    const loading = ref(false)
    const selectedRequest = ref(null)
    const actionLoading = ref(false) // Pour indiquer qu'une action est en cours
    let refreshInterval = null // Pour l'actualisation automatique

    const tableHeaders = ref([
      { key: 'requested_merchant_name', label: 'Nom du marchand' },
      { key: 'user.email', label: 'Utilisateur' },
      { key: 'status', label: 'Statut' },
      { key: 'created_at', label: 'Date de création' },
      { key: 'actions', label: 'Actions' }
    ])

    const loadRequests = async () => {
      loading.value = true
      try {
        const response = await ApiService.get('/admin/merchant-requests')
        // L'API retourne { success: true, data: { requests: [...], pagination: {...} } }
        requests.value = response.data?.requests || response.requests || response.data || []
        console.log('✅ Demandes chargées:', requests.value.length)
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error)
        requests.value = []
      } finally {
        loading.value = false
      }
    }

    const approveRequest = async (requestId) => {
      if (actionLoading.value) return // Éviter les clics multiples
      
      try {
        actionLoading.value = true
        console.log('🔄 Approbation de la demande:', requestId)
        const response = await ApiService.post(`/admin/merchant-requests/${requestId}/approve`)
        console.log('✅ Réponse approbation:', response)
        
        // Fermer le modal d'abord
        closeModal()
        
        // Recharger les données avec un petit délai pour laisser le backend se mettre à jour
        setTimeout(async () => {
          await loadRequests()
          console.log('✅ Demande approuvée et données rechargées')
        }, 500)
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'approbation:', error)
        alert('Erreur lors de l\'approbation de la demande')
      } finally {
        actionLoading.value = false
      }
    }

    const rejectRequest = async (requestId) => {
      if (actionLoading.value) return // Éviter les clics multiples
      
      try {
        actionLoading.value = true
        console.log('🔄 Rejet de la demande:', requestId)
        const response = await ApiService.post(`/admin/merchant-requests/${requestId}/reject`)
        console.log('✅ Réponse rejet:', response)
        
        // Fermer le modal d'abord
        closeModal()
        
        // Recharger les données avec un petit délai pour laisser le backend se mettre à jour
        setTimeout(async () => {
          await loadRequests()
          console.log('✅ Demande rejetée et données rechargées')
        }, 500)
        
      } catch (error) {
        console.error('❌ Erreur lors du rejet:', error)
        alert('Erreur lors du rejet de la demande')
      } finally {
        actionLoading.value = false
      }
    }

    const viewRequest = (request) => {
      selectedRequest.value = request
    }

    const closeModal = () => {
      selectedRequest.value = null
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'pending':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'
        case 'approved':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
        case 'rejected':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
        default:
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'pending':
          return 'En attente'
        case 'approved':
          return 'Approuvé'
        case 'rejected':
          return 'Rejeté'
        default:
          return status
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadRequests()
      
      // Actualisation automatique toutes les 30 secondes
      refreshInterval = setInterval(() => {
        if (!actionLoading.value) { // Ne pas actualiser pendant une action
          loadRequests()
        }
      }, 30000)
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      requests,
      loading,
      actionLoading,
      selectedRequest,
      tableHeaders,
      loadRequests,
      approveRequest,
      rejectRequest,
      viewRequest,
      closeModal,
      getStatusClass,
      getStatusText,
      formatDate
    }
  }
}
</script>
