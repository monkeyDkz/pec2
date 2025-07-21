import { ref, computed } from 'vue'
import store from '../stores'

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnected = ref(false)
    this.lastMessage = ref(null)
    this.notifications = ref([])
    
    // Callbacks pour différents types d'événements
    this.eventHandlers = new Map()
  }

  // Connexion WebSocket
  connect() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ WebSocket: Pas de token disponible')
        return false
      }

      const wsUrl = `${process.env.VUE_APP_WS_URL || 'ws://localhost:3000'}/ws?token=${token}`
      console.log('🔌 WebSocket: Connexion à', wsUrl)
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket: Connexion établie')
        this.isConnected.value = true
        this.reconnectAttempts = 0
        
        // S'abonner aux événements selon le rôle
        this.subscribeToEvents()
      }
      
      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data))
      }
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket: Connexion fermée')
        this.isConnected.value = false
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket: Erreur', error)
        this.isConnected.value = false
      }
      
      return true
    } catch (error) {
      console.error('❌ WebSocket: Erreur de connexion', error)
      return false
    }
  }

  // S'abonner aux événements selon le rôle
  subscribeToEvents() {
    const userRole = store.getters.userRole
    const userId = store.getters.currentUser?.id
    
    if (userRole === 'admin') {
      // Admin reçoit tous les événements
      this.subscribe('transactions.*')
      this.subscribe('merchants.*')
      this.subscribe('system.*')
    } else if (userRole === 'merchant') {
      // Marchand reçoit ses événements spécifiques
      const merchantId = store.getters.selectedMerchant?.id
      if (merchantId) {
        this.subscribe(`merchant.${merchantId}.*`)
        this.subscribe(`transactions.merchant.${merchantId}.*`)
      }
    } else {
      // Utilisateur normal reçoit ses notifications
      this.subscribe(`user.${userId}.*`)
    }
  }

  // S'abonner à un type d'événement
  subscribe(eventType) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        event: eventType
      }))
      console.log(`📡 WebSocket: Abonné à ${eventType}`)
    }
  }

  // Traiter les messages reçus
  handleMessage(data) {
    console.log('📨 WebSocket: Message reçu', data)
    
    this.lastMessage.value = data
    
    // Ajouter aux notifications
    if (data.type !== 'ping' && data.type !== 'subscription_confirmed') {
      this.addNotification(data)
    }
    
    // Appeler les handlers spécifiques
    const handler = this.eventHandlers.get(data.type)
    if (handler) {
      handler(data)
    }
    
    // Dispatcher dans le store selon le type d'événement
    this.dispatchToStore(data)
  }

  // Ajouter une notification
  addNotification(data) {
    const notification = {
      id: Date.now() + Math.random(),
      type: data.type,
      message: this.formatNotificationMessage(data),
      data: data,
      timestamp: new Date(),
      read: false
    }
    
    this.notifications.value.unshift(notification)
    
    // Limiter à 50 notifications
    if (this.notifications.value.length > 50) {
      this.notifications.value = this.notifications.value.slice(0, 50)
    }
    
    // Afficher toast notification
    this.showToastNotification(notification)
  }

  // Formater le message de notification
  formatNotificationMessage(data) {
    switch (data.type) {
      case 'transaction.created':
        return `💳 Nouvelle transaction: ${data.data.amount}€`
      case 'transaction.success':
        return `✅ Transaction réussie: ${data.data.amount}€`
      case 'transaction.failed':
        return `❌ Transaction échouée: ${data.data.amount}€`
      case 'merchant.request.created':
        return `🏪 Nouvelle demande marchand: ${data.data.merchant_name}`
      case 'merchant.approved':
        return `✅ Marchand approuvé: ${data.data.merchant_name}`
      case 'merchant.rejected':
        return `❌ Marchand rejeté: ${data.data.merchant_name}`
      case 'refund.created':
        return `🔄 Nouveau remboursement: ${data.data.amount}€`
      default:
        return data.message || 'Nouvelle notification'
    }
  }

  // Afficher une notification toast
  showToastNotification(notification) {
    // Utiliser le store pour afficher la notification
    store.dispatch('addToastNotification', {
      type: this.getToastType(notification.type),
      message: notification.message,
      duration: 5000
    })
  }

  // Déterminer le type de toast
  getToastType(eventType) {
    if (eventType.includes('success') || eventType.includes('approved')) {
      return 'success'
    } else if (eventType.includes('failed') || eventType.includes('rejected')) {
      return 'error'
    } else if (eventType.includes('created') || eventType.includes('new')) {
      return 'info'
    }
    return 'info'
  }

  // Dispatcher vers le store
  dispatchToStore(data) {
    switch (data.type) {
      case 'transaction.created':
      case 'transaction.updated':
        store.dispatch('updateTransactionRealTime', data.data)
        break
      case 'merchant.request.created':
        store.dispatch('addMerchantRequestRealTime', data.data)
        break
      case 'dashboard.stats.updated':
        store.dispatch('updateDashboardStatsRealTime', data.data)
        break
    }
  }

  // Enregistrer un handler pour un type d'événement
  on(eventType, handler) {
    this.eventHandlers.set(eventType, handler)
  }

  // Supprimer un handler
  off(eventType) {
    this.eventHandlers.delete(eventType)
  }

  // Reconnecter
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ WebSocket: Nombre max de tentatives de reconnexion atteint')
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔄 WebSocket: Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    const notification = this.notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    this.notifications.value.forEach(n => n.read = true)
  }

  // Supprimer une notification
  removeNotification(notificationId) {
    const index = this.notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      this.notifications.value.splice(index, 1)
    }
  }

  // Fermer la connexion
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected.value = false
    }
  }

  // Getters reactifs
  get connected() {
    return this.isConnected
  }

  get unreadCount() {
    return computed(() => this.notifications.value.filter(n => !n.read).length)
  }

  get recentNotifications() {
    return computed(() => this.notifications.value.slice(0, 10))
  }
}

// Instance singleton
const websocketService = new WebSocketService()

export default websocketService
