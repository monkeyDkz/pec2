<template>
  <div class="home">
    <div class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-8 mb-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold mb-4">🛍️ Test Merchant Portal</h1>
          <p class="text-xl mb-6">Portail de test pour valider les workflows de paiement</p>
          <div class="flex justify-center space-x-4">
            <router-link
              to="/config"
              class="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              ⚙️ Configuration
            </router-link>
            <router-link
              to="/shop"
              class="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors"
            >
              🛒 Boutique Test
            </router-link>
          </div>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Configuration Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="text-4xl mb-4">⚙️</div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Configuration API</h3>
            <p class="text-gray-600 mb-4">
              Configurez vos credentials pour connecter le site test à la plateforme de paiement
            </p>
            <router-link
              to="/config"
              class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Configurer
            </router-link>
          </div>
        </div>

        <!-- Shopping Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="text-4xl mb-4">🛒</div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Boutique de Test</h3>
            <p class="text-gray-600 mb-4">
              Simulez un e-commerce complet avec panier et processus de paiement
            </p>
            <router-link
              to="/shop"
              class="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Faire du shopping
            </router-link>
          </div>
        </div>

        <!-- Transactions Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="text-4xl mb-4">💰</div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Gestion Transactions</h3>
            <p class="text-gray-600 mb-4">
              Visualisez et gérez les transactions, testez les remboursements
            </p>
            <router-link
              to="/transactions"
              class="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Voir les transactions
            </router-link>
          </div>
        </div>
      </div>

      <!-- Workflow Steps -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">🚀 Workflow de Test</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
            <h4 class="font-medium text-gray-800 mb-2">Configuration</h4>
            <p class="text-sm text-gray-600">Configurez vos API credentials</p>
          </div>
          <div class="text-center">
            <div class="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
            <h4 class="font-medium text-gray-800 mb-2">Shopping</h4>
            <p class="text-sm text-gray-600">Ajoutez des produits au panier</p>
          </div>
          <div class="text-center">
            <div class="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
            <h4 class="font-medium text-gray-800 mb-2">Paiement</h4>
            <p class="text-sm text-gray-600">Testez différents scénarios de paiement</p>
          </div>
          <div class="text-center">
            <div class="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
            <h4 class="font-medium text-gray-800 mb-2">Gestion</h4>
            <p class="text-sm text-gray-600">Gérez les transactions et remboursements</p>
          </div>
        </div>
      </div>

      <!-- Test Scenarios -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">🧪 Scénarios de Test Disponibles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3">💳 Paiements Standards</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>✅ Paiement réussi avec capture immédiate</li>
              <li>🔒 Pré-autorisation avec capture manuelle</li>
              <li>❌ Simulation d'échec de paiement</li>
              <li>🔄 Paiements multiples pour tester les limites</li>
            </ul>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3">💸 Remboursements</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>💯 Remboursement complet</li>
              <li>🔄 Remboursement partiel</li>
              <li>📊 Suivi des statuts en temps réel</li>
              <li>📧 Test des webhooks de notification</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- API Status -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">🔌 Status des Services</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <div :class="serviceStatus.backend ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full mr-3"></div>
              <span class="font-medium">Backend API</span>
            </div>
            <span :class="serviceStatus.backend ? 'text-green-600' : 'text-red-600'" class="text-sm">
              {{ serviceStatus.backend ? 'En ligne' : 'Hors ligne' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <div :class="serviceStatus.psp ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full mr-3"></div>
              <span class="font-medium">PSP Emulator</span>
            </div>
            <span :class="serviceStatus.psp ? 'text-green-600' : 'text-red-600'" class="text-sm">
              {{ serviceStatus.psp ? 'En ligne' : 'Hors ligne' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <div :class="serviceStatus.webhooks ? 'bg-green-500' : 'bg-yellow-500'" class="w-3 h-3 rounded-full mr-3"></div>
              <span class="font-medium">Webhooks</span>
            </div>
            <span :class="serviceStatus.webhooks ? 'text-green-600' : 'text-yellow-600'" class="text-sm">
              {{ serviceStatus.webhooks ? 'Configurés' : 'Non configurés' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 text-center">
        <p class="text-gray-600 mb-4">Prêt à commencer ? Choisissez votre point d'entrée :</p>
        <div class="flex justify-center space-x-4">
          <router-link
            to="/config"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            🔧 Commencer par la configuration
          </router-link>
          <router-link
            to="/shop"
            class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            🛍️ Aller directement au shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue'
import { useApi } from '@/services/api'

export default {
  name: 'Home',
  setup() {
    const api = useApi()

    const serviceStatus = reactive({
      backend: false,
      psp: false,
      webhooks: false
    })

    const checkServices = async () => {
      try {
        // Check Backend
        try {
          const backendResult = await api.health.checkBackend()
          serviceStatus.backend = backendResult.status === 'ok'
        } catch {
          serviceStatus.backend = false
        }

        // Check PSP
        try {
          const pspResult = await api.health.checkPSP()
          serviceStatus.psp = pspResult.status === 'ok'
        } catch {
          serviceStatus.psp = false
        }

        // Check Webhooks (simulate)
        serviceStatus.webhooks = true // À améliorer avec une vraie vérification

      } catch (error) {
        console.error('Erreur lors de la vérification des services:', error)
      }
    }

    onMounted(() => {
      checkServices()
    })

    return {
      serviceStatus
    }
  }
}
</script>

<style scoped>
/* Animations */
.hover\:shadow-xl:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}

.transition-colors {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .flex {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
