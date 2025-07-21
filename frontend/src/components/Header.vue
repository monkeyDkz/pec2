<template>
  <header class="bg-white shadow-sm border-b border-gray-200" :class="headerClasses">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo et titre -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <h1 class="text-xl font-bold text-indigo-600">{{ title }}</h1>
              <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
            </div>
          </router-link>
          
          <!-- Badges de rôle -->
          <div v-if="userRole" class="ml-4 flex items-center space-x-2">
            <span 
              :class="getRoleBadgeClass(userRole)"
              class="px-3 py-1 text-sm font-medium rounded-full"
            >
              {{ getRoleText(userRole) }}
            </span>
            
            <!-- Badge d'impersonation -->
            <div v-if="isImpersonating" class="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Mode Admin
            </div>
          </div>
        </div>

        <!-- Navigation principale -->
        <nav v-if="showNavigation" class="hidden md:flex space-x-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              $route.path === item.path ? 'text-indigo-600 bg-indigo-50' : ''
            ]"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Actions utilisateur -->
        <div class="flex items-center space-x-4">
          <!-- Bouton retour admin -->
          <button
            v-if="isImpersonating"
            @click="stopImpersonation"
            class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full hover:bg-indigo-200 transition-colors"
          >
            Retour Admin
          </button>

          <!-- Notifications temps réel -->
          <RealTimeNotifications v-if="isAuthenticated" />

          <!-- Menu utilisateur -->
          <div v-if="isAuthenticated" class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <div :class="getAvatarClass(userRole)">
                <span class="text-sm font-medium">
                  {{ getUserInitial() }}
                </span>
              </div>
              <span class="hidden md:block text-sm font-medium">{{ getUserDisplayName() }}</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown menu utilisateur -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
            >
              <router-link
                v-for="item in userMenuItems"
                :key="item.path"
                :to="item.path"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {{ item.name }}
              </router-link>
              
              <hr class="my-1" />
              
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <!-- Boutons d'authentification pour invités -->
          <div v-else class="flex items-center space-x-4">
            <!-- Bouton test API -->
            <button
              @click="testApi"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
            >
              Test API
            </button>
            <router-link
              to="/login"
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Connexion
            </router-link>
            <router-link
              to="/register"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Inscription
            </router-link>
          </div>

          <!-- Menu mobile -->
          <div class="md:hidden">
            <button
              @click="toggleMobileMenu"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 rounded-md"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Menu mobile -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200">
        <div class="space-y-2">
          <!-- Navigation mobile -->
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            {{ item.name }}
          </router-link>
          
          <!-- Actions utilisateur mobile -->
          <div v-if="!isAuthenticated" class="pt-4 border-t border-gray-200">
            <router-link
              to="/login"
              class="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium"
              @click="mobileMenuOpen = false"
            >
              Connexion
            </router-link>
            <router-link
              to="/register"
              class="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium"
              @click="mobileMenuOpen = false"
            >
              Inscription
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AuthService from '../services/auth'
import RealTimeNotifications from './common/RealTimeNotifications.vue'

