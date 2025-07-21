import { ref, onMounted, onUnmounted, computed } from 'vue'
import websocketService from '../services/websocketService'

export function useRealTimeUpdates() {
  const isConnected = ref(false)
  const notifications = ref([])
  const lastUpdate = ref(null)

  // Connexion au service WebSocket
  onMounted(() => {
    connectWebSocket()
  })

  // Déconnexion propre
  onUnmounted(() => {
    disconnectWebSocket()
  })

  const connectWebSocket = () => {
    const connected = websocketService.connect()
    if (connected) {
      isConnected.value = websocketService.connected.value
      notifications.value = websocketService.notifications.value
    }
  }

  const disconnectWebSocket = () => {
    websocketService.disconnect()
    isConnected.value = false
  }

  // Écouter un type d'événement spécifique
  const listenTo = (eventType, callback) => {
    websocketService.on(eventType, callback)
  }

  // Arrêter d'écouter un événement
  const stopListening = (eventType) => {
    websocketService.off(eventType)
  }

  // Notifications non lues
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Notifications récentes
  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 5)
  })

  // Marquer comme lu
  const markAsRead = (notificationId) => {
    websocketService.markAsRead(notificationId)
  }

  // Marquer tout comme lu
  const markAllAsRead = () => {
    websocketService.markAllAsRead()
  }

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    websocketService.removeNotification(notificationId)
  }

  return {
    isConnected,
    notifications,
    lastUpdate,
    unreadCount,
    recentNotifications,
    connectWebSocket,
    disconnectWebSocket,
    listenTo,
    stopListening,
    markAsRead,
    markAllAsRead,
    removeNotification
  }
}

// Composable spécialisé pour les transactions en temps réel
export function useRealTimeTransactions() {
  const { listenTo, stopListening, ...base } = useRealTimeUpdates()
  const liveTransactions = ref([])
  const transactionStats = ref({
    todayCount: 0,
    todayRevenue: 0,
    successRate: 0
  })

  onMounted(() => {
    // Écouter les nouvelles transactions
    listenTo('transaction.created', (data) => {
      liveTransactions.value.unshift(data.data)
      updateStats('created', data.data)
    })

    // Écouter les mises à jour de transaction
    listenTo('transaction.updated', (data) => {
      const index = liveTransactions.value.findIndex(t => t.id === data.data.id)
      if (index > -1) {
        liveTransactions.value[index] = { ...liveTransactions.value[index], ...data.data }
      }
      updateStats('updated', data.data)
    })

    // Écouter les statistiques en temps réel
    listenTo('dashboard.stats.updated', (data) => {
      transactionStats.value = { ...transactionStats.value, ...data.data }
    })
  })

  onUnmounted(() => {
    stopListening('transaction.created')
    stopListening('transaction.updated')
    stopListening('dashboard.stats.updated')
  })

  const updateStats = (type, transaction) => {
    const today = new Date().toDateString()
    const transactionDate = new Date(transaction.created_at).toDateString()
    
    if (transactionDate === today) {
      if (type === 'created') {
        transactionStats.value.todayCount++
      }
      
      if (transaction.status === 'success') {
        transactionStats.value.todayRevenue += parseFloat(transaction.amount || 0)
      }
    }
  }

  return {
    ...base,
    liveTransactions,
    transactionStats
  }
}

// Composable pour les demandes marchands en temps réel (admin)
export function useRealTimeMerchantRequests() {
  const { listenTo, stopListening, ...base } = useRealTimeUpdates()
  const liveMerchantRequests = ref([])
  const pendingRequestsCount = ref(0)

  onMounted(() => {
    // Écouter les nouvelles demandes
    listenTo('merchant.request.created', (data) => {
      liveMerchantRequests.value.unshift(data.data)
      if (data.data.status === 'pending') {
        pendingRequestsCount.value++
      }
    })

    // Écouter les mises à jour de demandes
    listenTo('merchant.request.updated', (data) => {
      const index = liveMerchantRequests.value.findIndex(r => r.id === data.data.id)
      if (index > -1) {
        const oldStatus = liveMerchantRequests.value[index].status
        liveMerchantRequests.value[index] = { ...liveMerchantRequests.value[index], ...data.data }
        
        // Mettre à jour le compteur
        if (oldStatus === 'pending' && data.data.status !== 'pending') {
          pendingRequestsCount.value--
        } else if (oldStatus !== 'pending' && data.data.status === 'pending') {
          pendingRequestsCount.value++
        }
      }
    })
  })

  onUnmounted(() => {
    stopListening('merchant.request.created')
    stopListening('merchant.request.updated')
  })

  return {
    ...base,
    liveMerchantRequests,
    pendingRequestsCount
  }
}
