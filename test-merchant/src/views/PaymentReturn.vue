<template>
  <div class="payment-return-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Success Result -->
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="text-6xl mb-6">✅</div>
          <h1 class="text-3xl font-bold text-green-800 mb-4">Paiement Réussi !</h1>
          <p class="text-gray-600 mb-6">Votre transaction a été traitée avec succès.</p>

          <!-- Transaction Details -->
          <div v-if="transactionDetails" class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-green-800 mb-4">Détails de la Transaction</h2>
            <div class="space-y-2 text-left">
              <div class="flex justify-between">
                <span class="font-medium">ID Transaction:</span>
                <span class="font-mono text-sm">{{ transactionDetails.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Montant:</span>
                <span class="font-bold text-green-800">{{ formatCurrency(transactionDetails.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Date:</span>
                <span>{{ formatDate(transactionDetails.timestamp) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Statut:</span>
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {{ transactionDetails.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div v-if="orderItems && orderItems.length > 0" class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-gray-800 mb-3">Résumé de la Commande</h3>
            <div class="space-y-2">
              <div v-for="item in orderItems" :key="item.id" class="flex justify-between text-sm">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>{{ formatCurrency(item.price * item.quantity) }}</span>
              </div>
              <div class="border-t pt-2 font-bold flex justify-between">
                <span>Total:</span>
                <span>{{ formatCurrency(orderTotal) }}</span>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-blue-800 mb-3">🎉 Prochaines Étapes</h3>
            <div class="text-left text-blue-700 space-y-2">
              <p>✓ Votre paiement a été confirmé</p>
              <p>✓ Un email de confirmation va être envoyé</p>
              <p>✓ Votre commande sera traitée dans les plus brefs délais</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/transactions"
              class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              📋 Voir mes Transactions
            </router-link>
            <router-link
              to="/shop"
              class="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              🛍️ Continuer mes Achats
            </router-link>
            <router-link
              to="/"
              class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              🏠 Retour Accueil
            </router-link>
          </div>

          <!-- Support Info -->
          <div class="mt-8 p-4 bg-gray-100 rounded-lg">
            <p class="text-sm text-gray-600">
              <strong>Besoin d'aide ?</strong><br>
              Contactez notre support: <a href="mailto:support@example.com" class="text-blue-600">support@example.com</a><br>
              Référence de transaction: <span class="font-mono">{{ transactionDetails?.id || 'N/A' }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTransactionsStore, useCartStore } from '../stores/index.js'

const route = useRoute()
const transactionsStore = useTransactionsStore()
const cartStore = useCartStore()

const transactionDetails = ref(null)
const orderItems = ref([])

const orderTotal = computed(() => {
  return orderItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp))
}

onMounted(() => {
  // Get transaction details from URL params or last transaction
  const transactionId = route.query.transaction_id || route.query.txn_id
  
  if (transactionId) {
    // Find transaction in store
    const transaction = transactionsStore.transactions.find(t => t.id === transactionId)
    if (transaction) {
      transactionDetails.value = transaction
      orderItems.value = transaction.items || []
    }
  } else {
    // Use last transaction if no ID provided
    if (cartStore.lastTransaction) {
      transactionDetails.value = cartStore.lastTransaction
      orderItems.value = cartStore.lastTransaction.items || []
    }
  }
  
  // If still no transaction, create a mock one
  if (!transactionDetails.value) {
    transactionDetails.value = {
      id: 'TXN_' + Date.now(),
      amount: 299.99,
      status: 'captured',
      timestamp: new Date().toISOString()
    }
  }
  
  // Clear cart after successful payment
  setTimeout(() => {
    cartStore.clearCart()
  }, 2000)
})
</script>
