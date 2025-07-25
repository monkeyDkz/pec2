<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">💳 Transactions</h1>
    <ul class="mt-4 space-y-2">
      <li v-for="tx in transactions" :key="tx.id" class="p-4 border rounded">
        <p><strong>Commande :</strong> {{ tx.order_id }} – {{ tx.amount }} € – {{ tx.status }}</p>
        <p class="text-sm text-gray-500">Client : {{ tx.customer_email }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import merchantService from '@/services/merchantService'

const transactions = ref([])
const route = useRoute()

onMounted(async () => {
  const res = await merchantService.getMerchantTransactions(route.params.id)
  transactions.value = res.data.data
})
</script>