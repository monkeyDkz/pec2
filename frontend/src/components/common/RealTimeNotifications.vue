<template>
  <div class="relative">
    <!-- Bouton notifications -->
    <button
      @click="showNotifications = !showNotifications"
      class="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      :class="{ 'bg-gray-100': showNotifications }"
    >
      <!-- Icône cloche -->
      <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      <!-- Badge de notifications non lues -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
      
      <!-- Indicateur de connexion WebSocket -->
      <span
        class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full"
        :class="isConnected ? 'bg-green-400' : 'bg-red-400'"
        :title="isConnected ? 'Temps réel connecté' : 'Temps réel déconnecté'"
      ></span>
    </button>

    <!-- Dropdown des notifications -->
    <div
      v-if="showNotifications"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      @click.stop
    >
      <!-- En-tête -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
        <div class="flex space-x-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Tout marquer comme lu
          </button>
          <button
            @click="showNotifications = false"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Statut de connexion -->
      <div
        v-if="!isConnected"
        class="px-4 py-2 bg-yellow-50 border-b border-yellow-200"
      >
        <div class="flex items-center text-yellow-700">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm">Reconnexion au temps réel...</span>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="recentNotifications.length === 0" class="p-4 text-center text-gray-500">
          Aucune notification récente
        </div>
        
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="border-b border-gray-100 last:border-b-0"
        >
          <div
            class="p-4 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <!-- Message de la notification -->
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.message }}
                </p>
                
                <!-- Timestamp -->
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatTime(notification.timestamp) }}
                </p>
                
                <!-- Détails additionnels -->
                <div v-if="notification.data" class="mt-2 text-xs text-gray-600">
                  <span v-if="notification.data.amount" class="font-medium">
                    {{ formatCurrency(notification.data.amount) }}
                  </span>
                  <span v-if="notification.data.reference" class="ml-2">
                    Réf: {{ notification.data.reference }}
                  </span>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center ml-2">
                <!-- Indicateur non lu -->
                <span
                  v-if="!notification.read"
                  class="w-2 h-2 bg-blue-500 rounded-full mr-2"
                ></span>
                
                <!-- Bouton supprimer -->
                <button
                  @click.stop="removeNotification(notification.id)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pied -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <router-link
          to="/notifications"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          @click="showNotifications = false"
        >
          Voir toutes les notifications →
        </router-link>
      </div>
    </div>

    <!-- Overlay pour fermer -->
    <div
      v-if="showNotifications"
      class="fixed inset-0 z-40"
      @click="showNotifications = false"
    ></div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRealTimeUpdates } from '@/composables/useRealTimeUpdates'

export default {
  name: 'RealTimeNotifications',
  setup() {
    const router = useRouter()
    const showNotifications = ref(false)
    
    const {
      isConnected,
      notifications,
      unreadCount,
      recentNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification
    } = useRealTimeUpdates()

    // Gérer le clic sur une notification
    const handleNotificationClick = (notification) => {
      // Marquer comme lu
      markAsRead(notification.id)
      
      // Naviguer selon le type de notification
      navigateToRelevantPage(notification)
      
      // Fermer le dropdown
      showNotifications.value = false
    }

    // Navigation selon le type de notification
    const navigateToRelevantPage = (notification) => {
      switch (notification.type) {
        case 'transaction.created':
        case 'transaction.success':
        case 'transaction.failed': {
          if (notification.data?.id) {
            router.push(`/merchant/transactions/${notification.data.id}`)
          } else {
            router.push('/merchant/transactions')
          }
          break
        }
          
        case 'merchant.request.created': {
          router.push('/admin/merchant-requests')
          break
        }
          
        case 'merchant.approved':
        case 'merchant.rejected': {
          router.push('/merchant-selection')
          break
        }
          
        case 'refund.created': {
          router.push('/merchant/transactions')
          break
        }
          
        default: {
          // Navigation par défaut selon le rôle
          const userRole = localStorage.getItem('userRole') || 'user'
          if (userRole === 'admin') {
            router.push('/admin')
          } else {
            router.push('/merchant')
          }
        }
      }
    }    // Formater l'heure relative
    const formatTime = (timestamp) => {
      const now = new Date()
      const time = new Date(timestamp)
      const diffMs = now - time
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) {
        return 'À l\'instant'
      } else if (diffMins < 60) {
        return `Il y a ${diffMins} min`
      } else if (diffHours < 24) {
        return `Il y a ${diffHours}h`
      } else if (diffDays < 7) {
        return `Il y a ${diffDays}j`
      } else {
        return time.toLocaleDateString('fr-FR')
      }
    }

    // Formater la monnaie
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    return {
      showNotifications,
      isConnected,
      notifications,
      unreadCount,
      recentNotifications,
      handleNotificationClick,
      markAllAsRead,
      removeNotification,
      formatTime,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Animation pour le badge */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
