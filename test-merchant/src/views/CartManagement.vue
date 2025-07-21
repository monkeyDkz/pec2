<template>
  <div class="cart-management">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">�️ Boutique</h1>
              <p class="text-gray-600">Découvrez nos produits et ajoutez-les à votre panier</p>
            </div>
            <router-link 
              v-if="cartItems.length > 0"
              to="/cart" 
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              🛒 Voir le panier ({{ cartItems.length }})
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Products Catalog -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-semibold text-gray-800">📦 Catalogue Produits</h2>
                <button
                  @click="addRandomProduct"
                  class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  + Produit Aléatoire
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <ProductCard
                  v-for="product in products"
                  :key="product.id"
                  :product="product"
                  @add-to-cart="addToCart"
                />
              </div>

              <!-- Add Custom Product -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-medium text-gray-800 mb-3">➕ Ajouter un Produit Personnalisé</h3>
                <form @submit.prevent="addCustomProduct" class="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    v-model="customProduct.name"
                    type="text"
                    placeholder="Nom du produit"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    v-model.number="customProduct.price"
                    type="number"
                    step="0.01"
                    placeholder="Prix (€)"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    v-model="customProduct.category"
                    type="text"
                    placeholder="Catégorie"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Mini Cart Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">🛒 Panier</h2>
              
              <div v-if="cartItems.length === 0" class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">🛒</div>
                <p>Votre panier est vide</p>
              </div>
              
              <div v-else>
                <div class="space-y-2 mb-4">
                  <div 
                    v-for="item in cartItems.slice(0, 3)" 
                    :key="item.id"
                    class="flex justify-between text-sm"
                  >
                    <span class="truncate">{{ item.name }} x{{ item.quantity }}</span>
                    <span>{{ (item.price * item.quantity).toFixed(2) }}€</span>
                  </div>
                  <div v-if="cartItems.length > 3" class="text-xs text-gray-500">
                    ... et {{ cartItems.length - 3 }} autre(s)
                  </div>
                </div>
                
                <div class="border-t pt-3 mb-4">
                  <div class="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{{ cartTotal.toFixed(2) }}€</span>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <router-link 
                    to="/cart"
                    class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center block"
                  >
                    Voir le panier
                  </router-link>
                  <button
                    @click="clearCart"
                    class="w-full bg-gray-400 text-white py-1 px-4 rounded-md hover:bg-gray-500 transition-colors text-sm"
                  >
                    Vider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Options -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6" v-if="cartItems.length > 0">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">💳 Options de Paiement</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Standard Payment -->
            <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div class="text-center">
                <div class="text-3xl mb-3">💳</div>
                <h3 class="text-lg font-medium text-gray-800 mb-2">Paiement Standard</h3>
                <p class="text-sm text-gray-600 mb-4">Workflow de paiement classique avec capture immédiate</p>
                <button
                  @click="initiatePayment('standard')"
                  :disabled="processingPayment"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {{ processingPayment ? 'Traitement...' : 'Payer Maintenant' }}
                </button>
              </div>
            </div>

            <!-- Pre-auth Payment -->
            <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-yellow-500 transition-colors">
              <div class="text-center">
                <div class="text-3xl mb-3">🔒</div>
                <h3 class="text-lg font-medium text-gray-800 mb-2">Pré-autorisation</h3>
                <p class="text-sm text-gray-600 mb-4">Réservation avec capture manuelle ultérieure</p>
                <button
                  @click="initiatePayment('preauth')"
                  :disabled="processingPayment"
                  class="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  {{ processingPayment ? 'Traitement...' : 'Pré-autoriser' }}
                </button>
              </div>
            </div>

            <!-- Test Failure -->
            <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 transition-colors">
              <div class="text-center">
                <div class="text-3xl mb-3">❌</div>
                <h3 class="text-lg font-medium text-gray-800 mb-2">Test d'Échec</h3>
                <p class="text-sm text-gray-600 mb-4">Simuler un paiement refusé pour tester les erreurs</p>
                <button
                  @click="initiatePayment('fail')"
                  :disabled="processingPayment"
                  class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {{ processingPayment ? 'Traitement...' : 'Simuler Échec' }}
                </button>
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
                {{ paymentResult.success ? 'Paiement Réussi' : 'Paiement Échoué' }}
              </h3>
              <p class="text-gray-600 mb-4">{{ paymentResult.message }}</p>
              
              <div v-if="paymentResult.details" class="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                <div class="text-sm space-y-1">
                  <div><strong>Transaction ID:</strong> {{ paymentResult.details.transactionId }}</div>
                  <div><strong>Montant:</strong> {{ paymentResult.details.amount }}€</div>
                  <div><strong>Statut:</strong> {{ paymentResult.details.status }}</div>
                  <div v-if="paymentResult.details.error"><strong>Erreur:</strong> {{ paymentResult.details.error }}</div>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="closePaymentResult"
                  class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Fermer
                </button>
                <button
                  v-if="paymentResult.success"
                  @click="viewTransaction"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Voir Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/index.js'
