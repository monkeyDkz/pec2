# FRONTEND MANQUANT CRITIQUE

## 🏪 DASHBOARD MARCHAND COMPLET
```vue
<!-- views/merchant/MerchantDashboard.vue - À REFAIRE ENTIÈREMENT -->
<template>
  <div class="merchant-dashboard">
    <!-- KPIs Cards -->
    <div class="grid grid-cols-4 gap-6 mb-8">
      <StatCard title="Chiffre d'affaires" :value="stats.revenue" icon="CurrencyEuroIcon" />
      <StatCard title="Transactions" :value="stats.transactions" icon="CreditCardIcon" />
      <StatCard title="Taux de conversion" :value="stats.conversionRate" icon="ChartBarIcon" />
      <StatCard title="Panier moyen" :value="stats.averageBasket" icon="ShoppingBagIcon" />
    </div>
    
    <!-- Graphiques -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <RevenueChart :data="chartData.revenue" />
      <TransactionChart :data="chartData.transactions" />
    </div>
    
    <!-- Transactions récentes -->
    <RecentTransactions :transactions="recentTransactions" />
  </div>
</template>

<!-- views/merchant/MerchantTransactions.vue - À REFAIRE -->
<template>
  <div class="merchant-transactions">
    <!-- Filtres avancés -->
    <TransactionFilters @filter="applyFilters" />
    
    <!-- Table des transactions -->
    <TransactionTable 
      :transactions="transactions"
      :loading="loading"
      @refund="showRefundModal"
      @view="viewTransaction"
    />
    
    <!-- Modal de remboursement -->
    <RefundModal 
      :show="showRefund"
      :transaction="selectedTransaction"
      @confirm="processRefund"
      @close="closeRefundModal"
    />
  </div>
</template>

<!-- views/merchant/MerchantSettings.vue - MANQUE COMPLÈTEMENT -->
<template>
  <div class="merchant-settings">
    <!-- Credentials Management -->
    <CredentialsSection 
      :credentials="credentials"
      @regenerate="regenerateCredentials"
    />
    
    <!-- Webhook Configuration -->
    <WebhookSection 
      :webhooks="webhookConfig"
      @update="updateWebhooks"
    />
    
    <!-- Team Management -->
    <TeamSection 
      :team="teamMembers"
      @invite="inviteTeamMember"
      @remove="removeTeamMember"
    />
  </div>
</template>
```

## 📊 COMPOSANTS MÉTIER MANQUANTS
```vue
<!-- components/charts/RevenueChart.vue -->
<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<!-- components/merchant/TransactionFilters.vue -->
<template>
  <div class="filters-panel">
    <DateRangePicker v-model="dateRange" />
    <StatusFilter v-model="statusFilter" />
    <AmountFilter v-model="amountFilter" />
    <SearchInput v-model="searchTerm" placeholder="Référence, email..." />
  </div>
</template>

<!-- components/merchant/RefundModal.vue -->
<template>
  <BaseModal :show="show" title="Remboursement" @close="$emit('close')">
    <RefundForm 
      :transaction="transaction"
      @submit="$emit('confirm', $event)"
    />
  </BaseModal>
</template>

<!-- components/admin/KPICards.vue -->
<template>
  <div class="grid grid-cols-4 gap-6">
    <StatCard 
      v-for="kpi in kpis" 
      :key="kpi.key"
      :title="kpi.title"
      :value="kpi.value"
      :change="kpi.change"
      :icon="kpi.icon"
    />
  </div>
</template>
```

## ⚡ TEMPS RÉEL - WebSockets
```javascript
// services/websocketService.js - MANQUE COMPLÈTEMENT
class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(url) {
    this.ws = new WebSocket(url)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
    
    this.ws.onclose = () => {
      this.reconnect()
    }
  }

  handleMessage(data) {
    switch(data.type) {
      case 'TRANSACTION_UPDATE':
        this.updateTransaction(data.payload)
        break
      case 'NEW_TRANSACTION':
        this.addTransaction(data.payload)
        break
      case 'REFUND_PROCESSED':
        this.updateRefund(data.payload)
        break
    }
  }
}

// composables/useRealTimeUpdates.js - MANQUE
export function useRealTimeUpdates() {
  const store = useStore()
  const ws = new WebSocketService()
  
  onMounted(() => {
    ws.connect(process.env.VUE_APP_WS_URL)
  })
  
  onUnmounted(() => {
    ws.disconnect()
  })
  
  return {
    isConnected: ws.isConnected
  }
}
```
