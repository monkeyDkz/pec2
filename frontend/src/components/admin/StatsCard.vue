<template>
  <div :class="cardClass" class="rounded-lg shadow p-6 relative">
    <!-- Indicateur temps réel -->
    <div v-if="isLive" class="absolute top-2 right-2 flex items-center">
      <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
      <span class="text-xs text-green-600 font-medium">LIVE</span>
    </div>
    
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900" :class="{ 'animate-pulse': isUpdating }">{{ value }}</p>
        
        <!-- Changement de valeur -->
        <div v-if="previousValue && previousValue !== value" class="mt-1">
          <span 
            class="text-sm font-medium"
            :class="change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'"
          >
            {{ change > 0 ? '↗' : change < 0 ? '↘' : '→' }}
            {{ Math.abs(change) }}
            {{ changeType === 'currency' ? '€' : '' }}
          </span>
        </div>
      </div>
      
      <div :class="iconClass" class="text-3xl">
        {{ icon }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'

export default {
  name: 'StatsCard',
  props: {
    title: String,
    value: [String, Number],
    icon: String,
    color: { type: String, default: 'blue' },
    isLive: { type: Boolean, default: false },
    previousValue: [String, Number],
    changeType: { type: String, default: 'number' } // 'number', 'currency', 'percentage'
  },
  setup(props) {
    const isUpdating = ref(false)
    
    // Calculer le changement
    const change = computed(() => {
      if (!props.previousValue || props.previousValue === props.value) return 0
      
      const current = parseFloat(props.value) || 0
      const previous = parseFloat(props.previousValue) || 0
      
      return current - previous
    })
    
    // Animation lors du changement de valeur
    watch(() => props.value, (newVal, oldVal) => {
      if (newVal !== oldVal && props.isLive) {
        isUpdating.value = true
        setTimeout(() => {
          isUpdating.value = false
        }, 1000)
      }
    })
    
    return {
      isUpdating,
      change
    }
  },
  computed: {
    cardClass() {
      const colors = {
        blue: 'bg-blue-50 border-l-4 border-blue-500',
        green: 'bg-green-50 border-l-4 border-green-500',
        yellow: 'bg-yellow-50 border-l-4 border-yellow-500',
        red: 'bg-red-50 border-l-4 border-red-500',
        purple: 'bg-purple-50 border-l-4 border-purple-500'
      }
      return colors[this.color] || colors.blue
    },
    iconClass() {
      const colors = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        yellow: 'text-yellow-500',
        red: 'text-red-500',
        purple: 'text-purple-500'
      }
      return colors[this.color] || colors.blue
    }
  }
}
</script>