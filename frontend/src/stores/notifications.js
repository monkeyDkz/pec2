import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    maxNotifications: 5,
    defaultDuration: 5000
  }),

  getters: {
    visibleNotifications: (state) => {
      return state.notifications
        .filter(notif => notif.visible)
        .slice(-state.maxNotifications)
    },
    
    hasNotifications: (state) => {
      return state.notifications.some(notif => notif.visible)
    },
    
    unreadCount: (state) => {
      return state.notifications.filter(notif => !notif.read).length
    }
  },

  actions: {
    addNotification({ type, title, message, duration = null, persistent = false, actions = [] }) {
      const id = Date.now() + Math.random()
      const notification = {
        id,
        type, // 'success', 'error', 'warning', 'info'
        title,
        message,
        duration: duration || this.defaultDuration,
        persistent,
        actions,
        visible: true,
        read: false,
        createdAt: new Date().toISOString()
      }

      this.notifications.push(notification)

      // Auto-remove si pas persistant
      if (!persistent) {
        setTimeout(() => {
          this.removeNotification(id)
        }, notification.duration)
      }

      return id
    },

    addSuccess(message, options = {}) {
      return this.addNotification({
        type: 'success',
        title: options.title || 'Succès',
        message,
        ...options
      })
    },

    addError(message, options = {}) {
      return this.addNotification({
        type: 'error',
        title: options.title || 'Erreur',
        message,
        persistent: options.persistent || true, // Les erreurs sont persistantes par défaut
        ...options
      })
    },

    addWarning(message, options = {}) {
      return this.addNotification({
        type: 'warning',
        title: options.title || 'Attention',
        message,
        ...options
      })
    },

    addInfo(message, options = {}) {
      return this.addNotification({
        type: 'info',
        title: options.title || 'Information',
        message,
        ...options
      })
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(notif => notif.id === id)
      if (index !== -1) {
        this.notifications[index].visible = false
        
        // Supprimer définitivement après un délai
        setTimeout(() => {
          const finalIndex = this.notifications.findIndex(notif => notif.id === id)
          if (finalIndex !== -1) {
            this.notifications.splice(finalIndex, 1)
          }
        }, 300) // Délai pour l'animation de sortie
      }
    },

    markAsRead(id) {
      const notification = this.notifications.find(notif => notif.id === id)
      if (notification) {
        notification.read = true
      }
    },

    markAllAsRead() {
      this.notifications.forEach(notif => {
        notif.read = true
      })
    },

    clearAll() {
      this.notifications.forEach(notif => {
        if (!notif.persistent) {
          notif.visible = false
        }
      })
    },

    clearAllIncludingPersistent() {
      this.notifications.forEach(notif => {
        notif.visible = false
      })
    },

    // Méthodes utilitaires pour des notifications spécifiques au contexte

    notifyApiError(error, customMessage = null) {
      const message = customMessage || 
                    error.response?.data?.message || 
                    error.message || 
                    'Une erreur inattendue s\'est produite'
      
      return this.addError(message, {
        title: `Erreur ${error.response?.status || 'API'}`,
        persistent: true
      })
    },

    notifyConnectionError() {
      return this.addError(
        'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        {
          title: 'Erreur de connexion',
          persistent: true,
          actions: [
            {
              label: 'Réessayer',
              action: () => window.location.reload()
            }
          ]
        }
      )
    },

    notifyAuthenticationRequired() {
      return this.addWarning(
        'Vous devez vous connecter pour accéder à cette fonctionnalité.',
        {
          title: 'Authentification requise',
          actions: [
            {
              label: 'Se connecter',
              action: () => this.$router.push('/login')
            }
          ]
        }
      )
    },

    notifyPermissionDenied() {
      return this.addError(
        'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
        {
          title: 'Accès refusé',
          persistent: true
        }
      )
    },

    notifyMerchantRequestSubmitted() {
      return this.addSuccess(
        'Votre demande a été envoyée avec succès. Vous recevrez une réponse par email.',
        {
          title: 'Demande envoyée',
          duration: 7000
        }
      )
    },

    notifyTransactionProcessed(transactionId) {
      return this.addSuccess(
        `Transaction ${transactionId} traitée avec succès.`,
        {
          title: 'Transaction complétée'
        }
      )
    },

    notifyMaintenanceMode() {
      return this.addWarning(
        'La plateforme est actuellement en maintenance. Certaines fonctionnalités peuvent être indisponibles.',
        {
          title: 'Maintenance en cours',
          persistent: true
        }
      )
    },

    notifyNewVersion() {
      return this.addInfo(
        'Une nouvelle version de l\'application est disponible.',
        {
          title: 'Mise à jour disponible',
          actions: [
            {
              label: 'Actualiser',
              action: () => window.location.reload()
            }
          ]
        }
      )
    }
  }
})
