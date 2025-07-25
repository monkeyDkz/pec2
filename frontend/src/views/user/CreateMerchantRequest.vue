<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Créer une demande de marchand</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <input v-model="form.requested_merchant_name" placeholder="Nom du marchand" class="input" required />
      <input v-model="form.requested_website_url" placeholder="URL du site web" class="input" required />
      <input v-model="form.requested_company_name" placeholder="Nom de l'entreprise" class="input" required />
      <input v-model="form.requested_business_type" placeholder="Type d'activité" class="input" required />
      <input v-model="form.requested_company_address" placeholder="Adresse de l'entreprise" class="input" required />
      <input v-model="form.requested_company_phone" placeholder="Téléphone de l'entreprise" class="input" />
      <input v-model="form.requested_company_email" placeholder="Email de l'entreprise" class="input" required />
      <input v-model="form.requested_siret" placeholder="SIRET (facultatif)" class="input" />
      <textarea v-model="form.requested_description" placeholder="Description" class="input" rows="3"></textarea>
      <textarea v-model="form.justification" placeholder="Justification" class="input" rows="2" required></textarea>
      <button type="submit" class="btn-primary">Envoyer</button>
    </form>
    <div v-if="message" class="mt-4 text-green-600">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import merchantService from '@/services/merchantService'

const form = ref({
  requested_merchant_name: '',
  requested_website_url: '',
  requested_company_name: '',
  requested_company_address: '',
  requested_company_phone: '',
  requested_company_email: '',
  requested_business_type: '',
  requested_description: '',
  requested_siret: '',
  justification: ''
})

const message = ref('')

const handleSubmit = async () => {
  try {
    await merchantService.createRequest({ ...form.value })
    message.value = 'Demande envoyée avec succès ✅'
    Object.keys(form.value).forEach(k => form.value[k] = '')
  } catch (err) {
    console.error('❌ Erreur lors de la création:', err.response?.data || err.message)
  }
}
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style>