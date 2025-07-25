<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">🏪 Tableau de bord Marchand</h1>

    <div v-if="!myMerchants.length" class="bg-yellow-100 p-4 rounded">
      <p class="mb-2">Vous n'avez encore rejoint aucun marchand.</p>
      <div class="space-x-4">
        <button @click="showJoin = true" class="bg-blue-600 text-white px-4 py-2 rounded">🔗 Rejoindre</button>
        <button @click="showCreate = true" class="bg-green-600 text-white px-4 py-2 rounded">➕ Créer</button>
      </div>
    </div>

    <div v-else>
      <h2 class="text-lg font-semibold">✅ Vos marchands :</h2>
      <ul class="list-disc pl-6 space-y-4">
        <li v-for="m in myMerchants" :key="m.merchant.id">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">{{ m.merchant.name }} – {{ m.merchant.description || 'Pas de description fournie' }}</div>
              <div class="text-sm text-gray-500">
                <span>📊 Type: {{ m.merchant.business_type }}</span>
                <span class="ml-4">🛠 Rôle: {{ m.membership.role }}</span>
              </div>
            </div>
            <div class="space-x-2">
              <button @click="viewMembers(m.merchant.id)" class="bg-indigo-600 text-white px-2 py-1 rounded text-sm">👥 Membres</button>
              <button @click="viewCredentials(m.merchant.id)" class="bg-purple-600 text-white px-2 py-1 rounded text-sm">🔐 Credentials</button>
              <button @click="viewTransactions(m.merchant.id)" class="bg-blue-700 text-white px-2 py-1 rounded text-sm">💳 Transactions</button>
              <button @click="viewRefunds(m.merchant.id)" class="bg-pink-600 text-white px-2 py-1 rounded text-sm">💸 Remboursements</button>
              <button @click="editMerchant(m.merchant.id)" class="bg-yellow-500 text-white px-2 py-1 rounded text-sm">⚙️ Modifier</button>
              <button @click="regenerateKeys(m.merchant.id)" class="bg-red-600 text-white px-2 py-1 rounded text-sm">♻️ API</button>
              <button @click="testWebhook(m.merchant.id)" class="bg-orange-500 text-white px-2 py-1 rounded text-sm">📡 Webhook</button>
            </div>
          </div>
        </li>
      </ul>
      <div class="mt-4 space-x-4">
        <button @click="showJoin = true" class="bg-blue-600 text-white px-3 py-1 rounded">🔗 Rejoindre un autre</button>
        <button @click="showCreate = true" class="bg-green-600 text-white px-3 py-1 rounded">➕ Créer un nouveau</button>
        <button @click="showPending = true" class="bg-gray-700 text-white px-3 py-1 rounded">📬 Mes demandes</button>
      </div>
    </div>

    <!-- Modales -->
    <CreateMerchantRequest v-if="showCreate" @close="showCreate = false" />
    <JoinMerchantRequest v-if="showJoin" @close="showJoin = false" />
    <PendingRequests v-if="showPending" @close="showPending = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import merchantService from '@/services/merchantService'
import CreateMerchantRequest from '@/views/user/CreateMerchantRequest.vue'
import JoinMerchantRequest from '@/views/user/JoinMerchantRequest.vue'
import PendingRequests from '@/views/user/PendingRequests.vue'

const router = useRouter()
const myMerchants = ref([])
const showCreate = ref(false)
const showJoin = ref(false)
const showPending = ref(false)

async function loadMerchants() {
  const res = await merchantService.getUserMerchants()
  myMerchants.value = res.data.data.merchants
}

function viewMembers(merchantId) {
  router.push(`/merchant/${merchantId}/members`)
}

function viewCredentials(merchantId) {
  router.push(`/merchant/${merchantId}/credentials`)
}

function viewTransactions(merchantId) {
  router.push(`/merchant/${merchantId}/transactions`)
}

function viewRefunds(merchantId) {
  router.push(`/merchant/${merchantId}/refunds`)
}

function editMerchant(merchantId) {
  router.push(`/merchant/${merchantId}/edit`)
}

async function regenerateKeys(merchantId) {
  const confirmed = confirm('Êtes-vous sûr de vouloir régénérer les clés API ?')
  if (!confirmed) return

  try {
    const res = await merchantService.regenerateApiKeys(merchantId)
    alert(`Clés régénérées avec succès:\nAPI Key: ${res.data.data.api_key}`)
  } catch (e) {
    console.error(e)
    alert('Erreur lors de la régénération des clés')
  }
}

async function testWebhook(merchantId) {
  try {
    const res = await merchantService.testWebhook(merchantId)
    alert(`Webhook testé avec succès:\nURL: ${res.data.data.webhook_url}`)
  } catch (e) {
    console.error(e)
    alert('Erreur lors du test webhook')
  }
}

onMounted(() => {
  loadMerchants()
})
</script>
