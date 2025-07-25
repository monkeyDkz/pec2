<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">🔐 Identifiants API</h1>
    <div class="mt-4">
      <p><strong>App ID :</strong> {{ credentials.app_id }}</p>
      <button @click="copyToClipboard(credentials.app_id)" class="text-sm text-blue-600">📋 Copier</button>
      <p><strong>App Secret :</strong> {{ credentials.app_secret }}</p>
      <button @click="copyToClipboard(credentials.app_secret)" class="text-sm text-blue-600">📋 Copier</button>
      <p><strong>Webhook URL :</strong> {{ credentials.webhook_url }}</p>
      <p><strong>Mode test :</strong> {{ credentials.test_mode ? 'Oui' : 'Non' }}</p>
      <p><strong>URL de paiement :</strong> {{ credentials.payment_url }}</p>
      <p><strong>API URL :</strong> {{ credentials.api_url }}</p>
    </div>
    <button @click="generateKpis" class="bg-indigo-600 text-white px-4 py-2 rounded">♻️ Générer de nouvelles clés</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import merchantService from '@/services/merchantService'

const credentials = ref({})
const route = useRoute()

onMounted(async () => {
  const res = await merchantService.getMerchantCredentials(route.params.id)
  credentials.value = res.data.data
})

function copyToClipboard(value) {
  navigator.clipboard.writeText(value)
    .then(() => alert('Copié dans le presse-papiers'))
    .catch(() => alert('Erreur de copie'))
}

async function generateKpis() {
  try {
    await merchantService.regenerateApiKeys(route.params.id)
    alert('Clés API régénérées avec succès')
    const res = await merchantService.getMerchantCredentials(route.params.id)
    credentials.value = res.data.data
  } catch {
    alert("Erreur lors de la régénération des clés.")
  }
}
</script>