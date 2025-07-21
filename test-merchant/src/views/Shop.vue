<template>
  <div class="shop-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">🛍️ Boutique</h1>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { useCartStore } from '../stores/index.js'

const cartStore = useCartStore()

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
    description: 'Tablette professionnelle pour créateurs'
  },
  {
    id: 6,
    name: 'Appareil Photo',
    price: 1899.99,
    category: 'Photo',
    image: '📷',
    description: 'Reflex numérique professionnel'
  }
])

// Computed properties
const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.total)

// Cart management
const addToCart = (product) => {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    image: product.image
  })
}

const clearCart = () => {
  if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
    cartStore.clearCart()
  }
}

// Product management
const addCustomProduct = () => {
  if (customProduct.name && customProduct.price > 0) {
    const newProduct = {
      id: Date.now(), // Simple ID based on timestamp
      name: customProduct.name,
      price: customProduct.price,
      category: customProduct.category || 'Divers',
      image: '📦',
      description: `Produit personnalisé: ${customProduct.name}`
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
    { name: 'Clavier Mécanique', price: 149.99, category: 'Informatique', image: '⌨️' },
    { name: 'Souris Gaming', price: 79.99, category: 'Gaming', image: '🖱️' },
    { name: 'Écran 4K', price: 399.99, category: 'Écrans', image: '🖥️' },
    { name: 'Enceinte Bluetooth', price: 129.99, category: 'Audio', image: '🔊' },
    { name: 'Chargeur Sans Fil', price: 49.99, category: 'Accessoires', image: '🔌' },
    { name: 'Disque SSD', price: 189.99, category: 'Stockage', image: '💾' },
    { name: 'Webcam HD', price: 89.99, category: 'Vidéo', image: '📹' },
    { name: 'Microphone USB', price: 119.99, category: 'Audio', image: '🎤' }
  ]
  
  const randomProduct = randomProducts[Math.floor(Math.random() * randomProducts.length)]
  const newProduct = {
    id: Date.now(),
    ...randomProduct,
    description: `Produit aléatoire: ${randomProduct.name}`
  }
  
  products.value.push(newProduct)
}

onMounted(() => {
  // Charger le panier depuis le store
  cartStore.loadCart()
})
</script>

<style scoped>
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
