<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">📦 Créer une transaction</h1>
    <form @submit.prevent="submitTransaction">
      <div v-for="(label, key) in fields" :key="key">
        <label class="block text-sm font-medium">{{ label }}</label>
        <input type="text" v-model="form[key]" class="w-full p-2 border rounded" />
      </div>
      <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Créer</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import paymentService from '@/services/paymentService'

const route = useRoute()
const router = useRouter()

const form = ref({
  amount: '',
  currency: 'EUR',
  customer_email: '',
  order_id: '',
  success_url: '',
  cancel_url: ''
})

const fields = {
  amount: 'Montant',
  currency: 'Devise',
  customer_email: 'Email du client',
  order_id: 'ID Commande',
  success_url: 'URL de Succès',
  cancel_url: 'URL dAnnulation'
}

async function submitTransaction() {
  try {
    const res = await paymentService.createTransaction(route.params.id, form.value)
    alert('Transaction créée')
    window.location.href = res.data.data.payment_url
  } catch (e) {
    alert('Erreur lors de la création')
  }
}
</script>