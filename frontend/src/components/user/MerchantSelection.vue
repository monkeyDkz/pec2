<template>
  <div class="merchant-selection">
    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          @click="activeTab = 'join'"
          :class="{ 'tab-active': activeTab === 'join' }"
          class="tab"
        >
          <UserGroupIcon class="h-5 w-5" />
          Rejoindre un marchand
        </button>
        <button 
          @click="activeTab = 'create'"
          :class="{ 'tab-active': activeTab === 'create' }"
          class="tab"
        >
          <PlusIcon class="h-5 w-5" />
          Créer un marchand
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      
      <!-- Onglet : Rejoindre un marchand -->
      <div v-if="activeTab === 'join'" class="tab-panel">
        <div class="panel-header">
          <h3>Marchands disponibles</h3>
          <p>Sélectionnez un marchand existant pour faire une demande d'adhésion</p>
        </div>

        <!-- Loading -->
        <div v-if="loadingMerchants" class="loading-section">
          <LoadingSpinner message="Chargement des marchands disponibles..." />
        </div>

        <!-- Liste des marchands -->
        <div v-else-if="availableMerchants.length > 0" class="merchants-list">
          <div 
            v-for="merchant in availableMerchants" 
            :key="merchant.id"
            class="merchant-item"
            :class="{ 'merchant-selected': selectedMerchant?.id === merchant.id }"
            @click="selectMerchant(merchant)"
          >
            <div class="merchant-avatar">
              {{ getInitials(merchant.name) }}
            </div>
            
            <div class="merchant-info">
              <h4>{{ merchant.name }}</h4>
              <p class="merchant-description">{{ merchant.description || 'Aucune description disponible' }}</p>
              <div class="merchant-meta">
                <span class="business-type">{{ merchant.business_type || 'Non spécifié' }}</span>
                <span class="member-count">{{ merchant.member_count || 0 }} membre(s)</span>
              </div>
            </div>

            <div class="merchant-actions">
              <StatusBadge :status="merchant.status" />
              <button 
                v-if="selectedMerchant?.id === merchant.id"
                @click.stop="requestToJoin"
                class="btn-primary"
                :disabled="submitting"
              >
                <span v-if="submitting">
                  <LoadingSpinner size="small" color="white" />
                </span>
                <span v-else>Demander à rejoindre</span>
              </button>
              <button 
                v-else
                class="btn-outline"
              >
                Sélectionner
              </button>
            </div>
          </div>
        </div>

        <!-- Aucun marchand disponible -->
        <div v-else class="empty-merchants">
          <div class="empty-icon">
            <BuildingStorefrontIcon class="h-16 w-16" />
          </div>
          <h4>Aucun marchand disponible</h4>
          <p>Il n'y a actuellement aucun marchand que vous pouvez rejoindre.</p>
          <button @click="activeTab = 'create'" class="btn-primary">
            Créer votre propre marchand
          </button>
        </div>

        <!-- Formulaire de demande d'adhésion -->
        <div v-if="selectedMerchant && !submitting" class="join-form">
          <h4>Demande d'adhésion à {{ selectedMerchant.name }}</h4>
          <form @submit.prevent="requestToJoin">
            <div class="form-group">
              <label for="requestedRole">Rôle souhaité :</label>
              <select v-model="joinForm.requestedRole" id="requestedRole" required>
                <option value="">Sélectionnez un rôle</option>
                <option value="developer">Développeur</option>
                <option value="manager">Gestionnaire</option>
                <option value="viewer">Visualiseur</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="justification">Justification :</label>
              <textarea 
                v-model="joinForm.justification" 
                id="justification"
                placeholder="Expliquez pourquoi vous souhaitez rejoindre ce marchand..."
                rows="4"
                required
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      <!-- Onglet : Créer un marchand -->
      <div v-if="activeTab === 'create'" class="tab-panel">
        <div class="panel-header">
          <h3>Créer un nouveau marchand</h3>
          <p>Remplissez le formulaire pour faire une demande de création de marchand</p>
        </div>

        <MerchantRequestForm 
          type="create_merchant" 
          @success="handleCreateSuccess"
          @loading="submitting = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import ApiService from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import MerchantRequestForm from './MerchantRequestForm.vue'
import {
  UserGroupIcon,
  PlusIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline'

// Emits
const emit = defineEmits(['request-created'])

// Stores
const notificationStore = useNotificationStore()

// Reactive data
const activeTab = ref('join')
const loadingMerchants = ref(false)
const submitting = ref(false)
const availableMerchants = ref([])
const selectedMerchant = ref(null)

const joinForm = ref({
  requestedRole: '',
  justification: ''
})

// Methods
const loadAvailableMerchants = async () => {
  try {
    loadingMerchants.value = true
    const response = await ApiService.getAvailableMerchants()
    availableMerchants.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des marchands:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger les marchands disponibles'
    })
  } finally {
    loadingMerchants.value = false
  }
}

const selectMerchant = (merchant) => {
  selectedMerchant.value = selectedMerchant.value?.id === merchant.id ? null : merchant
  
  // Reset form when selecting a different merchant
  if (selectedMerchant.value) {
    joinForm.value = {
      requestedRole: '',
      justification: ''
    }
  }
}

const requestToJoin = async () => {
  if (!selectedMerchant.value || !joinForm.value.requestedRole || !joinForm.value.justification) {
    notificationStore.addNotification({
      type: 'warning',
      title: 'Formulaire incomplet',
      message: 'Veuillez remplir tous les champs obligatoires'
    })
    return
  }

  try {
    submitting.value = true
    
    await ApiService.createJoinRequest({
      merchantId: selectedMerchant.value.id,
      requestedRole: joinForm.value.requestedRole,
      justification: joinForm.value.justification
    })

    notificationStore.addNotification({
      type: 'success',
      title: 'Demande envoyée',
      message: `Votre demande pour rejoindre ${selectedMerchant.value.name} a été envoyée`
    })

    emit('request-created')
    
  } catch (error) {
    console.error('Erreur lors de la demande d\'adhésion:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: error.response?.data?.message || 'Impossible d\'envoyer la demande'
    })
  } finally {
    submitting.value = false
  }
}

const handleCreateSuccess = () => {
  emit('request-created')
}

const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

// Lifecycle
onMounted(() => {
  loadAvailableMerchants()
})
</script>

<style scoped>
.merchant-selection {
  max-width: 100%;
}

/* Tabs */
.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #374151;
  background-color: #f9fafb;
}

.tab-active {
  color: #3b82f6 !important;
  border-bottom-color: #3b82f6 !important;
  background-color: #eff6ff;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.panel-header p {
  color: #6b7280;
  line-height: 1.5;
}

/* Loading */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* Merchants List */
.merchants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.merchant-item {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.merchant-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.merchant-selected {
  border-color: #3b82f6 !important;
  background-color: #eff6ff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.merchant-avatar {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.merchant-info {
  flex: 1;
}

.merchant-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.merchant-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.merchant-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.business-type {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.member-count {
  color: #6b7280;
}

.merchant-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

/* Empty State */
.empty-merchants {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-merchants h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-merchants p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

/* Join Form */
.join-form {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.join-form h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: white;
  transition: border-color 0.2s;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Buttons */
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: none;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: #3b82f6;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .merchant-item {
    flex-direction: column;
    text-align: center;
  }
  
  .merchant-actions {
    width: 100%;
    align-items: center;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab {
    text-align: center;
  }
}
</style>
