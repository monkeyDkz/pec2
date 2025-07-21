<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="max-w-sm bg-white rounded-lg shadow-lg border"
          :class="getToastClasses(toast.type)"
        >
          <div class="p-4">
            <div class="flex items-start">
              <!-- Icône -->
              <div class="flex-shrink-0">
                <component :is="getToastIcon(toast.type)" class="w-5 h-5" />
              </div>
              
              <!-- Contenu -->
              <div class="ml-3 w-0 flex-1">
                <p class="text-sm font-medium" :class="getTextClass(toast.type)">
                  {{ toast.message }}
                </p>
                
                <!-- Détails supplémentaires -->
                <p v-if="toast.details" class="mt-1 text-xs text-gray-500">
                  {{ toast.details }}
                </p>
                
                <!-- Actions -->
                <div v-if="toast.actions" class="mt-2 flex space-x-2">
                  <button
                    v-for="action in toast.actions"
                    :key="action.label"
                    @click="action.handler"
                    class="text-xs font-medium px-2 py-1 rounded border"
                    :class="action.primary ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
              
              <!-- Bouton fermer -->
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeToast(toast.id)"
                  class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Barre de progression pour l'auto-dismiss -->
            <div
              v-if="toast.duration && toast.duration > 0"
              class="mt-2 w-full bg-gray-200 rounded-full h-1"
            >
              <div
                class="h-1 rounded-full transition-all duration-100"
                :class="getProgressClass(toast.type)"
                :style="{ width: `${toast.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ToastNotifications',
  setup() {
    const store = useStore()
    const toasts = ref([])
    const toastTimeout = new Map()

    // Écouter les nouvelles toasts du store
    onMounted(() => {
      store.subscribe((mutation) => {
        if (mutation.type === 'ADD_TOAST_NOTIFICATION') {
          addToast(mutation.payload)
        }
      })
    })

    // Nettoyer les timeouts
    onUnmounted(() => {
      toastTimeout.forEach(timeout => clearTimeout(timeout))
      toastTimeout.clear()
    })

    // Ajouter une toast
    const addToast = (toastData) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: toastData.type || 'info',
        message: toastData.message,
        details: toastData.details,
        actions: toastData.actions,
        duration: toastData.duration || 5000,
        progress: 100
      }

      toasts.value.push(toast)

      // Auto-dismiss avec progression
      if (toast.duration > 0) {
        let startTime = Date.now()
        
        const updateProgress = () => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, toast.duration - elapsed)
          toast.progress = (remaining / toast.duration) * 100

          if (remaining > 0) {
            requestAnimationFrame(updateProgress)
          } else {
            removeToast(toast.id)
          }
        }

        requestAnimationFrame(updateProgress)
      }
    }

    // Supprimer une toast
    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
      
      // Nettoyer le timeout
      if (toastTimeout.has(id)) {
        clearTimeout(toastTimeout.get(id))
        toastTimeout.delete(id)
      }
    }

    // Classes CSS selon le type
    const getToastClasses = (type) => {
      switch (type) {
        case 'success':
          return 'border-green-200 bg-green-50'
        case 'error':
          return 'border-red-200 bg-red-50'
        case 'warning':
          return 'border-yellow-200 bg-yellow-50'
        case 'info':
        default:
          return 'border-blue-200 bg-blue-50'
      }
    }

    const getTextClass = (type) => {
      switch (type) {
        case 'success':
          return 'text-green-800'
        case 'error':
          return 'text-red-800'
        case 'warning':
          return 'text-yellow-800'
        case 'info':
        default:
          return 'text-blue-800'
      }
    }

    const getProgressClass = (type) => {
      switch (type) {
        case 'success':
          return 'bg-green-500'
        case 'error':
          return 'bg-red-500'
        case 'warning':
          return 'bg-yellow-500'
        case 'info':
        default:
          return 'bg-blue-500'
      }
    }

    // Icônes selon le type
    const getToastIcon = (type) => {
      const icons = {
        success: {
          template: `<svg fill="currentColor" viewBox="0 0 20 20" class="text-green-400">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>`
        },
        error: {
          template: `<svg fill="currentColor" viewBox="0 0 20 20" class="text-red-400">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>`
        },
        warning: {
          template: `<svg fill="currentColor" viewBox="0 0 20 20" class="text-yellow-400">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>`
        },
        info: {
          template: `<svg fill="currentColor" viewBox="0 0 20 20" class="text-blue-400">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>`
        }
      }
      
      return {
        template: icons[type]?.template || icons.info.template
      }
    }

    return {
      toasts,
      removeToast,
      getToastClasses,
      getTextClass,
      getProgressClass,
      getToastIcon
    }
  }
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
