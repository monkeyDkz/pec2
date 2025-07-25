<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">⚙️ Configuration Paiement</h1>
    <p><strong>App ID:</strong> {{ credentials.app_id }}</p>
    <p><strong>App Secret:</strong> {{ credentials.app_secret }}</p>
    <p><strong>Webhook:</strong> {{ credentials.webhook_url }}</p>
    <p><strong>API URL:</strong> {{ credentials.api_url }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import merchantService from '@/services/merchantService'

const credentials = ref({})

onMounted(async () => {
  const res = await merchantService.getMerchantCredentials(localStorage.getItem('merchant_id'))
  credentials.value = res.data.data
})
</script>