<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-4">
        <slot></slot>
      </div>
      <div class="flex justify-end space-x-2 p-4 border-t">
        <button @click="$emit('close')" class="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
          Annuler
        </button>
        <button @click="$emit('confirm')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: Boolean,
    title: String,
    confirmText: { type: String, default: 'Confirmer' }
  },
  emits: ['close', 'confirm']
}
</script>