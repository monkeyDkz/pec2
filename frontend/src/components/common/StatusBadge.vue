<template>
  <span class="status-badge" :class="badgeClass">
    <span class="status-indicator"></span>
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'user', 'merchant', 'transaction', 'operation'].includes(value)
  }
})

// Computed
const statusConfig = computed(() => {
  const configs = {
    // Default/Generic statuses
    active: { label: 'Actif', class: 'success' },
    inactive: { label: 'Inactif', class: 'secondary' },
    pending: { label: 'En attente', class: 'warning' },
    suspended: { label: 'Suspendu', class: 'error' },
    
    // User statuses
    verified: { label: 'Vérifié', class: 'success' },
    unverified: { label: 'Non vérifié', class: 'warning' },
    
    // Merchant statuses
    approved: { label: 'Approuvé', class: 'success' },
    rejected: { label: 'Rejeté', class: 'error' },
    
    // Transaction statuses
    completed: { label: 'Terminée', class: 'success' },
    processing: { label: 'En cours', class: 'info' },
    failed: { label: 'Échouée', class: 'error' },
    cancelled: { label: 'Annulée', class: 'secondary' },
    refunded: { label: 'Remboursée', class: 'warning' },
    
    // Operation statuses
    success: { label: 'Succès', class: 'success' },
    error: { label: 'Erreur', class: 'error' },
    
    // Request statuses
    create_merchant: { label: 'Création marchand', class: 'info' },
    join_merchant: { label: 'Rejoindre marchand', class: 'info' },
    
    // Payment statuses
    paid: { label: 'Payé', class: 'success' },
    unpaid: { label: 'Non payé', class: 'warning' },
    overdue: { label: 'En retard', class: 'error' }
  }
  
  return configs[props.status] || { label: props.status, class: 'secondary' }
})

const statusLabel = computed(() => statusConfig.value.label)
const badgeClass = computed(() => `badge-${statusConfig.value.class}`)
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Success variant */
.badge-success {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.badge-success .status-indicator {
  background-color: #10b981;
}

/* Error variant */
.badge-error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.badge-error .status-indicator {
  background-color: #ef4444;
}

/* Warning variant */
.badge-warning {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.badge-warning .status-indicator {
  background-color: #f59e0b;
}

/* Info variant */
.badge-info {
  background-color: #ecfeff;
  color: #0891b2;
  border: 1px solid #a5f3fc;
}

.badge-info .status-indicator {
  background-color: #06b6d4;
}

/* Secondary variant */
.badge-secondary {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.badge-secondary .status-indicator {
  background-color: #64748b;
}

/* Primary variant */
.badge-primary {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.badge-primary .status-indicator {
  background-color: #3b82f6;
}

/* Hover effect */
.status-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Animation for status changes */
.status-badge {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>