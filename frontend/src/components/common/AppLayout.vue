<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <h2 v-if="!sidebarCollapsed">Payment Platform</h2>
          <h2 v-else>PP</h2>
        </div>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <ChevronLeftIcon v-if="!sidebarCollapsed" class="h-5 w-5" />
          <ChevronRightIcon v-else class="h-5 w-5" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <slot name="sidebar-content">
          <!-- Default navigation pour utilisateur simple -->
          <div v-if="userRole === 'user'" class="nav-section">
            <router-link to="/dashboard" class="nav-item">
              <HomeIcon class="nav-icon" />
              <span v-if="!sidebarCollapsed">Tableau de bord</span>
            </router-link>
          </div>
        </slot>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" v-if="!sidebarCollapsed">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ user?.first_name }} {{ user?.last_name }}</span>
            <span class="user-role">{{ userRoleLabel }}</span>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <LogoutIcon class="h-5 w-5" />
          <span v-if="!sidebarCollapsed">Déconnexion</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ 'content-expanded': sidebarCollapsed }">
      <!-- Breadcrumb -->
      <div class="breadcrumb-container" v-if="showBreadcrumb">
        <nav class="breadcrumb">
          <router-link 
            v-for="(crumb, index) in breadcrumbs" 
            :key="index"
            :to="crumb.path"
            :class="{ 'breadcrumb-current': index === breadcrumbs.length - 1 }"
          >
            {{ crumb.name }}
          </router-link>
        </nav>
      </div>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <Toast 
        v-for="notification in notifications" 
        :key="notification.id"
        :notification="notification"
        @close="removeNotification"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { 
  HomeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  LogoutIcon 
} from '@heroicons/vue/24/outline'
import Toast from './Toast.vue'

// Props
const props = defineProps({
  showBreadcrumb: {
    type: Boolean,
    default: true
  }
})

// Stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Reactive data
const sidebarCollapsed = ref(false)
const route = useRoute()

// Computed
const user = computed(() => authStore.user)
const userRole = computed(() => authStore.user?.role)
const notifications = computed(() => notificationStore.notifications)

const userInitials = computed(() => {
  if (!user.value) return 'U'
  const first = user.value.first_name?.[0] || ''
  const last = user.value.last_name?.[0] || ''
  return (first + last).toUpperCase()
})

const userRoleLabel = computed(() => {
  const roleLabels = {
    admin: 'Administrateur',
    merchant: 'Marchand',
    user: 'Utilisateur'
  }
  return roleLabels[userRole.value] || 'Utilisateur'
})

const breadcrumbs = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  
  const crumbs = [{ name: 'Accueil', path: '/' }]
  
  let currentPath = ''
  segments.forEach(segment => {
    currentPath += `/${segment}`
    
    // Conversion des segments en noms lisibles
    const segmentNames = {
      dashboard: 'Tableau de bord',
      admin: 'Administration',
      merchant: 'Marchand',
      users: 'Utilisateurs',
      merchants: 'Marchands',
      transactions: 'Transactions',
      settings: 'Paramètres',
      team: 'Équipe',
      integration: 'Intégration'
    }
    
    crumbs.push({
      name: segmentNames[segment] || segment,
      path: currentPath
    })
  })
  
  return crumbs
})

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
}

const logout = () => {
  authStore.logout()
}

const removeNotification = (notificationId) => {
  notificationStore.removeNotification(notificationId)
}

// Lifecycle
onMounted(() => {
  const stored = localStorage.getItem('sidebarCollapsed')
  if (stored) {
    sidebarCollapsed.value = stored === 'true'
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #475569;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #f1f5f9;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: color 0.2s;
}

.sidebar-toggle:hover {
  color: white;
  background-color: #475569;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 0.5rem 1rem;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  position: relative;
}

.nav-item:hover {
  background-color: #475569;
  color: white;
  border-left-color: #3b82f6;
}

.nav-item.router-link-active {
  background-color: #3b82f6;
  color: white;
  border-left-color: #1d4ed8;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.badge {
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  margin-left: auto;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #475569;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background-color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  margin-right: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #f1f5f9;
}

.user-role {
  font-size: 0.75rem;
  color: #94a3b8;
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
  color: white;
}

.logout-btn span {
  margin-left: 0.5rem;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-expanded {
  margin-left: 80px;
}

.breadcrumb-container {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover:not(.breadcrumb-current) {
  color: #3b82f6;
}

.breadcrumb a:not(:last-child)::after {
  content: '/';
  margin-left: 0.5rem;
  color: #94a3b8;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 500;
}

.page-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #f8fafc;
}

/* Toast Container */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .page-content {
    padding: 1rem;
  }
}
</style>
