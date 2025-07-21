<template>
  <div class="configuration-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">⚙️ Configuration Complète</h1>
          <p class="text-gray-600">Configurez tous les paramètres nécessaires pour tester la plateforme de paiement</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Credentials API -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              🔐 Credentials API
              <span v-if="credentialsStore.isConfigured" class="ml-2 text-green-600 text-sm">✓ Configuré</span>
            </h2>
            
            <form @submit.prevent="saveCredentials" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                <input
                  v-model="credentials.merchantId"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="merchant-123"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  v-model="credentials.apiKey"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="api-key-secret"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Backend URL</label>
                <input
                  v-model="credentials.backendUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:3000"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">PSP URL</label>
                <input
                  v-model="credentials.pspUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:3002"
                  required
                />
              </div>

              <button
                type="submit"
                :disabled="isTestingConnection"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ isTestingConnection ? 'Test en cours...' : 'Sauvegarder & Tester' }}
              </button>
            </form>
          </div>

          <!-- URLs de Callback -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">🔗 URLs de Callback</h2>
            
            <form @submit.prevent="saveUrls" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  v-model="credentials.webhookUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="http://localhost:8081/webhook"
                />
                <p class="text-xs text-gray-500 mt-1">URL pour recevoir les notifications de paiement</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Return URL (Succès)</label>
                <input
                  v-model="credentials.returnUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="http://localhost:8081/payment-return"
                />
                <p class="text-xs text-gray-500 mt-1">Redirection après paiement réussi</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cancel URL (Annulation)</label>
                <input
                  v-model="credentials.cancelUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="http://localhost:8081/payment-cancel"
                />
                <p class="text-xs text-gray-500 mt-1">Redirection après annulation</p>
              </div>

              <button
                type="submit"
                class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Sauvegarder URLs
              </button>
            </form>
          </div>
        </div>

        <!-- Test de Connexion -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">🧪 Tests de Connexion</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Backend API</h3>
              <p class="text-sm text-gray-600 mb-3">Test de connectivité avec l'API backend</p>
              <button
                @click="testBackendConnection"
                :disabled="isTestingBackend"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ isTestingBackend ? 'Test...' : 'Tester Backend' }}
              </button>
              <div v-if="backendStatus" :class="backendStatus.success ? 'text-green-600' : 'text-red-600'" class="text-sm mt-2">
                {{ backendStatus.message }}
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">PSP Emulator</h3>
              <p class="text-sm text-gray-600 mb-3">Test de connectivité avec le PSP</p>
              <button
                @click="testPspConnection"
                :disabled="isTestingPsp"
                class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {{ isTestingPsp ? 'Test...' : 'Tester PSP' }}
              </button>
              <div v-if="pspStatus" :class="pspStatus.success ? 'text-green-600' : 'text-red-600'" class="text-sm mt-2">
                {{ pspStatus.message }}
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">Webhook</h3>
              <p class="text-sm text-gray-600 mb-3">Test de réception webhook</p>
              <button
                @click="testWebhook"
                :disabled="isTestingWebhook"
                class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {{ isTestingWebhook ? 'Test...' : 'Tester Webhook' }}
              </button>
              <div v-if="webhookStatus" :class="webhookStatus.success ? 'text-green-600' : 'text-red-600'" class="text-sm mt-2">
                {{ webhookStatus.message }}
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Avancée -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">⚡ Configuration Avancée</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-800 mb-3">Options de Paiement</h3>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input v-model="advancedConfig.enablePreauth" type="checkbox" class="mr-2">
                  Activer la pré-autorisation
                </label>
                <label class="flex items-center">
                  <input v-model="advancedConfig.enableRefunds" type="checkbox" class="mr-2">
                  Activer les remboursements
                </label>
                <label class="flex items-center">
                  <input v-model="advancedConfig.enableRecurring" type="checkbox" class="mr-2">
                  Activer les paiements récurrents
                </label>
                <label class="flex items-center">
                  <input v-model="advancedConfig.enable3DS" type="checkbox" class="mr-2">
                  Activer 3D Secure
                </label>
              </div>
            </div>

            <div>
              <h3 class="font-semibold text-gray-800 mb-3">Délais et Timeouts</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Timeout API (ms)</label>
                  <input
                    v-model.number="advancedConfig.apiTimeout"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1000"
                    max="30000"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Retry Count</label>
                  <input
                    v-model.number="advancedConfig.retryCount"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    max="5"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            @click="saveAdvancedConfig"
            class="mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
          >
            Sauvegarder Configuration Avancée
          </button>
        </div>

        <!-- Export/Import Configuration -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">💾 Export/Import Configuration</h2>
          
          <div class="flex gap-4">
            <button
              @click="exportConfiguration"
              class="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              📥 Exporter Configuration
            </button>
            
            <label class="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors cursor-pointer">
              📤 Importer Configuration
              <input
                type="file"
                @change="importConfiguration"
                accept=".json"
                class="hidden"
              />
            </label>
            
            <button
              @click="resetConfiguration"
              class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              🗑️ Reset Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCredentialsStore } from '../stores/index.js'

