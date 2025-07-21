<template>
  <div class="credentials-config">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Configuration des Credentials</h1>
          <p class="text-gray-600">Configurez vos paramètres API pour tester la plateforme de paiement</p>
        </div>

        <!-- Status Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6" v-if="statusMessage">
          <div :class="statusClass" class="p-4 rounded-lg">
            <div class="flex items-center">
              <div :class="statusIcon" class="w-5 h-5 mr-3"></div>
              <p class="font-medium">{{ statusMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Configuration Form -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- API Configuration -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">🔧 Configuration API</h2>
            <form @submit.prevent="saveCredentials" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Backend URL
                </label>
                <input
                  v-model="credentials.backendUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:3000"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  PSP URL
                </label>
                <input
                  v-model="credentials.pspUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:4000"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Merchant ID
                </label>
                <input
                  v-model="credentials.merchantId"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="merchant-123"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div class="relative">
                  <input
                    v-model="credentials.apiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your-api-key"
                    required
                  />
                  <button
                    type="button"
                    @click="showApiKey = !showApiKey"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg v-if="showApiKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-0.415-0.415M12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
                </button>
                <button
                  type="button"
                  @click="testConnection"
                  :disabled="loading"
                  class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ loading ? 'Test...' : 'Tester la connexion' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Connection Status -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">🔌 État des Connexions</h2>
            
            <div class="space-y-4">
              <!-- Backend Status -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div :class="connectionStatus.backend ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full mr-3"></div>
                  <span class="font-medium">Backend API</span>
                </div>
                <span :class="connectionStatus.backend ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ connectionStatus.backend ? 'Connecté' : 'Déconnecté' }}
                </span>
              </div>

              <!-- PSP Status -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div :class="connectionStatus.psp ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full mr-3"></div>
                  <span class="font-medium">PSP Emulator</span>
                </div>
                <span :class="connectionStatus.psp ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ connectionStatus.psp ? 'Connecté' : 'Déconnecté' }}
                </span>
              </div>

              <!-- Auth Status -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div :class="connectionStatus.auth ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full mr-3"></div>
                  <span class="font-medium">Authentification</span>
                </div>
                <span :class="connectionStatus.auth ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ connectionStatus.auth ? 'Authentifié' : 'Non authentifié' }}
                </span>
              </div>
            </div>

            <!-- Last Test Results -->
            <div v-if="lastTestResults" class="mt-6">
              <h3 class="text-lg font-medium text-gray-800 mb-3">Derniers Tests</h3>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-sm text-gray-600 space-y-1">
                  <div>⏱️ {{ new Date(lastTestResults.timestamp).toLocaleString() }}</div>
                  <div>🏁 Backend: {{ lastTestResults.backend }}ms</div>
                  <div>💳 PSP: {{ lastTestResults.psp }}ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Presets -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">⚡ Configurations Prédéfinies</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="loadPreset('development')"
              class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div class="text-center">
                <div class="text-2xl mb-2">🔧</div>
                <div class="font-medium text-gray-800">Développement</div>
                <div class="text-sm text-gray-600">Ports locaux standard</div>
              </div>
            </button>

            <button
              @click="loadPreset('docker')"
              class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div class="text-center">
                <div class="text-2xl mb-2">🐳</div>
                <div class="font-medium text-gray-800">Docker</div>
                <div class="text-sm text-gray-600">Services containerisés</div>
              </div>
            </button>

            <button
              @click="loadPreset('production')"
              class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div class="text-center">
                <div class="text-2xl mb-2">🚀</div>
                <div class="font-medium text-gray-800">Production</div>
                <div class="text-sm text-gray-600">Environnement de prod</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApi } from '@/services/api'

export default {
  name: 'CredentialsConfig',
  setup() {
    const api = useApi()
    const loading = ref(false)
    const showApiKey = ref(false)
    const statusMessage = ref('')
    const statusType = ref('')

    const credentials = reactive({
      backendUrl: 'http://backend:3000',
      pspUrl: 'http://psp-emulator:4000',
      merchantId: 'test-merchant-123',
      apiKey: 'test-api-key-123'
    })

    const connectionStatus = reactive({
      backend: false,
      psp: false,
      auth: false
    })

    const lastTestResults = ref(null)

    const statusClass = computed(() => {
      return {
        'bg-green-100 border border-green-400 text-green-700': statusType.value === 'success',
        'bg-red-100 border border-red-400 text-red-700': statusType.value === 'error',
        'bg-blue-100 border border-blue-400 text-blue-700': statusType.value === 'info',
        'bg-yellow-100 border border-yellow-400 text-yellow-700': statusType.value === 'warning'
      }
    })

    const statusIcon = computed(() => {
      const icons = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-yellow-500'
      }
      return icons[statusType.value] || 'text-gray-500'
    })

    const showStatus = (message, type = 'info') => {
      statusMessage.value = message
      statusType.value = type
      setTimeout(() => {
        statusMessage.value = ''
        statusType.value = ''
      }, 5000)
    }

    const saveCredentials = async () => {
      loading.value = true
      try {
        // Sauvegarder en localStorage
        localStorage.setItem('testMerchantCredentials', JSON.stringify(credentials))
        
        // Mettre à jour l'API service
        api.setCredentials(credentials)
        
        showStatus('✅ Credentials sauvegardés avec succès !', 'success')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        showStatus('❌ Erreur lors de la sauvegarde des credentials', 'error')
      } finally {
        loading.value = false
      }
    }

    const testConnection = async () => {
      loading.value = true
      
      try {
        const results = {
          timestamp: new Date().toISOString(),
          backend: 0,
          psp: 0
        }

        // Test Backend
        try {
          const backendStart = Date.now()
          const response = await fetch(`${credentials.backendUrl}/api/health`)
          results.backend = Date.now() - backendStart
          connectionStatus.backend = response.ok
        } catch (error) {
          connectionStatus.backend = false
          results.backend = -1
        }

        // Test PSP
        try {
          const pspStart = Date.now()
          const response = await fetch(`${credentials.pspUrl}/health`)
          results.psp = Date.now() - pspStart
          connectionStatus.psp = response.ok
        } catch (error) {
          connectionStatus.psp = false
          results.psp = -1
        }

        // Test Auth (si token disponible)
        const token = localStorage.getItem('authToken')
        if (token) {
          try {
            const response = await fetch(`${credentials.backendUrl}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            connectionStatus.auth = response.ok
          } catch (error) {
            connectionStatus.auth = false
          }
        } else {
          connectionStatus.auth = false
        }

        lastTestResults.value = results

        const allConnected = connectionStatus.backend && connectionStatus.psp
        if (allConnected) {
          showStatus('✅ Toutes les connexions sont opérationnelles !', 'success')
        } else {
          showStatus('⚠️ Certains services ne répondent pas', 'warning')
        }

      } catch (error) {
        console.error('Erreur lors du test de connexion:', error)
        showStatus('❌ Erreur lors du test de connexion', 'error')
      } finally {
        loading.value = false
      }
    }

    const loadPreset = (preset) => {
      const presets = {
        development: {
          backendUrl: 'http://localhost:3000',
          pspUrl: 'http://localhost:4000',
          merchantId: 'dev-merchant-123',
          apiKey: 'dev-api-key-123'
        },
        docker: {
          backendUrl: 'http://backend:3000',
          pspUrl: 'http://psp-emulator:4000',
          merchantId: 'docker-merchant-123',
          apiKey: 'docker-api-key-123'
        },
        production: {
          backendUrl: 'https://api.payment-platform.com',
          pspUrl: 'https://psp.payment-platform.com',
          merchantId: 'prod-merchant-123',
          apiKey: 'prod-api-key-123'
        }
      }

      if (presets[preset]) {
        Object.assign(credentials, presets[preset])
        showStatus(`📋 Configuration "${preset}" chargée`, 'info')
      }
    }

    const loadSavedCredentials = () => {
      try {
        const saved = localStorage.getItem('testMerchantCredentials')
        if (saved) {
          Object.assign(credentials, JSON.parse(saved))
          api.setCredentials(credentials)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des credentials:', error)
      }
    }

    onMounted(() => {
      loadSavedCredentials()
      testConnection()
    })

    return {
      credentials,
      connectionStatus,
      lastTestResults,
      loading,
      showApiKey,
      statusMessage,
      statusClass,
      statusIcon,
      saveCredentials,
      testConnection,
      loadPreset
    }
  }
}
</script>

<style scoped>
/* Animations personnalisées */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
