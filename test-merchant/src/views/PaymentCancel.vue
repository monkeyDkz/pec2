<template>
  <div class="payment-cancel-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Cancel Result -->
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="text-6xl mb-6">❌</div>
          <h1 class="text-3xl font-bold text-red-800 mb-4">Paiement Annulé</h1>
          <p class="text-gray-600 mb-6">Votre transaction a été annulée. Aucun montant n'a été débité.</p>

          <!-- Cancel Reason -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-red-800 mb-4">Raison de l'Annulation</h2>
            <div class="text-left text-red-700">
              <p v-if="cancelReason">{{ cancelReason }}</p>
              <p v-else>Le paiement a été annulé par l'utilisateur ou a expiré.</p>
            </div>
          </div>

          <!-- Cart Recovery -->
          <div v-if="cartItems && cartItems.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-yellow-800 mb-3">🛒 Votre Panier</h3>
            <p class="text-yellow-700 mb-3">Vos articles sont toujours dans votre panier :</p>
            <div class="space-y-2 text-left">
              <div v-for="item in cartItems" :key="item.id" class="flex justify-between text-sm">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>{{ formatCurrency(item.price * item.quantity) }}</span>
              </div>
              <div class="border-t pt-2 font-bold flex justify-between">
                <span>Total:</span>
                <span>{{ formatCurrency(cartTotal) }}</span>
              </div>
            </div>
          </div>

          <!-- What Happened -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-blue-800 mb-3">ℹ️ Que s'est-il passé ?</h3>
            <div class="text-left text-blue-700 space-y-2">
              <p>• Vous avez annulé le paiement ou fermé la page</p>
              <p>• Le délai de paiement a expiré</p>
              <p>• Une erreur technique s'est produite</p>
              <p>• Aucun montant n'a été débité de votre compte</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/cart"
              class="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              🛒 Retourner au Panier
            </router-link>
            <router-link
              to="/shop"
              class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              🛍️ Continuer mes Achats
            </router-link>
            <router-link
              to="/config"
              class="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
            >
              ⚙️ Configuration
            </router-link>
            <router-link
              to="/"
              class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              🏠 Retour Accueil
            </router-link>
          </div>

          <!-- Help Section -->
          <div class="mt-8 p-4 bg-gray-100 rounded-lg">
            <p class="text-sm text-gray-600">
              <strong>Besoin d'aide ?</strong><br>
              Si vous rencontrez des difficultés avec le paiement :<br>
              • Vérifiez votre configuration de paiement<br>
              • Contactez le support: <a href="mailto:support@example.com" class="text-blue-600">support@example.com</a><br>
              • Session ID: <span class="font-mono">{{ sessionId }}</span>
            </p>
          </div>

          <!-- Debug Info (Development) -->
          <div v-if="isDevelopment" class="mt-6 p-4 bg-gray-800 text-white rounded-lg text-left">
            <h4 class="font-semibold mb-2">🔧 Debug Info (Development)</h4>
            <div class="text-xs font-mono space-y-1">
              <p>URL Params: {{ JSON.stringify($route.query) }}</p>
              <p>Cancel Reason: {{ cancelReason || 'N/A' }}</p>
              <p>Session ID: {{ sessionId }}</p>
              <p>Timestamp: {{ new Date().toISOString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/index.js'

const route = useRoute()
const cartStore = useCartStore()

const cancelReason = ref('')
const sessionId = ref('')
const isDevelopment = ref(process.env.NODE_ENV === 'development')

const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.total)

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

onMounted(() => {
  // Extract cancel information from URL params
  cancelReason.value = route.query.reason || route.query.error || ''
  sessionId.value = route.query.session_id || route.query.payment_id || 'SESS_' + Date.now()
  
  // Map common cancel reasons
  const reasonMap = {
    'user_cancelled': 'Paiement annulé par l\'utilisateur',
    'expired': 'Session de paiement expirée',
    'timeout': 'Délai de paiement dépassé',
    'technical_error': 'Erreur technique lors du paiement',
    'insufficient_funds': 'Fonds insuffisants',
    'card_declined': 'Carte refusée par la banque',
    'invalid_card': 'Données de carte invalides'
  }
  
  if (cancelReason.value && reasonMap[cancelReason.value]) {
    cancelReason.value = reasonMap[cancelReason.value]
  }
  
  // Log cancellation for analytics (in real app)
  console.log('Payment cancelled:', {
    reason: cancelReason.value,
    sessionId: sessionId.value,
    cartValue: cartTotal.value,
    timestamp: new Date().toISOString()
  })
})
</script>
