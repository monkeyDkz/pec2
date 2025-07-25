<!-- src/views/user/JoinMerchantRequest.vue -->
<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Rejoindre un marchand existant</h2>

    <div v-if="merchants.length === 0" class="text-gray-500">Aucun marchand disponible.</div>

    <div v-else class="space-y-4">
      <div
        v-for="merchant in merchants"
        :key="merchant.id"
        class="border p-4 rounded-lg shadow"
      >
        <h3 class="text-lg font-semibold">{{ merchant.name }}</h3>
        <p class="text-sm text-gray-500">{{ merchant.description }}</p>
        <p class="text-sm text-gray-400 italic">{{ merchant.website_url }}</p>

        <form @submit.prevent="submitJoin(merchant.id)" class="mt-2 space-y-2">
          <select v-model="form[merchant.id].requested_role" class="input">
            <option value="developer">Développeur</option>
            <option value="manager">Manager</option>
          </select>
          <textarea
            v-model="form[merchant.id].justification"
            placeholder="Justification"
            class="input"
            rows="2"
            required
          ></textarea>
          <button type="submit" class="btn-primary">Demander à rejoindre</button>
        </form>

        <div v-if="messages[merchant.id]" class="text-green-600 mt-2">
          {{ messages[merchant.id] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import merchantService from '@/services/merchantService'

const merchants = ref([])
const form = ref({})
const messages = ref({})

const fetchMerchants = async () => {
  try {
    const res = await merchantService.getAvailableMerchants()
    merchants.value = res.data.data.merchants
    merchants.value.forEach(m => {
      form.value[m.id] = {
        requested_role: 'developer',
        justification: ''
      }
    })
  } catch (err) {
    console.error('Erreur fetch available merchants:', err.response?.data || err.message)
  }
}

const submitJoin = async (merchantId) => {
  try {
    const payload = {
      merchantId,
      requestedRole: form.value[merchantId].requested_role,
      justification: form.value[merchantId].justification
    }
    await merchantService.joinRequest(payload)
    messages.value[merchantId] = 'Demande envoyée avec succès ✅'
    form.value[merchantId].justification = ''
  } catch (err) {
    console.error('Erreur join request:', err.response?.data || err.message)
  }
}

onMounted(fetchMerchants)
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
