<template>
  <div 
    class="toast"
    :class="[
      `toast-${notification.type}`,
      { 'toast-show': show }
    ]"
    @click="handleClick"
  >
    <div class="toast-icon">
      <CheckCircleIcon v-if="notification.type === 'success'" class="h-5 w-5" />
      <ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="h-5 w-5" />
      <XCircleIcon v-else-if="notification.type === 'error'" class="h-5 w-5" />
      <InformationCircleIcon v-else class="h-5 w-5" />
    </div>
    
    <div class="toast-content">
      <h4 v-if="notification.title" class="toast-title">{{ notification.title }}</h4>
      <p class="toast-message">{{ notification.message }}</p>
    </div>
    
    <button @click="close" class="toast-close">
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close'])

// Reactive data
const show = ref(false)
let autoCloseTimeout = null

// Methods
const close = () => {
  show.value = false
  setTimeout(() => {
    emit('close', props.notification.id)
  }, 300) // Wait for animation
}

const handleClick = () => {
  if (props.notification.onClick) {
    props.notification.onClick()
  }
}

// Lifecycle
onMounted(() => {
  // Show toast with animation
  setTimeout(() => {
    show.value = true
  }, 100)

  // Auto close after duration
  if (props.notification.duration !== 0) {
    const duration = props.notification.duration || 5000
    autoCloseTimeout = setTimeout(close, duration)
  }
})

onUnmounted(() => {
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout)
  }
})
</script>

<style scoped>
.toast {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 400px;
  min-width: 300px;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid;
}

.toast-show {
  opacity: 1;
  transform: translateX(0);
}

.toast-success {
  border-left-color: #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left-color: #06b6d4;
}

.toast-info .toast-icon {
  color: #06b6d4;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.toast-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.toast:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
