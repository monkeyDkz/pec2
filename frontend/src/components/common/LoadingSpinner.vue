<template>
  <div class="loading-spinner-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  }
})

// Computed
const containerClass = computed(() => ({
  'loading-overlay': props.overlay,
  [`loading-${props.size}`]: true
}))

const spinnerClass = computed(() => ({
  [`spinner-${props.color}`]: true,
  [`spinner-${props.size}`]: true
}))
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

.loading-spinner {
  position: relative;
  display: inline-block;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

/* Sizes */
.spinner-small {
  width: 24px;
  height: 24px;
}

.spinner-small .spinner-ring {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-medium {
  width: 40px;
  height: 40px;
}

.spinner-medium .spinner-ring {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-large {
  width: 64px;
  height: 64px;
}

.spinner-large .spinner-ring {
  width: 64px;
  height: 64px;
  border-width: 4px;
}

/* Colors */
.spinner-primary .spinner-ring:nth-child(1) {
  border-top-color: #3b82f6;
  animation-delay: -0.45s;
}

.spinner-primary .spinner-ring:nth-child(2) {
  border-top-color: #60a5fa;
  animation-delay: -0.3s;
}

.spinner-primary .spinner-ring:nth-child(3) {
  border-top-color: #93c5fd;
  animation-delay: -0.15s;
}

.spinner-secondary .spinner-ring:nth-child(1) {
  border-top-color: #64748b;
  animation-delay: -0.45s;
}

.spinner-secondary .spinner-ring:nth-child(2) {
  border-top-color: #94a3b8;
  animation-delay: -0.3s;
}

.spinner-secondary .spinner-ring:nth-child(3) {
  border-top-color: #cbd5e1;
  animation-delay: -0.15s;
}

.spinner-white .spinner-ring:nth-child(1) {
  border-top-color: #ffffff;
  animation-delay: -0.45s;
}

.spinner-white .spinner-ring:nth-child(2) {
  border-top-color: rgba(255, 255, 255, 0.7);
  animation-delay: -0.3s;
}

.spinner-white .spinner-ring:nth-child(3) {
  border-top-color: rgba(255, 255, 255, 0.4);
  animation-delay: -0.15s;
}

.loading-message {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

.loading-overlay .loading-message {
  color: #374151;
  font-size: 1rem;
}

/* Animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Container padding adjustments */
.loading-small {
  padding: 0.5rem;
}

.loading-medium {
  padding: 1rem;
}

.loading-large {
  padding: 2rem;
}
</style>