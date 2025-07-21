<template>
  <div class="cart">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800">🛒 Panier</h2>
      <span class="bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
        {{ totalItems }}
      </span>
    </div>

    <!-- Empty Cart -->
    <div v-if="items.length === 0" class="text-center py-8">
      <div class="text-4xl mb-3">🛒</div>
      <p class="text-gray-500">Votre panier est vide</p>
    </div>

    <!-- Cart Items -->
    <div v-else class="space-y-4">
      <!-- Items List -->
      <div class="max-h-96 overflow-y-auto space-y-3">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center flex-1">
            <div class="text-2xl mr-3">{{ item.image }}</div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
              <p class="text-xs text-gray-500">{{ formatCurrency(item.price) }} × {{ item.quantity }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Quantity Controls -->
            <div class="flex items-center border border-gray-300 rounded">
              <button
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                -
              </button>
              <span class="px-2 py-1 text-xs">{{ item.quantity }}</span>
              <button
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= 99"
                class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                +
              </button>
            </div>

            <!-- Remove Button -->
            <button
              @click="removeItem(item.id)"
              class="text-red-500 hover:text-red-700 text-sm"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div class="border-t pt-4">
        <!-- Subtotal -->
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Sous-total ({{ totalItems }} articles)</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>

        <!-- Shipping -->
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Livraison</span>
          <span>{{ formatCurrency(shipping) }}</span>
        </div>

        <!-- Taxes -->
        <div class="flex justify-between text-sm text-gray-600 mb-3">
          <span>TVA (20%)</span>
          <span>{{ formatCurrency(taxes) }}</span>
        </div>

        <!-- Total -->
        <div class="border-t pt-3">
          <div class="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Cart Actions -->
      <div class="space-y-2">
        <button
          @click="checkout"
          :disabled="items.length === 0"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          💳 Procéder au paiement
        </button>

        <button
          @click="clearCart"
          :disabled="items.length === 0"
          class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          🗑️ Vider le panier
        </button>
      </div>

      <!-- Promo Code -->
      <div class="border-t pt-4">
        <div class="flex space-x-2">
          <input
            v-model="promoCode"
            type="text"
            placeholder="Code promo"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="applyPromoCode"
            :disabled="!promoCode.trim()"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
          >
            Appliquer
          </button>
        </div>
        
        <div v-if="appliedPromo" class="mt-2 text-sm text-green-600">
          ✅ Code "{{ appliedPromo.code }}" appliqué: -{{ formatCurrency(appliedPromo.discount) }}
        </div>
      </div>

      <!-- Cart Stats -->
      <div class="border-t pt-4">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ totalItems }}</div>
            <div class="text-xs text-gray-500">Articles</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ formatCurrency(savings) }}</div>
            <div class="text-xs text-gray-500">Économies</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Cart',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    }
  },
  emits: ['update-quantity', 'remove-item', 'clear-cart', 'checkout'],
  setup(props, { emit }) {
    const promoCode = ref('')
    const appliedPromo = ref(null)

    // Computed properties
    const totalItems = computed(() => {
      return props.items.reduce((sum, item) => sum + item.quantity, 0)
    })

    const subtotal = computed(() => {
      return props.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    const shipping = computed(() => {
      // Free shipping over 100€
      return subtotal.value >= 100 ? 0 : 9.99
    })

    const taxes = computed(() => {
      return subtotal.value * 0.2 // 20% VAT
    })

    const promoDiscount = computed(() => {
      return appliedPromo.value ? appliedPromo.value.discount : 0
    })

    const finalTotal = computed(() => {
      return Math.max(0, subtotal.value + shipping.value + taxes.value - promoDiscount.value)
    })

    const savings = computed(() => {
      const regularShipping = 9.99
      const shippingSavings = subtotal.value >= 100 ? regularShipping : 0
      return shippingSavings + promoDiscount.value
    })

    // Helper functions
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    // Actions
    const updateQuantity = (itemId, newQuantity) => {
      if (newQuantity <= 0) {
        removeItem(itemId)
      } else {
        emit('update-quantity', itemId, newQuantity)
      }
    }

    const removeItem = (itemId) => {
      emit('remove-item', itemId)
    }

    const clearCart = () => {
      if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
        emit('clear-cart')
        appliedPromo.value = null
        promoCode.value = ''
      }
    }

    const checkout = () => {
      emit('checkout')
    }

    const applyPromoCode = () => {
      const code = promoCode.value.trim().toUpperCase()
      
      // Sample promo codes
      const promoCodes = {
        'WELCOME10': { code: 'WELCOME10', discount: 10, type: 'fixed' },
        'SAVE5': { code: 'SAVE5', discount: 5, type: 'fixed' },
        'PERCENT10': { code: 'PERCENT10', discount: subtotal.value * 0.1, type: 'percentage' },
        'FREESHIP': { code: 'FREESHIP', discount: shipping.value, type: 'shipping' }
      }

      if (promoCodes[code]) {
        appliedPromo.value = promoCodes[code]
        promoCode.value = ''
      } else {
        alert('Code promo invalide')
      }
    }

    return {
      promoCode,
      appliedPromo,
      totalItems,
      subtotal,
      shipping,
      taxes,
      savings,
      finalTotal,
      formatCurrency,
      updateQuantity,
      removeItem,
      clearCart,
      checkout,
      applyPromoCode
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for items list */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
.item-enter-active,
.item-leave-active {
  transition: all 0.3s ease;
}

.item-enter-from,
.item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Button hover effects */
button {
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
