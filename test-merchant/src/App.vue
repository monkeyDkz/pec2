<template>
  <div id="app">
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <router-link to="/" class="flex items-center space-x-3">
                <div class="text-2xl">🛍️</div>
                <span class="text-xl font-bold text-gray-900">Test Merchant</span>
              </router-link>
            </div>

            <div class="flex items-center space-x-6">
              <router-link to="/config" class="text-gray-700 hover:text-blue-600 flex items-center">
                <div class="text-lg mr-1">⚙️</div>
                Configuration
              </router-link>
              <router-link to="/shop" class="text-gray-700 hover:text-green-600 flex items-center">
                <div class="text-lg mr-1">�️</div>
                Boutique
              </router-link>
              <router-link to="/cart" class="text-gray-700 hover:text-green-600 flex items-center relative">
                <div class="text-lg mr-1">🛒</div>
                Panier
                <span v-if="cartStore.itemCount > 0" class="bg-red-500 text-white rounded-full px-2 py-1 text-xs ml-2">
                  {{ cartStore.itemCount }}
                </span>
              </router-link>
              <router-link to="/transactions" class="text-gray-700 hover:text-purple-600 flex items-center">
                <div class="text-lg mr-1">💰</div>
                Transactions
              </router-link>
              
              <!-- Cart Summary -->
              <div v-if="cartStore.itemCount > 0" class="text-sm text-gray-600">
                Total: {{ formatCurrency(cartStore.total) }}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenu principal -->
      <main>
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-800 text-white mt-auto">
        <div class="max-w-7xl mx-auto py-6 px-4 text-center">
          <p>&copy; 2025 Test Merchant Portal - Plateforme de test de paiement</p>
          <p class="text-sm text-gray-400 mt-2">
            🧪 Site de démonstration pour tester les workflows de paiement sécurisés
          </p>
          <div class="flex justify-center space-x-4 mt-3 text-xs text-gray-500">
            <span>📋 API Backend</span>
            <span>💳 PSP Emulator</span>
            <span>🔔 Webhooks</span>
            <span>🔄 Remboursements</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { useCartStore } from './stores/cart'

export default {
  name: 'App',
  setup() {
    const cartStore = useCartStore()

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    // Charger le panier au démarrage
    cartStore.loadCart()

    return {
      cartStore,
      formatCurrency
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
