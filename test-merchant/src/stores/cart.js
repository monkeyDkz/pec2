import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    customerInfo: {
      email: '',
      firstName: '',
      lastName: '',
      billingAddress: {
        street: '',
        city: '',
        postalCode: '',
        country: 'FR'
      }
    }
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    total: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    isEmpty: (state) => state.items.length === 0,
    
    // Calculs détaillés pour l'affichage
    subtotal: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    shipping() {
      return this.subtotal >= 100 ? 0 : 9.99
    },
    taxes() {
      return this.subtotal * 0.2 // 20% TVA
    },
    finalTotal() {
      return this.subtotal + this.shipping + this.taxes
    }
  },

  actions: {
    addItem(product) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += (product.quantity || 1)
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          description: product.description,
          quantity: product.quantity || 1,
          addedAt: new Date().toISOString()
        })
      }
      
      this.saveToStorage()
    },

    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToStorage()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          item.quantity = quantity
          this.saveToStorage()
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveToStorage()
    },

    updateCustomerInfo(info) {
      this.customerInfo = { ...this.customerInfo, ...info }
      this.saveToStorage()
    },

    generateOrderId() {
      return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    },

    getTransactionData(orderId = null) {
      return {
        orderId: orderId || this.generateOrderId(),
        amount: this.finalTotal,
        currency: 'EUR',
        description: this.getOrderDescription(),
        customerInfo: this.customerInfo,
        items: this.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.quantity * item.price
        })),
        metadata: {
          totalItems: this.itemCount,
          subtotal: this.subtotal,
          shipping: this.shipping,
          taxes: this.taxes,
          createdFrom: 'test-merchant-site',
          timestamp: new Date().toISOString()
        }
      }
    },

    getOrderDescription() {
      if (this.items.length === 1) {
        return `${this.items[0].name} x${this.items[0].quantity}`
      } else {
        return `Commande test marchand (${this.itemCount} articles)`
      }
    },

    loadCart() {
      try {
        const savedItems = localStorage.getItem('testMerchantCart')
        const savedCustomer = localStorage.getItem('testMerchantCustomer')
        
        if (savedItems) {
          this.items = JSON.parse(savedItems)
        }
        if (savedCustomer) {
          this.customerInfo = JSON.parse(savedCustomer)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
        this.items = []
      }
    },

    saveToStorage() {
      try {
        localStorage.setItem('testMerchantCart', JSON.stringify(this.items))
        localStorage.setItem('testMerchantCustomer', JSON.stringify(this.customerInfo))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du panier:', error)
      }
    }
  }
})
