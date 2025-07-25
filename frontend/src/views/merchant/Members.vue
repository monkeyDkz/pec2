<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">👥 Membres du Marchand</h1>
    <ul v-if="members.length" class="mt-4 space-y-2">
      <li v-for="member in members" :key="member.id" class="p-4 border rounded">
        {{ member.user.first_name }} {{ member.user.last_name }} – {{ member.role }}
      </li>
    </ul>
    <div v-else class="text-gray-500 mt-4">Aucun membre trouvé.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import merchantService from '@/services/merchantService'

const route = useRoute()
const members = ref([])

onMounted(async () => {
  const res = await merchantService.getMerchantMembers(route.params.id)
  members.value = res.data.data.members
})
</script>