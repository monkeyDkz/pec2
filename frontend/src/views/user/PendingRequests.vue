<template>
  <div>
    <h3>Mes demandes de marchand</h3>
    <ul>
      <li v-for="r in requests" :key="r.id">
        {{ r.merchant_name }} - {{ r.status }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import merchantService from '@/services/merchantService'

const requests = ref([])

onMounted(async () => {
  const res = await merchantService.getMyRequests()
  requests.value = res.data
})
</script>