export default {
  name: 'AppHeader',
  components: {
    RealTimeNotifications
  },
  props: {
    title: {
      type: String,
      default: 'Payment Platform'
    },
    subtitle: {
      type: String,
      default: ''
    },
    showNavigation: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      default: 'default', // 'default', 'admin', 'merchant'
      validator: value => ['default', 'admin', 'merchant'].includes(value)
    }
  },
  
  setup(props) {
    const store = useStore()
    const router = useRouter()

    // États locaux
    const userMenuOpen = ref(false)
    const notificationsOpen = ref(false)
    const mobileMenuOpen = ref(false)

    // États calculés
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const userRole = computed(() => store.getters.userRole)
    const user = computed(() => store.getters.user)
    const isImpersonating = computed(() => store.getters.isImpersonating)
    const notifications = computed(() => store.getters.notifications)
    const unreadNotifications = computed(() => 
      notifications.value.filter(n => !n.read).length
    )

    const headerClasses = computed(() => {
      const baseClasses = []
      
      switch (props.variant) {
        case 'admin':
          baseClasses.push('bg-indigo-50 border-indigo-200')
          break
        case 'merchant':
          baseClasses.push('bg-green-50 border-green-200')
          break
        default:
          baseClasses.push('bg-white border-gray-200')
      }
      
      return baseClasses.join(' ')
    })

    // Navigation selon le rôle
    const navigationItems = computed(() => {
      if (!isAuthenticated.value) {
        return [
          { name: 'Accueil', path: '/' },
          { name: 'Devenir marchand', path: '/apply-merchant' }
        ]
      }

      switch (userRole.value) {
        case 'admin':
          return [
            { name: 'Dashboard', path: '/admin' },
            { name: 'Marchands', path: '/admin?tab=merchants' },
            { name: 'Transactions', path: '/admin?tab=overview' }
          ]
        case 'merchant':
          return [
            { name: 'Dashboard', path: '/merchant' },
            { name: 'Transactions', path: '/merchant?tab=transactions' },
            { name: 'API', path: '/merchant?tab=credentials' }
          ]
        default:
          return [{ name: 'Accueil', path: '/' }]
      }
    })

    const userMenuItems = computed(() => {
      const items = [
        { name: 'Profil', path: '/profile' },
        { name: 'Paramètres', path: '/settings' }
      ]

      if (userRole.value === 'admin') {
        items.unshift({ name: 'Administration', path: '/admin' })
      } else if (userRole.value === 'merchant') {
        items.unshift({ name: 'Dashboard', path: '/merchant' })
      }

      return items
    })

    // Méthodes utilitaires
    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-indigo-100 text-indigo-700',
        merchant: 'bg-green-100 text-green-700',
        user: 'bg-gray-100 text-gray-700'
      }
      return classes[role] || classes.user
    }

    const getRoleText = (role) => {
      const texts = {
        admin: 'Admin',
        merchant: 'Marchand',
        user: 'Utilisateur'
      }
      return texts[role] || 'Utilisateur'
    }

    const getAvatarClass = (role) => {
      const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center'
      const roleClasses = {
        admin: 'bg-indigo-100 text-indigo-600',
        merchant: 'bg-green-100 text-green-600',
        user: 'bg-gray-100 text-gray-600'
      }
      return `${baseClasses} ${roleClasses[role] || roleClasses.user}`
    }

    const getUserInitial = () => {
      if (user.value?.first_name) {
        return user.value.first_name.charAt(0).toUpperCase()
      }
      if (user.value?.email) {
        return user.value.email.charAt(0).toUpperCase()
      }
      return userRole.value?.charAt(0).toUpperCase() || 'U'
    }

    const getUserDisplayName = () => {
      if (user.value?.first_name && user.value?.last_name) {
        return `${user.value.first_name} ${user.value.last_name}`
      }
      if (user.value?.first_name) {
        return user.value.first_name
      }
      if (user.value?.email) {
        return user.value.email
      }
      return getRoleText(userRole.value)
    }

    const getNotificationIconClass = (type) => {
      const classes = {
        success: 'flex-shrink-0 w-5 h-5 text-green-400',
        error: 'flex-shrink-0 w-5 h-5 text-red-400',
        warning: 'flex-shrink-0 w-5 h-5 text-yellow-400',
        info: 'flex-shrink-0 w-5 h-5 text-blue-400'
      }
      return classes[type] || classes.info
    }

    const formatNotificationDate = (timestamp) => {
      const now = new Date()
      const date = new Date(timestamp)
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return 'À l\'instant'
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `Il y a ${diffInHours}h`
      
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays}j`
    }

    // Actions
    const toggleUserMenu = () => {
      userMenuOpen.value = !userMenuOpen.value
      notificationsOpen.value = false
    }

    const toggleNotifications = () => {
      notificationsOpen.value = !notificationsOpen.value
      userMenuOpen.value = false
    }

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }

    const handleLogout = async () => {
      userMenuOpen.value = false
      await AuthService.logout()
      router.push('/')
    }

    const stopImpersonation = async () => {
      await AuthService.stopImpersonation()
      router.push('/admin')
    }

    const markAsRead = (notificationId) => {
      store.dispatch('removeNotification', notificationId)
    }

    // Test API pour vérifier la connexion
    const testApi = async () => {
      try {
        console.log('🧪 Test API - Démarrage...')
        
        // Test 1: Health check avec fetch direct
        console.log('📡 Appel API Health...')
        const healthResponse = await fetch('http://localhost:3000/health')
        const healthData = await healthResponse.json()
        console.log('✅ Health check réussi:', healthData)
        
        // Test 2: Tentative d'inscription avec fetch direct
        console.log('📡 Appel API Register...')
        const registerData = {
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User'
        }
        
        try {
          const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
          })
          const registerResponseData = await registerResponse.json()
          console.log('✅ Inscription réussie:', registerResponseData)
        } catch (registerError) {
          console.log('ℹ️ Erreur inscription (attendue si l\'utilisateur existe):', registerError)
        }
        
        store.dispatch('addNotification', {
          type: 'success',
          title: 'Test API',
          message: 'Connexion backend réussie ! Voir la console pour plus de détails.'
        })
        
      } catch (error) {
        console.error('❌ Erreur test API:', error)
        store.dispatch('addNotification', {
          type: 'error',
          title: 'Erreur API',
          message: `Connexion échouée: ${error.message}`
        })
      }
    }

    // Fermer les menus en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      const target = event.target
      
      if (!target.closest('.relative')) {
        userMenuOpen.value = false
        notificationsOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      userMenuOpen,
      notificationsOpen,
      mobileMenuOpen,
      isAuthenticated,
      userRole,
      user,
      isImpersonating,
      notifications,
      unreadNotifications,
      headerClasses,
      navigationItems,
      userMenuItems,
      getRoleBadgeClass,
      getRoleText,
      getAvatarClass,
      getUserInitial,
      getUserDisplayName,
      getNotificationIconClass,
      formatNotificationDate,
      toggleUserMenu,
      toggleNotifications,
      toggleMobileMenu,
      handleLogout,
      stopImpersonation,
      markAsRead,
      testApi
    }
  }
}
</script>

<style scoped>
/* Transitions fluides */
.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Animation d'apparition des dropdowns */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Style pour les notifications non lues */
.notification-unread {
  position: relative;
}

.notification-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 100%;
  background-color: #3b82f6;
}
</style>