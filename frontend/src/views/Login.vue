<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <router-link to="/" class="inline-block">
          <h2 class="text-3xl font-bold text-indigo-600 mb-2">Payment Platform</h2>
        </router-link>
        <h3 class="text-xl font-semibold text-gray-900">Connexion à votre compte</h3>
        <p class="mt-2 text-sm text-gray-600">
          Ou 
          <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            créez un nouveau compte
          </router-link>
        </p>
      </div>

      <!-- Formulaire de connexion -->
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
              placeholder="Votre adresse email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  v-if="showPassword"
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Options -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
          </div>

          <!-- Message d'erreur général -->
          <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="ml-2 text-sm text-red-600">{{ loginError }}</p>
            </div>
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-indigo-200" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </div>
      </form>

      <!-- Vérification email -->
      <div v-if="showEmailVerification" class="bg-amber-50 rounded-lg shadow-sm p-4 border border-amber-200">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p class="ml-2 text-sm text-amber-700">
            Votre email n'est pas encore vérifié.
          </p>
        </div>
        <div class="mt-2 flex gap-2">
          <button
            @click="resendVerificationEmail"
            :disabled="resendCooldown > 0"
            class="text-amber-600 hover:text-amber-500 text-sm font-medium disabled:opacity-50"
          >
            {{ resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer l\'email' }}
          </button>
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AuthService from '../services/auth'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()

    // États du formulaire
    const form = ref({
      email: '',
      password: '',
      rememberMe: false
    })

    const showPassword = ref(false)
    const loginError = ref('')
    const errors = ref({})
    const showEmailVerification = ref(false)
    const resendCooldown = ref(0)

    // États calculés
    const isLoading = computed(() => store.getters.isLoading)

    // Validation du formulaire
    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.email) {
        errors.value.email = 'L\'adresse email est requise'
      } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = 'L\'adresse email n\'est pas valide'
      }

      if (!form.value.password) {
        errors.value.password = 'Le mot de passe est requis'
      } else if (form.value.password.length < 6) {
        errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères'
      }

      return Object.keys(errors.value).length === 0
    }

    // Gestion de la connexion
    const handleLogin = async () => {
      loginError.value = ''
      
      if (!validateForm()) {
        return
      }

      try {
        console.log('🔄 Login - Appel AuthService...')
        const result = await AuthService.login(form.value.email, form.value.password)
        console.log('📋 Login - Résultat AuthService:', result)
        
        if (result.success) {
          console.log('✅ Login - Connexion réussie, redirection vers:', result.redirectTo)
          
          // Attendre un court instant pour que le store soit mis à jour
          setTimeout(() => {
            console.log('🚀 Redirection vers:', result.redirectTo)
            router.push(result.redirectTo)
          }, 50)
          
        } else {
          console.log('❌ Login - Échec:', result.message)
          loginError.value = result.message
          
          // Vérifier si c'est un problème de vérification d'email
          if (result.message.includes('vérifier') || result.message.includes('email')) {
            showEmailVerification.value = true
          }
        }
      } catch (error) {
        loginError.value = 'Une erreur inattendue s\'est produite'
        console.error('Erreur de connexion:', error)
      }
    }

    // Renvoyer l'email de vérification
    const resendVerificationEmail = async () => {
      if (resendCooldown.value > 0) return

      try {
        const result = await AuthService.resendVerification(form.value.email)
        
        if (result.success) {
          // Démarrer le cooldown de 60 secondes
          resendCooldown.value = 60
          const interval = setInterval(() => {
            resendCooldown.value--
            if (resendCooldown.value <= 0) {
              clearInterval(interval)
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Erreur renvoi email:', error)
      }
    }

    // Gérer la query param pour la vérification d'email
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search)
      const emailVerified = urlParams.get('verified')
      
      if (emailVerified === 'true') {
        store.dispatch('showSuccess', 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.')
      }
    })

    return {
      form,
      showPassword,
      loginError,
      errors,
      showEmailVerification,
      resendCooldown,
      isLoading,
      handleLogin,
      resendVerificationEmail
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
input:focus,
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Styles pour les messages d'erreur */
.error-enter-active,
.error-leave-active {
  transition: opacity 0.3s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
}
</style>