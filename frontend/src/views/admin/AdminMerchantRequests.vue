<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Demandes de Marchands</h1>
      <p class="text-gray-600 mt-2">Gérez les demandes de création de comptes marchands</p>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <select v-model="selectedStatus" class="border rounded px-3 py-2">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvé</option>
          <option value="rejected">Rejeté</option>
        </select>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Rechercher par nom ou email..."
          class="border rounded px-3 py-2 flex-1 min-w-[200px]"
        />
        <BaseButton @click="fetchRequests" variant="secondary">
          🔄 Actualiser
        </BaseButton>
      </div>
    </div>

    <!-- Liste des demandes -->
    <div class="bg-white rounded-lg shadow">
      <BaseTable 
        :headers="tableHeaders" 
        :data="filteredRequests"
        v-if="!loading && filteredRequests.length > 0"
      >
        <template #companyName="{ item }">
          <div>
            <p class="font-medium">{{ item.companyName }}</p>
            <p class="text-sm text-gray-500">{{ item.email }}</p>
          </div>
        </template>

        <template #businessType="{ item }">
          <span class="px-2 py-1 bg-gray-100 rounded text-sm">
            {{ item.businessType }}
          </span>
        </template>

        <template #status="{ item }">
          <StatusBadge :status="item.status" :label="getStatusLabel(item.status)" />
        </template>

        <template #createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-2">
            <BaseButton size="sm" variant="primary" @click="viewRequest(item)">
              👁️ Voir
            </BaseButton>
            <BaseButton 
              v-if="item.status === 'pending'" 
              size="sm" 
              variant="success" 
              @click="approveRequest(item)"
            >
              ✅ Approuver
            </BaseButton>
            <BaseButton 
              v-if="item.status === 'pending'" 
              size="sm" 
              variant="danger" 
              @click="showRejectModal(item)"
            >
              ❌ Rejeter
            </BaseButton>
          </div>
        </template>
      </BaseTable>

      <!-- État de chargement -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">Chargement...</p>
      </div>

      <!-- Aucune donnée -->
      <div v-if="!loading && filteredRequests.length === 0" class="p-8 text-center text-gray-500">
        Aucune demande trouvée
      </div>
    </div>

    <!-- Modal de détails -->
    <Modal 
      :show="showDetailModal" 
      :title="`Détails - ${selectedRequest?.companyName}`"
      @close="closeDetailModal"
      @confirm="closeDetailModal"
      confirm-text="Fermer"
    >
      <div v-if="selectedRequest" class="space-y-4">
        <div>
          <label class="font-medium">Entreprise:</label>
          <p>{{ selectedRequest.companyName }}</p>
        </div>
        <div>
          <label class="font-medium">Email:</label>
          <p>{{ selectedRequest.email }}</p>
        </div>
        <div>
          <label class="font-medium">Type d'entreprise:</label>
          <p>{{ selectedRequest.businessType }}</p>
        </div>
        <div>
          <label class="font-medium">Description:</label>
          <p>{{ selectedRequest.businessDescription }}</p>
        </div>
      </div>
    </Modal>

    <!-- Modal de rejet -->
    <Modal 
      :show="showRejectModalDialog" 
      title="Rejeter la demande"
      @close="closeRejectModal"
      @confirm="rejectRequest"
      confirm-text="Rejeter"
    >
      <div>
        <label class="block font-medium mb-2">Raison du rejet:</label>
        <textarea 
          v-model="rejectReason" 
          class="w-full border rounded px-3 py-2 h-32"
          placeholder="Expliquez pourquoi cette demande est rejetée..."
        ></textarea>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'AdminMerchantRequests',
  components: {
    BaseTable,
    StatusBadge,
    BaseButton,
    Modal
  },
  setup() {
    const store = useStore()
    
    // État local
    const selectedStatus = ref('')
    const searchTerm = ref('')
    const showDetailModal = ref(false)
    const showRejectModalDialog = ref(false)
    const selectedRequest = ref(null)
    const rejectReason = ref('')

    // État du store
    const loading = computed(() => store.state.admin?.loading || false)
    const merchantRequests = computed(() => store.state.admin?.merchantRequests || [])

    // Configuration du tableau
    const tableHeaders = ref([
      { key: 'companyName', label: 'Entreprise' },
      { key: 'businessType', label: 'Type' },
      { key: 'status', label: 'Statut' },
      { key: 'createdAt', label: 'Date de demande' },
      { key: 'actions', label: 'Actions' }
    ])

    // Données filtrées
    const filteredRequests = computed(() => {
      let filtered = merchantRequests.value

      if (selectedStatus.value) {
        filtered = filtered.filter(request => request.status === selectedStatus.value)
      }

      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(request => 
          request.companyName?.toLowerCase().includes(term) ||
          request.email?.toLowerCase().includes(term)
        )
      }

      return filtered
    })

    // Méthodes
    const fetchRequests = async () => {
      try {
        await store.dispatch('admin/fetchMerchantRequests')
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error)
      }
    }

    const viewRequest = (request) => {
      selectedRequest.value = request
      showDetailModal.value = true
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedRequest.value = null
    }

    const approveRequest = async (request) => {
      try {
        console.log('🔄 Approbation de la demande:', request.id, request.requested_merchant_name)
        const result = await store.dispatch('admin/approveMerchantRequest', request.id)
        console.log('✅ Demande approuvée:', result)
        console.log('✅ Rechargement automatique en cours...')
      } catch (error) {
        console.error('❌ Erreur lors de l\'approbation:', error)
        alert('Erreur lors de l\'approbation de la demande')
      }
    }

    const showRejectModal = (request) => {
      selectedRequest.value = request
      showRejectModalDialog.value = true
      rejectReason.value = ''
    }

    const closeRejectModal = () => {
      showRejectModalDialog.value = false
      selectedRequest.value = null
      rejectReason.value = ''
    }

    const rejectRequest = async () => {
      if (!rejectReason.value.trim()) {
        alert('Veuillez indiquer une raison pour le rejet')
        return
      }

      try {
        await store.dispatch('admin/rejectMerchantRequest', {
          requestId: selectedRequest.value.id,
          reason: rejectReason.value
        })
        
        console.log('Demande rejetée:', selectedRequest.value.companyName)
        closeRejectModal()
      } catch (error) {
        console.error('Erreur lors du rejet:', error)
      }
    }

    const getStatusLabel = (status) => {
      const labels = {
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté'
      }
      return labels[status] || status
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    }

    // Chargement initial
    onMounted(() => {
      fetchRequests()
    })

    return {
      selectedStatus,
      searchTerm,
      showDetailModal,
      showRejectModalDialog,
      selectedRequest,
      rejectReason,
      loading,
      tableHeaders,
      filteredRequests,
      fetchRequests,
      viewRequest,
      closeDetailModal,
      approveRequest,
      showRejectModal,
      closeRejectModal,
      rejectRequest,
      getStatusLabel,
      formatDate
    }
  }
}
</script>