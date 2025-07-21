<template>
  <div class="webhook-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">🔗 Gestion des Webhooks</h1>
          <p class="text-gray-600">Réception et gestion des notifications de paiement</p>
        </div>

        <!-- Webhook Configuration -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">⚙️ Configuration Webhook</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL Webhook</label>
              <div class="flex gap-2">
                <input
                  v-model="webhookUrl"
                  type="url"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:8081/webhook"
                />
                <button
                  @click="saveWebhookUrl"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Secret Webhook</label>
              <div class="flex gap-2">
                <input
                  v-model="webhookSecret"
                  type="password"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="webhook-secret-key"
                />
                <button
                  @click="generateSecret"
                  class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Générer
                </button>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center">
                <input v-model="webhookEnabled" type="checkbox" class="mr-2">
                Activer les webhooks
              </label>
              
              <button
                @click="testWebhook"
                :disabled="!webhookEnabled || isTestingWebhook"
                class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {{ isTestingWebhook ? 'Test...' : 'Tester Webhook' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Webhook History -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">📨 Historique des Webhooks</h2>
            <div class="flex gap-2">
              <button
                @click="clearWebhooks"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                🗑️ Vider
              </button>
              <button
                @click="refreshWebhooks"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          <div v-if="webhooks.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📭</div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Aucun webhook reçu</h3>
            <p class="text-gray-600">Les notifications de paiement apparaîtront ici</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="webhook in webhooks"
              :key="webhook.id"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <span :class="getWebhookStatusClass(webhook.status)" class="w-3 h-3 rounded-full"></span>
                  <span class="font-semibold">{{ webhook.event }}</span>
                  <span class="text-sm text-gray-500">{{ formatDate(webhook.timestamp) }}</span>
                </div>
                <button
                  @click="viewWebhook(webhook)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  👁️ Détails
                </button>
              </div>
              
              <div class="text-sm text-gray-600">
                <p><strong>Transaction ID:</strong> {{ webhook.transactionId }}</p>
                <p><strong>Statut:</strong> {{ webhook.paymentStatus }}</p>
                <p v-if="webhook.amount"><strong>Montant:</strong> {{ formatCurrency(webhook.amount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Webhook Detail Modal -->
        <div v-if="selectedWebhook" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Détails du Webhook</h3>
              <button @click="selectedWebhook = null" class="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-700">Event</label>
                  <p class="font-mono text-sm bg-gray-100 p-2 rounded">{{ selectedWebhook.event }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Statut</label>
                  <div class="flex items-center gap-2 mt-1">
                    <span :class="getWebhookStatusClass(selectedWebhook.status)" class="w-3 h-3 rounded-full"></span>
                    <span>{{ selectedWebhook.status }}</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Payload</label>
                <pre class="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">{{ JSON.stringify(selectedWebhook.payload, null, 2) }}</pre>
              </div>

              <div v-if="selectedWebhook.headers">
                <label class="text-sm font-medium text-gray-700">Headers</label>
                <pre class="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">{{ JSON.stringify(selectedWebhook.headers, null, 2) }}</pre>
              </div>
            </div>

            <div class="mt-6 flex gap-2">
              <button
                @click="resendWebhook(selectedWebhook)"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                🔄 Renvoyer
              </button>
              <button
                @click="selectedWebhook = null"
                class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const webhookUrl = ref('http://localhost:8081/webhook')
const webhookSecret = ref('webhook-secret-123')
const webhookEnabled = ref(true)
const isTestingWebhook = ref(false)

const webhooks = ref([])
const selectedWebhook = ref(null)

// Mock webhook data
const mockWebhooks = [
  {
    id: '1',
    event: 'payment.captured',
    transactionId: 'TXN_001',
    paymentStatus: 'captured',
    amount: 299.99,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'success',
    payload: {
      event: 'payment.captured',
      transaction_id: 'TXN_001',
      amount: 299.99,
      currency: 'EUR',
      status: 'captured'
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': 'sha256=...'
    }
  },
  {
    id: '2',
    event: 'payment.failed',
    transactionId: 'TXN_002',
    paymentStatus: 'failed',
    amount: 159.99,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'success',
    payload: {
      event: 'payment.failed',
      transaction_id: 'TXN_002',
      amount: 159.99,
      currency: 'EUR',
      status: 'failed',
      error: 'insufficient_funds'
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': 'sha256=...'
    }
  }
]

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

const getWebhookStatusClass = (status) => {
  const classes = {
    success: 'bg-green-500',
    failed: 'bg-red-500',
    pending: 'bg-yellow-500'
  }
  return classes[status] || 'bg-gray-500'
}

// Actions
const saveWebhookUrl = () => {
  localStorage.setItem('webhookUrl', webhookUrl.value)
  alert('URL webhook sauvegardée !')
}

const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  webhookSecret.value = result
}

const testWebhook = async () => {
  isTestingWebhook.value = true
  
  try {
    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const testWebhook = {
      id: Date.now().toString(),
      event: 'webhook.test',
      transactionId: 'TEST_' + Date.now(),
      paymentStatus: 'test',
      amount: 0,
      timestamp: new Date().toISOString(),
      status: 'success',
      payload: {
        event: 'webhook.test',
        message: 'Test webhook envoyé avec succès'
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=test'
      }
    }
    
    webhooks.value.unshift(testWebhook)
    alert('Webhook de test envoyé avec succès !')
    
  } finally {
    isTestingWebhook.value = false
  }
}

const clearWebhooks = () => {
  if (confirm('Êtes-vous sûr de vouloir vider l\'historique des webhooks ?')) {
    webhooks.value = []
    localStorage.setItem('webhooks', JSON.stringify([]))
  }
}

const refreshWebhooks = () => {
  const saved = localStorage.getItem('webhooks')
  if (saved) {
    webhooks.value = JSON.parse(saved)
  }
}

const viewWebhook = (webhook) => {
  selectedWebhook.value = webhook
}

const resendWebhook = async (webhook) => {
  if (confirm(`Renvoyer le webhook ${webhook.id} ?`)) {
    // Simulate resend
    await new Promise(resolve => setTimeout(resolve, 500))
    alert(`Webhook ${webhook.id} renvoyé avec succès !`)
    selectedWebhook.value = null
  }
}

// Simulate receiving webhooks
const simulateWebhookReceived = (webhook) => {
  webhooks.value.unshift(webhook)
  localStorage.setItem('webhooks', JSON.stringify(webhooks.value))
}

onMounted(() => {
  // Load saved data
  const savedUrl = localStorage.getItem('webhookUrl')
  if (savedUrl) {
    webhookUrl.value = savedUrl
  }
  
  const savedWebhooks = localStorage.getItem('webhooks')
  if (savedWebhooks) {
    webhooks.value = JSON.parse(savedWebhooks)
  } else {
    webhooks.value = [...mockWebhooks]
  }
})

// Expose function to receive webhooks (for external use)
window.receiveWebhook = simulateWebhookReceived
</script>
