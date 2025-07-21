<template>
  <div class="product-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
    <div class="text-center">
      <!-- Product Image/Icon -->
      <div class="text-6xl mb-3">{{ product.image }}</div>
      
      <!-- Product Info -->
      <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ product.name }}</h3>
      <p class="text-sm text-gray-600 mb-2">{{ product.category }}</p>
      <p class="text-xs text-gray-500 mb-4">{{ product.description }}</p>
      
      <!-- Price -->
      <div class="text-2xl font-bold text-blue-600 mb-4">
        {{ formatCurrency(product.price) }}
      </div>
      
      <!-- Quantity Selector -->
      <div class="flex items-center justify-center mb-4">
        <label class="text-sm text-gray-700 mr-2">Quantité:</label>
        <div class="flex items-center border border-gray-300 rounded-md">
          <button
            @click="decrementQuantity"
            :disabled="quantity <= 1"
            class="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            max="99"
            class="w-16 px-2 py-1 text-center border-0 focus:outline-none"
          />
          <button
            @click="incrementQuantity"
            :disabled="quantity >= 99"
            class="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>
      
      <!-- Add to Cart Button -->
      <button
        @click="addToCart"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        🛒 Ajouter au panier
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true,
      validator: (product) => {
        return product.id && product.name && typeof product.price === 'number'
      }
    }
  },
  emits: ['add-to-cart'],
  setup(props, { emit }) {
    const quantity = ref(1)

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    const incrementQuantity = () => {
      if (quantity.value < 99) {
        quantity.value++
      }
    }

    const decrementQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = () => {
      emit('add-to-cart', {
        ...props.product,
        quantity: quantity.value
      })
      
      // Reset quantity to 1 after adding to cart
      quantity.value = 1
    }

    return {
      quantity,
      formatCurrency,
      incrementQuantity,
      decrementQuantity,
      addToCart
    }
  }
}
</script>

<style scoped>
/* Animations */
.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Input number styling */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
