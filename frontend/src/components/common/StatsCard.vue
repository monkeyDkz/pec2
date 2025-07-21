<template>
  <div class="stats-card" :class="colorClass">
    <div class="stats-icon">
      <component :is="iconComponent" class="h-6 w-6" />
    </div>
    
    <div class="stats-content">
      <div class="stats-value">{{ displayValue }}</div>
      <div class="stats-title">{{ title }}</div>
      <div v-if="subtitle" class="stats-subtitle">{{ subtitle }}</div>
    </div>
    
    <div v-if="trend" class="stats-trend" :class="trendClass">
      <ArrowUpIcon v-if="trend > 0" class="h-4 w-4" />
      <ArrowDownIcon v-else class="h-4 w-4" />
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'chart-bar'
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  trend: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed
const iconComponent = computed(() => {
  const iconMap = {
    'home': HomeIcon,
    'users': UsersIcon,
    'credit-card': CreditCardIcon,
    'chart-bar': ChartBarIcon,
    'clock': ClockIcon,
    'check-circle': CheckCircleIcon,
    'exclamation-triangle': ExclamationTriangleIcon,
    'x-circle': XCircleIcon,
    'banknotes': BanknotesIcon,
    'shopping-bag': ShoppingBagIcon
  }
  return iconMap[props.icon] || ChartBarIcon
})

const colorClass = computed(() => `stats-card-${props.color}`)

const trendClass = computed(() => {
  if (!props.trend) return ''
  return props.trend > 0 ? 'trend-up' : 'trend-down'
})

const displayValue = computed(() => {
  if (props.loading) return '...'
  
  // Format number with separators
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('fr-FR')
  }
  
  return props.value
})
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stats-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.125rem;
}

.stats-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.stats-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.trend-up {
  color: #10b981;
  background-color: #ecfdf5;
}

.trend-down {
  color: #ef4444;
  background-color: #fef2f2;
}

/* Color variants */
.stats-card-primary {
  border-left: 4px solid #3b82f6;
}

.stats-card-primary .stats-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.stats-card-primary .stats-value {
  color: #1e40af;
}

.stats-card-secondary {
  border-left: 4px solid #64748b;
}

.stats-card-secondary .stats-icon {
  background-color: #f1f5f9;
  color: #64748b;
}

.stats-card-secondary .stats-value {
  color: #334155;
}

.stats-card-success {
  border-left: 4px solid #10b981;
}

.stats-card-success .stats-icon {
  background-color: #ecfdf5;
  color: #10b981;
}

.stats-card-success .stats-value {
  color: #047857;
}

.stats-card-warning {
  border-left: 4px solid #f59e0b;
}

.stats-card-warning .stats-icon {
  background-color: #fffbeb;
  color: #f59e0b;
}

.stats-card-warning .stats-value {
  color: #d97706;
}

.stats-card-error {
  border-left: 4px solid #ef4444;
}

.stats-card-error .stats-icon {
  background-color: #fef2f2;
  color: #ef4444;
}

.stats-card-error .stats-value {
  color: #dc2626;
}

.stats-card-info {
  border-left: 4px solid #06b6d4;
}

.stats-card-info .stats-icon {
  background-color: #ecfeff;
  color: #06b6d4;
}

.stats-card-info .stats-value {
  color: #0891b2;
}

/* Loading state */
.stats-card .stats-value:has-text('...') {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .stats-card {
    padding: 1rem;
  }
  
  .stats-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .stats-value {
    font-size: 1.5rem;
  }
  
  .stats-trend {
    font-size: 0.75rem;
  }
}
</style>
