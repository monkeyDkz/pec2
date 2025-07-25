<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">⚙️ Modifier le Marchand</h1>
    <div v-for="(label, key) in fields" :key="key">
      <label class="block text-sm font-medium">{{ label }}</label>
      <input type="text" v-model="form[key]" class="w-full p-2 border rounded" />
    </div>
    <div>
      <label class="block text-sm font-medium">Description</label>
      <textarea v-model="form.description" class="w-full p-2 border rounded"></textarea>
    </div>
    <button @click="updateMerchant" class="bg-green-600 text-white px-4 py-2 rounded">✅ Enregistrer</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import merchantService from '@/services/merchantService'

const route = useRoute()
const router = useRouter()

const form = ref({
  name: '',
  website_url: '',
  business_type: '',
  company_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  siret: '',
  webhook_url: '',
  description: ''
})

const fields = {
  name: 'Nom du marchand',
  website_url: 'Site web',
  business_type: 'Type de business',
  company_name: 'Nom de la société',
  company_address: 'Adresse de la société',
  company_phone: 'Téléphone de la société',
  company_email: 'Email de la société',
  siret: 'SIRET',
  webhook_url: 'URL du webhook'
}

onMounted(async () => {
  const res = await merchantService.getMerchantDetails(route.params.id)
  Object.assign(form.value, res.data.data.merchant)
})

async function updateMerchant() {
  try {
    await merchantService.updateMerchant(route.params.id, form.value)
    alert('Marchand mis à jour avec succès')
    router.push(`/merchant/${route.params.id}/edit`)
  } catch (err) {
    alert('Erreur lors de la mise à jour')
  }
}
</script>