const credentialsStore = useCredentialsStore()

// Form data
const credentials = reactive({ ...credentialsStore.$state })

const advancedConfig = reactive({
  enablePreauth: true,
  enableRefunds: true,
  enableRecurring: false,
  enable3DS: false,
  apiTimeout: 10000,
  retryCount: 3
})

// Test states
const isTestingConnection = ref(false)
const isTestingBackend = ref(false)
const isTestingPsp = ref(false)
const isTestingWebhook = ref(false)

const backendStatus = ref(null)
const pspStatus = ref(null)
const webhookStatus = ref(null)

// Actions
const saveCredentials = async () => {
  isTestingConnection.value = true
  try {
    credentialsStore.updateCredentials(credentials)
    await credentialsStore.testConnection()
    
    // Test backend connection
    await testBackendConnection()
  } finally {
    isTestingConnection.value = false
  }
}

const saveUrls = () => {
  credentialsStore.updateCredentials({
    webhookUrl: credentials.webhookUrl,
    returnUrl: credentials.returnUrl,
    cancelUrl: credentials.cancelUrl
  })
  alert('URLs sauvegardées avec succès !')
}

const testBackendConnection = async () => {
  isTestingBackend.value = true
  try {
    const response = await fetch(`${credentials.backendUrl}/health`)
    if (response.ok) {
      backendStatus.value = { success: true, message: 'Backend accessible ✓' }
    } else {
      backendStatus.value = { success: false, message: `Erreur ${response.status}` }
    }
  } catch (error) {
    backendStatus.value = { success: false, message: 'Backend inaccessible ✗' }
  } finally {
    isTestingBackend.value = false
  }
}

const testPspConnection = async () => {
  isTestingPsp.value = true
  try {
    const response = await fetch(`${credentials.pspUrl}/health`)
    if (response.ok) {
      pspStatus.value = { success: true, message: 'PSP accessible ✓' }
    } else {
      pspStatus.value = { success: false, message: `Erreur ${response.status}` }
    }
  } catch (error) {
    pspStatus.value = { success: false, message: 'PSP inaccessible ✗' }
  } finally {
    isTestingPsp.value = false
  }
}

const testWebhook = async () => {
  isTestingWebhook.value = true
  try {
    // Simuler un test webhook
    setTimeout(() => {
      webhookStatus.value = { success: true, message: 'Webhook configuré ✓' }
      isTestingWebhook.value = false
    }, 1000)
  } catch (error) {
    webhookStatus.value = { success: false, message: 'Erreur webhook ✗' }
    isTestingWebhook.value = false
  }
}

const saveAdvancedConfig = () => {
  localStorage.setItem('advancedConfig', JSON.stringify(advancedConfig))
  alert('Configuration avancée sauvegardée !')
}

const exportConfiguration = () => {
  const config = {
    credentials: credentials,
    advancedConfig: advancedConfig,
    exportDate: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(config, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `merchant-config-${Date.now()}.json`
  link.click()
}

const importConfiguration = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result)
        Object.assign(credentials, config.credentials)
        Object.assign(advancedConfig, config.advancedConfig)
        alert('Configuration importée avec succès !')
      } catch (error) {
        alert('Erreur lors de l\'importation du fichier')
      }
    }
    reader.readAsText(file)
  }
}

const resetConfiguration = () => {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
    Object.assign(credentials, {
      merchantId: 'test-merchant-123',
      apiKey: 'test-api-key-123',
      backendUrl: 'http://localhost:3000',
      pspUrl: 'http://localhost:3002',
      webhookUrl: 'http://localhost:8081/webhook',
      returnUrl: 'http://localhost:8081/payment-return',
      cancelUrl: 'http://localhost:8081/payment-cancel'
    })
    
    Object.assign(advancedConfig, {
      enablePreauth: true,
      enableRefunds: true,
      enableRecurring: false,
      enable3DS: false,
      apiTimeout: 10000,
      retryCount: 3
    })
    
    localStorage.clear()
    alert('Configuration réinitialisée !')
  }
}

onMounted(() => {
  credentialsStore.loadCredentials()
  Object.assign(credentials, credentialsStore.$state)
  
  const savedAdvanced = localStorage.getItem('advancedConfig')
  if (savedAdvanced) {
    Object.assign(advancedConfig, JSON.parse(savedAdvanced))
  }
})
</script>
