<template>
  <div class="cart-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">🛒 Mon Panier</h1>
              <p class="text-gray-600">{{ cartItems.length }} article(s) dans votre panier</p>
            </div>
            <router-link 
              to="/shop" 
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Continuer mes achats
            </router-link>
          </div>
        </div>

        <div v-if="cartItems.length === 0" class="bg-white rounded-lg shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">🛒</div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Votre panier est vide</h2>
          <p class="text-gray-600 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
          <router-link 
            to="/shop" 
            class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voir nos produits
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cart Items -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Articles</h2>
              
              <div class="space-y-4">
                <div 
                  v-for="item in cartItems" 
                  :key="item.id"
                  class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div class="text-4xl">{{ item.image || '📦' }}</div>
                  
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">{{ item.name }}</h3>
                    <p class="text-sm text-gray-600">{{ item.category }}</p>
                    <p class="text-lg font-bold text-blue-600">{{ item.price.toFixed(2) }}€</p>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button 
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="w-8 h-8 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                      :disabled="item.quantity <= 1"
                    >
                      -
                    </button>
                    <span class="w-12 text-center font-semibold">{{ item.quantity }}</span>
                    <button 
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="w-8 h-8 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div class="text-right">
                    <p class="font-bold text-gray-800">{{ (item.price * item.quantity).toFixed(2) }}€</p>
                    <button 
                      @click="removeItem(item.id)"
                      class="text-red-600 hover:text-red-800 text-sm mt-1"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t">
                <button 
                  @click="clearCart"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          </div>

          <!-- Order Summary & Payment -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Résumé de commande</h2>
              
              <div class="space-y-2 mb-4">
                <div class="flex justify-between">
                  <span>Sous-total</span>
                  <span>{{ cartTotal.toFixed(2) }}€</span>
                </div>
                <div class="flex justify-between">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div class="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{{ cartTotal.toFixed(2) }}€</span>
                </div>
              </div>

              <!-- Payment Options -->
              <div class="space-y-3">
                <h3 class="font-semibold text-gray-800">Choisir le mode de paiement :</h3>
                
                <button
                  @click="initiatePayment('standard')"
                  :disabled="processingPayment"
                  class="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  {{ processingPayment ? 'Traitement...' : 'Payer Maintenant' }}
                </button>
                
                <button
                  @click="initiatePayment('preauth')"
                  :disabled="processingPayment"
                  class="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔒</span>
                  Pré-autorisation
                </button>
                
                <button
                  @click="initiatePayment('fail')"
                  :disabled="processingPayment"
                  class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>❌</span>
                  Tester un échec
                </button>
              </div>

              <div class="mt-4 text-xs text-gray-500">
                <p>🔒 Paiement sécurisé</p>
                <p>✓ Données chiffrées</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Result Modal -->
        <div v-if="paymentResult" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="text-center">
              <div class="text-6xl mb-4">
                {{ paymentResult.success ? '✅' : '❌' }}
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">
                {{ paymentResult.success ? 'Paiement Réussi !' : 'Paiement Échoué' }}
              </h3>
              <p class="text-gray-600 mb-4">{{ paymentResult.message }}</p>
              
              <div v-if="paymentResult.details" class="bg-gray-50 p-3 rounded text-left text-sm mb-4">
                <p><strong>ID Transaction:</strong> {{ paymentResult.details.transactionId }}</p>
                <p><strong>Montant:</strong> {{ paymentResult.details.amount?.toFixed(2) }}€</p>
                <p><strong>Statut:</strong> {{ paymentResult.details.status }}</p>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="closePaymentModal"
                  class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Fermer
                </button>
                <button
                  v-if="paymentResult.success"
                  @click="goToTransactions"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Voir les transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/index.js'
import { useApi } from '../services/api.js'

const router = useRouter()
const cartStore = useCartStore()
const api = useApi()

const processingPayment = ref(false)
const paymentResult = ref(null)

// Computed properties
const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.total)

// Cart management
const updateQuantity = (itemId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(itemId)
  } else {
    cartStore.updateQuantity(itemId, newQuantity)
  }
}

const removeItem = (itemId) => {
  cartStore.removeItem(itemId)
}

const clearCart = () => {
  if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
    cartStore.clearCart()
  }
}

// Payment processing
const initiatePayment = async (type) => {
  if (cartItems.value.length === 0) return

  processingPayment.value = true

  try {
    // Préparer les données de la commande
    const orderData = {
      amount: cartTotal.value,
      currency: 'EUR',
      description: `Commande de ${cartItems.value.length} article(s)`,
      items: cartItems.value.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      metadata: {
        orderType: type,
        timestamp: new Date().toISOString()
      }
    }

    // Simuler différents types de paiement
    let paymentResponse
    
    if (type === 'fail') {
      // Simuler un échec
      paymentResponse = {
        success: false,
        message: 'Paiement refusé par la banque',
        details: {
          transactionId: `TXN_FAIL_${Date.now()}`,
          amount: cartTotal.value,
          status: 'failed',
          error: 'Insufficient funds'
        }
      }
    } else {
      // Simuler un succès
      const transactionId = `TXN_${type.toUpperCase()}_${Date.now()}`
      
      paymentResponse = {
        success: true,
        message: type === 'preauth' ? 'Pré-autorisation effectuée avec succès' : 'Paiement traité avec succès',
        details: {
          transactionId,
          amount: cartTotal.value,
          status: type === 'preauth' ? 'authorized' : 'captured',
          captureAmount: type === 'preauth' ? 0 : cartTotal.value
        }
      }

      // Appeler l'API réelle si configurée
      try {
        const response = await api.createTransaction(orderData)
        if (response.data) {
          paymentResponse.details.transactionId = response.data.id || response.data.transactionId
          paymentResponse.details.status = response.data.status
        }
      } catch (apiError) {
        console.warn('API non disponible, utilisation des données simulées:', apiError)
      }
    }

    paymentResult.value = paymentResponse

    // Si succès, vider le panier après un délai
    if (paymentResponse.success) {
      setTimeout(() => {
        cartStore.clearCart()
      }, 3000)
    }

  } catch (error) {
    paymentResult.value = {
      success: false,
      message: 'Erreur lors du traitement du paiement',
      details: {
        error: error.message
      }
    }
  } finally {
    processingPayment.value = false
  }
}

const closePaymentModal = () => {
  paymentResult.value = null
}

const goToTransactions = () => {
  closePaymentModal()
  router.push('/transactions')
}
</script>
