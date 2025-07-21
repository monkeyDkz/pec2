<template>
  <div id="app" :class="{ dark: isDarkMode }">
    <!-- Loading Global -->
    <div 
      v-if="globalLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-gray-700 dark:text-gray-300 font-medium">Chargement...</span>
        </div>
      </div>
    </div>

    <!-- Header Navigation (pour les pages connectées) -->
    <AppHeader v-if="showHeader" />

    <!-- Sidebar (pour les pages d'administration et marchand) -->
    <Sidebar v-if="showSidebar" />

    <!-- Contenu Principal -->
    <main 
      :class="{
        'ml-64': showSidebar && !isMobile,
        'pt-16': showHeader,
        'min-h-screen': true,
        'bg-gray-50 dark:bg-gray-900': showHeader,
        'bg-white dark:bg-gray-800': !showHeader
      }"
    >
      <!-- Router View avec transition -->
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer (pour les pages publiques) -->
    <AppFooter v-if="showFooter" />

    <!-- Système de Notifications Toast -->
    <NotificationToast />
    
    <!-- Système de Toast Notifications Temps Réel -->
    <ToastNotifications />
  </div>
</template>

<script>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import AppFooter from '@/components/Footer.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import ToastNotifications from '@/components/common/ToastNotifications.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    Sidebar,
    AppFooter,
    NotificationToast,
    ToastNotifications
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    // État réactif
    const globalLoading = computed(() => store.getters.isLoading)
    const isDarkMode = computed(() => false) // Pour l'instant, pas de dark mode
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const userRole = computed(() => store.getters.userRole)
    const isAdmin = computed(() => store.getters.isAdmin)
    const isMerchant = computed(() => store.getters.isMerchant)

    // Responsive
    const isMobile = computed(() => {
      if (typeof window === 'undefined') return false
      return window.innerWidth < 1024
    })

    // Affichage conditionnel des composants
    const showHeader = computed(() => {
      const publicRoutes = ['Home', 'Login', 'Register', 'MerchantApplication', 'NotFound']
      return isAuthenticated.value && !publicRoutes.includes(route.name)
    })

    const showSidebar = computed(() => {
      if (!isAuthenticated.value) return false
      const dashboardRoutes = ['admin', 'merchant']
      return dashboardRoutes.some(prefix => route.path.startsWith(`/${prefix}`))
    })

    const showFooter = computed(() => {
      const publicRoutes = ['Home', 'Login', 'Register', 'MerchantApplication', 'NotFound']
      return publicRoutes.includes(route.name)
    })

    // Lifecycle
    onMounted(async () => {
      // Initialiser l'authentification
      await store.dispatch('initAuth')
      
      // Écouter les changements de taille d'écran
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    const handleResize = () => {
      // Fermer la sidebar sur mobile
      if (window.innerWidth < 1024) {
        store.dispatch('ui/setSidebarOpen', false)
      }
    }

    return {
      globalLoading,
      isDarkMode,
      isAuthenticated,
      userRole,
      isAdmin,
      isMerchant,
      isMobile,
      showHeader,
      showSidebar,
      showFooter
    }
  }
}
</script>

<style>
/* Styles globaux */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #374151;
}

/* Mode sombre */
.dark {
  color-scheme: dark;
}

.dark body {
  background-color: #111827;
  color: #f9fafb;
}

/* Transitions de page */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Utilitaires */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}

.dark .glass-effect {
  background: rgba(17, 24, 39, 0.8);
}

/* Animations personnalisées */
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.float {
  animation: float 3s ease-in-out infinite;
}

/* Focus states améliorés */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

/* Responsive utilities */
@media (max-width: 1024px) {
  .sidebar-open {
    overflow: hidden;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
