<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <router-link to="/" class="inline-block">
          <h2 class="text-3xl font-bold text-indigo-600 mb-2">Payment Platform</h2>
        </router-link>
        <h3 class="text-xl font-semibold text-gray-900">Vérification de votre email</h3>
      </div>

      <!-- État de vérification -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- En cours de vérification -->
        <div v-if="verificationState === 'loading'" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Vérification en cours...</h3>
          <p class="text-gray-600">Veuillez patienter pendant que nous vérifions votre email.</p>
        </div>

        <!-- Succès -->
        <div v-else-if="verificationState === 'success'" class="text-center">
          <div class="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-green-800 mb-2">Email vérifié avec succès ! ✅</h3>
          <p class="text-green-700 mb-4">
            Votre compte est maintenant actif. Vous allez être redirigé vers votre tableau de bord.
          </p>
          <div class="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p class="text-sm text-green-600">
              Redirection automatique dans <strong>{{ redirectCountdown }}</strong> secondes...
            </p>
          </div>
          <router-link
            :to="redirectPath"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Accéder au tableau de bord
          </router-link>
        </div>

        <!-- Erreur -->
        <div v-else-if="verificationState === 'error'" class="text-center">
          <div class="rounded-full bg-red-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-red-800 mb-2">Erreur de vérification ❌</h3>
          <p class="text-red-700 mb-4">{{ errorMessage }}</p>
          
          <div class="space-y-3">
            <router-link
              to="/login"
              class="block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Aller à la connexion
            </router-link>
            <router-link
              to="/register"
              class="block border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Créer un nouveau compte
            </router-link>
          </div>
        </div>

        <!-- Token manquant -->
        <div v-else class="text-center">
          <div class="rounded-full bg-amber-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg class="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-amber-800 mb-2">Lien de vérification invalide ⚠️</h3>
          <p class="text-amber-700 mb-4">
            Le lien de vérification semble être invalide ou incomplet.
          </p>
          
          <div class="space-y-3">
            <router-link
              to="/login"
              class="block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Aller à la connexion
            </router-link>
            <p class="text-sm text-gray-600">
              Vous pouvez demander un nouvel email de vérification depuis la page de connexion.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-gray-700">
          ← Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import AuthService from '../services/auth'

export default {
  name: 'VerifyEmail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const verificationState = ref('loading') // loading, success, error, invalid
    const errorMessage = ref('')
    const redirectCountdown = ref(5)
    const redirectPath = ref('/login')

    // Vérifier l'email au montage du composant
    onMounted(async () => {
      const token = route.query.token

      if (!token) {
        verificationState.value = 'invalid'
        return
      }

      try {
        console.log('🔄 Vérification email avec token:', token)
        const result = await AuthService.verifyEmail(token)

        if (result.success) {
          verificationState.value = 'success'
          redirectPath.value = result.redirectTo || '/dashboard'
          
          // Démarrer le compte à rebours
          const countdown = setInterval(() => {
            redirectCountdown.value--
            if (redirectCountdown.value <= 0) {
              clearInterval(countdown)
              router.push(redirectPath.value)
            }
          }, 1000)

          console.log('✅ Email vérifié avec succès, redirection vers:', redirectPath.value)
        } else {
          verificationState.value = 'error'
          errorMessage.value = result.message || 'Une erreur inattendue s\'est produite'
          console.log('❌ Échec vérification email:', result.message)
        }
      } catch (error) {
        verificationState.value = 'error'
        errorMessage.value = 'Une erreur inattendue s\'est produite lors de la vérification'
        console.error('❌ Erreur vérification email:', error)
      }
    })

    return {
      verificationState,
      errorMessage,
      redirectCountdown,
      redirectPath
    }
  }
}
</script>

<style scoped>
/* Animation pour le spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transition douce pour les états */
.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Focus visible pour l'accessibilité */
button:focus,
a:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>