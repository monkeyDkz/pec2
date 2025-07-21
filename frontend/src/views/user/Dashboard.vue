<template>
  <AppLayout>
    <template #sidebar-content>
      <!-- Navigation pour utilisateur simple -->
      <div class="nav-section">
        <h4>Tableau de bord</h4>
        <router-link to="/dashboard" class="nav-item">
          <HomeIcon class="nav-icon" />
          <span v-if="!$parent.sidebarCollapsed">Accueil</span>
        </router-link>
      </div>

      <div class="nav-section">
        <h4>Marchands</h4>
        <router-link to="/dashboard" class="nav-item" v-if="!hasMerchants">
          <PlusIcon class="nav-icon" />
          <span v-if="!$parent.sidebarCollapsed">Rejoindre/Créer</span>
        </router-link>
        <div v-if="hasRequests" class="nav-item">
          <ClockIcon class="nav-icon" />
          <span v-if="!$parent.sidebarCollapsed">Mes demandes</span>
          <span class="badge">{{ userRequests.length }}</span>
        </div>
      </div>
    </template>

    <div class="user-dashboard">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Bienvenue, {{ user?.first_name }} !</h1>
          <p class="header-subtitle">Gérez vos marchands et suivez vos demandes</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <LoadingSpinner size="large" message="Chargement de vos informations..." />
      </div>

      <!-- Main Content -->
      <div v-else class="dashboard-content">
        
        <!-- État : Aucun marchand ni demande -->
        <div v-if="!hasMerchants && !hasRequests" class="empty-state">
          <div class="empty-state-content">
            <div class="empty-icon">
              <BuildingStorefrontIcon class="h-24 w-24" />
            </div>
            <h2>Commencez votre parcours</h2>
            <p>Pour utiliser notre plateforme de paiement, vous devez être affilié à un marchand.</p>
            <div class="empty-actions">
              <button @click="showMerchantSelection = true" class="btn-primary-large">
                <PlusIcon class="h-5 w-5" />
                Commencer
              </button>
            </div>
          </div>
        </div>

        <!-- Section : Demandes en cours -->
        <div v-if="hasRequests" class="section">
          <div class="section-header">
            <h2>Vos demandes en cours</h2>
            <StatusBadge :status="`${pendingRequestsCount} en attente`" type="warning" />
          </div>
          <div class="requests-grid">
            <div 
              v-for="request in userRequests" 
              :key="request.id"
              class="request-card"
            >
              <div class="request-header">
                <h3>{{ getRequestTitle(request) }}</h3>
                <StatusBadge :status="request.status" />
              </div>
              <div class="request-details">
                <p v-if="request.type === 'create_merchant'">
                  <strong>Nom du marchand :</strong> {{ request.merchant_name }}
                </p>
                <p v-else-if="request.type === 'join_merchant'">
                  <strong>Marchand :</strong> {{ request.merchant?.name }}
                </p>
                <p class="request-date">
                  Demandé le {{ formatDate(request.created_at) }}
                </p>
              </div>
              <div v-if="request.admin_notes" class="request-notes">
                <p><strong>Notes :</strong> {{ request.admin_notes }}</p>
              </div>
            </div>
          </div>
          
          <div class="section-actions">
            <button @click="showMerchantSelection = true" class="btn-secondary">
              <PlusIcon class="h-4 w-4" />
              Nouvelle demande
            </button>
            <button @click="refreshRequests" class="btn-outline">
              <ArrowPathIcon class="h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>

        <!-- Section : Marchands actifs -->
        <div v-if="hasMerchants" class="section">
          <div class="section-header">
            <h2>Vos marchands</h2>
            <span class="merchant-count">{{ userMerchants.length }} marchand(s)</span>
          </div>
          <div class="merchants-grid">
            <div 
              v-for="merchant in userMerchants" 
              :key="merchant.id"
              class="merchant-card"
              @click="goToMerchant(merchant.id)"
            >
              <div class="merchant-header">
                <div class="merchant-avatar">
                  {{ getInitials(merchant.name) }}
                </div>
                <div class="merchant-info">
                  <h3>{{ merchant.name }}</h3>
                  <p>{{ merchant.description || 'Aucune description' }}</p>
                </div>
                <StatusBadge :status="merchant.status" />
              </div>
              
              <div class="merchant-details">
                <div class="detail-item">
                  <span class="detail-label">Rôle :</span>
                  <span class="role-badge">{{ getRoleLabel(merchant.user_role) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Type :</span>
                  <span>{{ merchant.business_type || 'Non spécifié' }}</span>
                </div>
              </div>

              <div class="merchant-actions">
                <button class="btn-primary-small">
                  Accéder au dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section : Actions rapides -->
        <div v-if="hasMerchants || hasRequests" class="section">
          <div class="section-header">
            <h2>Actions rapides</h2>
          </div>
          <div class="quick-actions">
            <button @click="showMerchantSelection = true" class="action-card">
              <PlusIcon class="action-icon" />
              <span>Nouvelle demande</span>
            </button>
            <button @click="refreshData" class="action-card">
              <ArrowPathIcon class="action-icon" />
              <span>Actualiser</span>
            </button>
            <router-link to="/profile" class="action-card">
              <UserIcon class="action-icon" />
              <span>Mon profil</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal : Sélection marchand -->
    <div v-if="showMerchantSelection" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Rejoindre ou créer un marchand</h2>
          <button @click="closeModal" class="modal-close">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-body">
          <MerchantSelection @request-created="handleRequestCreated" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import ApiService from '@/services/api'
import AppLayout from '@/components/common/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import MerchantSelection from '@/components/user/MerchantSelection.vue'
import {
  HomeIcon,
  PlusIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// Reactive data
const loading = ref(true)
const userRequests = ref([])
const userMerchants = ref([])
const showMerchantSelection = ref(false)

// Computed
const user = computed(() => authStore.user)
const hasRequests = computed(() => userRequests.value.length > 0)
const hasMerchants = computed(() => userMerchants.value.length > 0)
const pendingRequestsCount = computed(() => 
  userRequests.value.filter(req => req.status === 'pending').length
)

// Methods
const loadUserData = async () => {
  try {
    loading.value = true
    
    // Charger les demandes en cours
    const requestsResponse = await ApiService.getUserRequests()
    userRequests.value = requestsResponse.data

    // Charger les marchands
    const merchantsResponse = await ApiService.getUserMerchants()
    userMerchants.value = merchantsResponse.data

  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger vos informations'
    })
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadUserData()
  notificationStore.addNotification({
    type: 'success',
    title: 'Actualisé',
    message: 'Vos informations ont été mises à jour'
  })
}

const refreshRequests = async () => {
  try {
    const response = await ApiService.getUserRequests()
    userRequests.value = response.data
    notificationStore.addNotification({
      type: 'info',
      title: 'Actualisé',
      message: 'Vos demandes ont été mises à jour'
    })
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de mettre à jour vos demandes'
    })
  }
}

