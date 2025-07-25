<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">💳 Paiement</h1>
    <p>Commande : {{ tx?.order_id }}</p>
    <p>Montant : {{ tx?.amount }} {{ tx?.currency }}</p>

    <form @submit.prevent="confirmPayment">
      <label class="block">Numéro de carte</label>
      <input type="text" v-model="card.number" class="border p-2 rounded w-full" />

      <label class="block mt-2">Expiration</label>
      <input type="text" v-model="card.expiry" class="border p-2 rounded w-full" />

      <label class="block mt-2">CVC</label>
      <input type="text" v-model="card.cvc" class="border p-2 rounded w-full" />

      <button class="mt-4 bg-green-600 text-white px-4 py-2 rounded">Payer</button>
    </form>

    <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import paymentService from '@/services/paymentService'

const route = useRoute()
const router = useRouter()
const tx = ref(null)
const error = ref('')
const card = ref({ number: '', expiry: '', cvc: '' })

onMounted(async () => {
  const res = await paymentService.getTransaction(route.query.tx_id)
  tx.value = res.data.data
})

async function confirmPayment() {
  try {
    await paymentService.confirmPayment(tx.value.id, card.value)
    window.location.href = tx.value.success_url
  } catch (e) {
    error.value = 'Paiement échoué'
  }
}
</script>