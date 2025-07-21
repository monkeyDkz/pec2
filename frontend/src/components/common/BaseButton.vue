<template>
  <button :class="buttonClass" :disabled="disabled" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    disabled: Boolean
  },
  emits: ['click'],
  computed: {
    buttonClass() {
      const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white'
      }
      const sizes = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
      }
      return `${variants[this.variant]} ${sizes[this.size]} rounded font-medium transition-colors disabled:opacity-50`
    }
  }
}
</script>