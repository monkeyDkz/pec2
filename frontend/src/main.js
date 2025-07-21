import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAuthStore } from './stores/auth'

// Import Tailwind CSS
import './assets/css/tailwind.css'

// Créer l'application Vue
const app = createApp(App)

// Configurer les plugins
app.use(pinia)
app.use(router)

// Initialiser l'authentification au démarrage
const authStore = useAuthStore()
authStore.initializeAuth()

// Monter l'application
app.mount('#app')
