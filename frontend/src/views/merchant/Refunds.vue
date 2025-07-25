<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">💸 Remboursements</h1>
    <ul class="mt-4 space-y-2">
      <li v-for="refund in refunds" :key="refund.id" class="p-4 border rounded">
        <p><strong>{{ refund.refund_amount }} €</strong> pour la commande {{ refund.transaction.order_id }}</p>
        <p class="text-sm text-gray-500">Motif : {{ refund.reason }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import merchantService from '@/services/merchantService'

const refunds = ref([])
const route = useRoute()

onMounted(async () => {
  const res = await merchantService.getMerchantRefunds(route.params.id)
  refunds.value = res.data.data
})
</script>