import { useApi } from '../services/api.js'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'CartManagement',
  components: {
    ProductCard
  },
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const api = useApi()

    const processingPayment = ref(false)
    const paymentResult = ref(null)

    const customProduct = reactive({
      name: '',
      price: 0,
      category: ''
    })

    // Sample products
    const products = ref([
      {
        id: 1,
        name: 'Smartphone Pro',
        price: 899.99,
        category: 'Électronique',
        image: '📱',
        description: 'Dernier smartphone avec technologie avancée'
      },
      {
        id: 2,
        name: 'Casque Audio',
        price: 199.99,
        category: 'Audio',
        image: '🎧',
        description: 'Casque sans fil avec réduction de bruit'
      },
      {
        id: 3,
        name: 'Ordinateur Portable',
        price: 1299.99,
        category: 'Informatique',
        image: '💻',
        description: 'Laptop haute performance pour professionnels'
      },
      {
        id: 4,
        name: 'Montre Connectée',
        price: 299.99,
        category: 'Accessoires',
        image: '⌚',
        description: 'Montre intelligente avec suivi fitness'
      },
      {
        id: 5,
        name: 'Tablette Graphique',
        price: 449.99,
        category: 'Design',
        image: '🎨',
        description: 'Tablette professionnelle pour designers'
      },
      {
        id: 6,
        name: 'Console de Jeu',
        price: 499.99,
        category: 'Gaming',
        image: '🎮',
        description: 'Console nouvelle génération'
      }
    ])

    const cartItems = computed(() => cartStore.items)
    const cartTotal = computed(() => cartStore.total)

    const addToCart = (product) => {
      cartStore.addItem(product)
    }

    const updateCartQuantity = (productId, quantity) => {
      cartStore.updateQuantity(productId, quantity)
    }

    const removeFromCart = (productId) => {
      cartStore.removeItem(productId)
    }

    const clearCart = () => {
      cartStore.clearCart()
    }

    const addCustomProduct = () => {
      if (customProduct.name && customProduct.price > 0) {
        const newProduct = {
          id: Date.now(),
          name: customProduct.name,
          price: customProduct.price,
          category: customProduct.category || 'Personnalisé',
          image: '📦',
          description: 'Produit personnalisé ajouté par l\'utilisateur'
        }
        
        products.value.push(newProduct)
        
        // Reset form
        customProduct.name = ''
        customProduct.price = 0
        customProduct.category = ''
      }
    }

    const addRandomProduct = () => {
      const randomProducts = [
        { name: 'Livre Électronique', price: 29.99, category: 'Lecture', image: '📚' },
        { name: 'Chargeur Portable', price: 39.99, category: 'Accessoires', image: '🔌' },
        { name: 'Webcam HD', price: 89.99, category: 'Bureautique', image: '📹' },
        { name: 'Clavier Mécanique', price: 149.99, category: 'Périphériques', image: '⌨️' },
        { name: 'Souris Gaming', price: 79.99, category: 'Gaming', image: '🖱️' },
        { name: 'Micro USB', price: 59.99, category: 'Audio', image: '🎤' }
      ]
      
      const randomProduct = randomProducts[Math.floor(Math.random() * randomProducts.length)]
      const newProduct = {
        id: Date.now(),
        ...randomProduct,
        description: 'Produit généré aléatoirement pour les tests'
      }
      
      products.value.push(newProduct)
    }

    const proceedToCheckout = () => {
      if (cartItems.value.length === 0) return
      
      // Pas besoin de redirection, les options de paiement sont sur la même page
      document.querySelector('.bg-white.rounded-lg.shadow-lg.p-6.mt-6')?.scrollIntoView({
        behavior: 'smooth'
      })
    }

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

        // Si succès, vider le panier
        if (paymentResponse.success) {
          cartStore.clearCart()
        }

      } catch (error) {
        console.error('Erreur lors du paiement:', error)
        paymentResult.value = {
          success: false,
          message: 'Erreur technique lors du paiement',
          details: {
            transactionId: `TXN_ERROR_${Date.now()}`,
            amount: cartTotal.value,
            status: 'error',
            error: error.message
          }
        }
      } finally {
        processingPayment.value = false
      }
    }

    const closePaymentResult = () => {
      paymentResult.value = null
    }

    const viewTransaction = () => {
      if (paymentResult.value?.details?.transactionId) {
        router.push({
          name: 'TransactionManagement',
          query: { highlight: paymentResult.value.details.transactionId }
        })
      }
      closePaymentResult()
    }

    onMounted(() => {
      // Charger le panier depuis le store
      cartStore.loadCart()
    })

    return {
      products,
      cartItems,
      cartTotal,
      customProduct,
      processingPayment,
      paymentResult,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      addCustomProduct,
      addRandomProduct,
      proceedToCheckout,
      initiatePayment,
      closePaymentResult,
      viewTransaction
    }
  }
}
</script>

<style scoped>
/* Animations pour les transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