const goToMerchant = (merchantId) => {
  router.push(`/merchant/${merchantId}`)
}

const getRequestTitle = (request) => {
  return request.type === 'create_merchant' 
    ? 'Demande de création de marchand'
    : 'Demande d\'adhésion à un marchand'
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrateur',
    manager: 'Gestionnaire',
    developer: 'Développeur',
    viewer: 'Visualiseur'
  }
  return labels[role] || role
}

const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleRequestCreated = () => {
  showMerchantSelection.value = false
  refreshData()
  notificationStore.addNotification({
    type: 'success',
    title: 'Demande envoyée',
    message: 'Votre demande a été envoyée avec succès'
  })
}

const closeModal = () => {
  showMerchantSelection.value = false
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.user-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.header-subtitle {
  color: #6b7280;
  font-size: 1.125rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.empty-state-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.empty-state-content p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* Sections */
.section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.merchant-count {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.request-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.request-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.request-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  margin-right: 1rem;
}

.request-details p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.request-date {
  font-size: 0.75rem !important;
  color: #9ca3af !important;
}

.request-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.request-notes p {
  font-size: 0.875rem;
  color: #374151;
}

/* Merchants Grid */
.merchants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.merchant-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.merchant-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.merchant-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.merchant-avatar {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.merchant-info {
  flex: 1;
}

.merchant-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.merchant-info p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.merchant-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.role-badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.merchant-actions {
  display: flex;
  justify-content: flex-end;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-card:hover {
  background-color: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
}

.action-icon {
  width: 2rem;
  height: 2rem;
}

/* Section Actions */
.section-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

/* Buttons */
.btn-primary-large {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary-large:hover {
  background-color: #2563eb;
}

.btn-primary-small {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary-small:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-outline {
  background: none;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .requests-grid,
  .merchants-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
