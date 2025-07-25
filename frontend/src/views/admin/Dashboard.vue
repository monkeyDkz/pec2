<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🛠️ Dashboard Admin</h1>

    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">📌 Demandes en attente</h2>
      <div v-if="loading">Chargement...</div>
      <div v-else-if="requests.length === 0">Aucune demande en attente.</div>

      <div v-else class="space-y-4">
        <div v-for="req in requests" :key="req.id" class="border rounded p-4 shadow">
          <p><strong>Type:</strong> {{ formatType(req.type) }}</p>
          <p><strong>Nom marchand:</strong> {{ req.requested_merchant_name || req.merchant?.name }}</p>
          <p><strong>Utilisateur:</strong> {{ req.user?.first_name }} {{ req.user?.last_name }} ({{ req.user?.email }})</p>
          <p><strong>Justification:</strong> {{ req.justification }}</p>
          <div class="mt-2 space-x-2">
            <button @click="processRequest(req.id, 'approve')" class="btn-green">✔️ Approuver</button>
            <button @click="processRequest(req.id, 'reject')" class="btn-red">❌ Rejeter</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'

const requests = ref([])
const loading = ref(true)

const fetchRequests = async () => {
  try {
    const res = await api.get('/admin/merchant-requests?status=pending')
    requests.value = res.data.data.requests
  } catch (err) {
    console.error('Erreur fetch admin requests:', err.response?.data || err.message)
  } finally {
    loading.value = false
  }
}

const processRequest = async (id, action) => {
  try {
    const endpoint = action === 'approve'
      ? `/admin/merchant-requests/${id}/approve`
      : `/admin/merchant-requests/${id}/reject`

    await api.post(endpoint, {
      adminNotes: `Action: ${action} via dashboard`
    })

    requests.value = requests.value.filter(r => r.id !== id)
  } catch (err) {
    console.error(`Erreur ${action}:`, err.response?.data || err.message)
  }
}

const formatType = t => ({
  create_merchant: 'Création de marchand',
  join_merchant: 'Rejoindre un marchand'
}[t] || t)

onMounted(fetchRequests)
</script>

<style scoped>
.btn-green {
  background-color: #16a34a;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
}
.btn-red {
  background-color: #dc2626;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
}
</style>