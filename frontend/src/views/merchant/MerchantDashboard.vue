<template>
  <div class="container mx-auto p-6">
    <!-- En-tête avec indicateur temps réel -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord Marchand</h1>
          <p class="text-gray-600 mt-2">Gérez vos transactions et paramètres</p>
        </div>
        
        <!-- Indicateur temps réel -->
        <div class="flex items-center space-x-2">
          <div class="flex items-center text-sm">
            <span
              class="w-2 h-2 rounded-full mr-2"
              :class="isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'"
            ></span>
            <span :class="isConnected ? 'text-green-600' : 'text-red-600'">
              {{ isConnected ? 'Temps réel actif' : 'Hors ligne' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques rapides (mises à jour en temps réel) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Transactions aujourd'hui"
        :value="realTimeStats.todayCount || dashboardData.todayTransactions || 0"
        icon="💳"
        color="blue"
        :isLive="isConnected"
      />
      <StatsCard
        title="Revenus du mois"
        :value="formatCurrency(realTimeStats.todayRevenue || dashboardData.monthlyRevenue || 0)"
        icon="💰"
        color="green"
        :isLive="isConnected"
      />
      <StatsCard
        title="Taux de réussite"
        :value="`${realTimeStats.successRate || dashboardData.successRate || 0}%`"
        icon="📈"
        color="purple"
        :isLive="isConnected"
      />
      <StatsCard
        title="Transactions en attente"
        :value="dashboardData.pendingTransactions || 0"
        icon="⏳"
        color="yellow"
        :isLive="isConnected"
      />
    </div>

      <!-- Actions rapides et graphique -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Actions rapides -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Actions rapides</h2>
          <div class="space-y-3">
            <BaseButton variant="primary" @click="$router.push('/merchant/transactions')" class="w-full justify-start">
              📊 Voir toutes les transactions
            </BaseButton>
            <BaseButton variant="secondary" @click="$router.push('/merchant/integration')" class="w-full justify-start">
              🔧 Guide d'intégration
            </BaseButton>
            <BaseButton variant="secondary" @click="$router.push('/merchant/settings')" class="w-full justify-start">
              ⚙️ Paramètres
            </BaseButton>
            <BaseButton variant="secondary" @click="testPayment" class="w-full justify-start">
              🧪 Test de paiement
            </BaseButton>
          </div>
        </div>

      <!-- Transactions récentes (mises à jour en temps réel) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Transactions récentes</h2>
            <div class="flex items-center space-x-2">
              <!-- Indicateur de nouvelles transactions -->
              <span
                v-if="liveTransactions.length > 0"
                class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {{ liveTransactions.length }} nouvelles
              </span>
              <BaseButton variant="secondary" size="sm" @click="$router.push('/merchant/transactions')">
                Voir tout
              </BaseButton>
            </div>
          </div>
        </div>
        
        <BaseTable 
          :headers="transactionHeaders" 
          :data="combinedTransactions"
          v-if="!loading && combinedTransactions.length > 0"
        >
          <template #amount="{ item }">
            {{ formatCurrency(item.amount) }}
          </template>

          <template #status="{ item }">
            <StatusBadge 
              :status="item.status" 
              :label="getStatusLabel(item.status)"
              :isNew="item.isLive"
            />
          </template>

          <template #createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <template #actions="{ item }">
            <BaseButton size="sm" variant="secondary" @click="viewTransaction(item)">
              Détails
            </BaseButton>
          </template>
        </BaseTable>

        <div v-if="!loading && combinedTransactions.length === 0" class="p-8 text-center text-gray-500">
          Aucune transaction récente
        </div>
      </div>
    </div>

    <!-- Modal de test de paiement -->
    <Modal 
      :show="showTestModal" 
      title="Test de paiement"
      @close="closeTestModal"
      @confirm="processTestPayment"
      confirm-text="Tester"
    >
      <div class="space-y-4">
        <div>
          <label class="block font-medium mb-2">Montant (EUR):</label>
          <input 
            v-model="testAmount" 
            type="number" 
            min="0.01" 
            step="0.01"
            class="w-full border rounded px-3 py-2"
            placeholder="10.00"
          />
        </div>
        <div>
          <label class="block font-medium mb-2">Description:</label>
          <input 
            v-model="testDescription" 
            type="text"
            class="w-full border rounded px-3 py-2"
            placeholder="Test de paiement"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useRealTimeTransactions } from '@/composables/useRealTimeUpdates'
import StatsCard from '@/components/admin/StatsCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'MerchantDashboard',
  components: {
    StatsCard,
    BaseTable,
    StatusBadge,
    BaseButton,
    Modal
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // Temps réel
    const {
      isConnected,
      liveTransactions,
      transactionStats: realTimeStats
    } = useRealTimeTransactions()
    
    // État local
    const showTestModal = ref(false)
    const testAmount = ref('10.00')
    const testDescription = ref('Test de paiement')

    // État du store
    const loading = computed(() => store.state.merchant.loading)
    const dashboardData = computed(() => store.state.merchant.dashboardData)
    const recentTransactions = computed(() => 
      store.state.merchant.transactions.slice(0, 5)
    )

    // Combiner transactions existantes et nouvelles en temps réel
    const combinedTransactions = computed(() => {
      const live = liveTransactions.value.map(t => ({ ...t, isLive: true }))
      const existing = recentTransactions.value.map(t => ({ ...t, isLive: false }))
      
      // Éviter les doublons
      const combined = [...live]
      existing.forEach(existingTx => {
        if (!live.find(liveTx => liveTx.id === existingTx.id)) {
          combined.push(existingTx)
        }
      })
      
      return combined
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    })

    // Configuration du tableau
    const transactionHeaders = ref([
      { key: 'id', label: 'ID' },
      { key: 'amount', label: 'Montant' },
      { key: 'status', label: 'Statut' },
      { key: 'createdAt', label: 'Date' },
      { key: 'actions', label: 'Actions' }
    ])

    // Données du graphique
    const chartData = computed(() => {
      return dashboardData.value.chartData || []
    })

    // Méthodes
    const fetchDashboardData = async () => {
      await store.dispatch('merchant/fetchDashboardData')
      await store.dispatch('merchant/fetchTransactions', { limit: 5 })
    }

    const testPayment = () => {
      showTestModal.value = true
    }

    const closeTestModal = () => {
      showTestModal.value = false
      testAmount.value = '10.00'
      testDescription.value = 'Test de paiement'
    }

    const processTestPayment = async () => {
      try {
        const paymentData = {
          amount: parseFloat(testAmount.value),
          description: testDescription.value,
          currency: 'EUR'
        }

        const transaction = await store.dispatch('transactions/createPayment', paymentData)
        
        store.dispatch('addNotification', {
          type: 'success',
          title: 'Test créé',
          message: `Transaction de test créée avec l'ID: ${transaction.id}`,
          timeout: 5000
        })

        closeTestModal()
        fetchDashboardData() // Actualiser les données
      } catch (error) {
        store.dispatch('addNotification', {
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de créer le test de paiement',
          timeout: 5000
        })
      }
    }

    const viewTransaction = (transaction) => {
      router.push(`/merchant/transactions/${transaction.id}`)
    }

    const getStatusLabel = (status) => {
      const labels = {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Terminé',
        failed: 'Échoué',
        cancelled: 'Annulé'
      }
      return labels[status] || status
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    }

    // Chargement initial
    onMounted(() => {
      fetchDashboardData()
    })

    return {
      // Temps réel
      isConnected,
      liveTransactions,
      realTimeStats,
      combinedTransactions,
      
      // État local
      showTestModal,
      testAmount,
      testDescription,
      loading,
      dashboardData,
      recentTransactions,
      transactionHeaders,
      chartData,
      
      // Méthodes
      testPayment,
      closeTestModal,
      processTestPayment,
      viewTransaction,
      getStatusLabel,
      formatCurrency,
      formatDate
    }
  }
}
</script>