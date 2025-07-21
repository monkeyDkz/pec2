import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// Export des stores pour faciliter l'import
export { useAuthStore } from './auth'
export { useMerchantsStore } from './merchants'
export { useAdminStore } from './admin'
export { useNotificationStore } from './notifications'