<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <router-link to="/" class="inline-block">
          <h2 class="text-3xl font-bold text-indigo-600 mb-2">Payment Platform</h2>
        </router-link>
        <h3 class="text-xl font-semibold text-gray-900">Créer votre compte</h3>
        <p class="mt-2 text-sm text-gray-600">
          Ou 
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            connectez-vous à votre compte existant
          </router-link>
        </p>
      </div>

      <!-- Formulaire d'inscription -->
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          
          <!-- Prénom -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              autocomplete="given-name"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
              placeholder="Votre prénom"
            />
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
          </div>

          <!-- Nom -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              autocomplete="family-name"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
              placeholder="Votre nom"
            />
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
          </div>

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
                autocomplete="new-password"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                placeholder="Créer un mot de passe"
                @input="checkPasswordStrength"
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
            
            <!-- Indicateur de force du mot de passe -->
            <div v-if="form.password" class="mt-2">
              <div class="flex items-center gap-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  :class="[
                    'h-1 flex-1 rounded',
                    i <= passwordStrength.score 
                      ? passwordStrength.score === 1 ? 'bg-red-400'
                        : passwordStrength.score === 2 ? 'bg-yellow-400'
                        : passwordStrength.score === 3 ? 'bg-blue-400'
                        : 'bg-green-400'
                      : 'bg-gray-200'
                  ]"
                ></div>
              </div>
              <p class="text-xs mt-1" :class="passwordStrength.color">
                {{ passwordStrength.text }}
              </p>
            </div>
            
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
              placeholder="Confirmer votre mot de passe"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Conditions d'utilisation -->
          <div class="flex items-start">
            <input
              id="acceptTerms"
              v-model="form.acceptTerms"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
            />
            <label for="acceptTerms" class="ml-2 block text-sm text-gray-700">
              J'accepte les 
              <a href="#" class="text-indigo-600 hover:text-indigo-500 font-medium">
                conditions d'utilisation
              </a>
              et la 
              <a href="#" class="text-indigo-600 hover:text-indigo-500 font-medium">
                politique de confidentialité
              </a>
            </label>
          </div>
          <p v-if="errors.acceptTerms" class="text-sm text-red-600">{{ errors.acceptTerms }}</p>

          <!-- Message d'erreur général -->
          <div v-if="registerError" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="ml-2 text-sm text-red-600">{{ registerError }}</p>
            </div>
          </div>

          <!-- Message de succès -->
          <div v-if="registerSuccess" class="bg-green-50 border border-green-200 rounded-md p-3">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="ml-2">
                <p class="text-sm text-green-600 font-medium">Inscription réussie !</p>
                <p class="text-sm text-green-600">Vérifiez votre email pour activer votre compte.</p>
              </div>
            </div>
          </div>

          <!-- Bouton d'inscription -->
          <button
            type="submit"
            :disabled="isLoading || registerSuccess"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-indigo-200" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Inscription en cours...' : registerSuccess ? 'Inscription réussie' : 'Créer mon compte' }}
          </button>
        </div>
      </form>

      <!-- Message de succès d'inscription -->
      <div v-if="registerSuccess" class="bg-green-50 border border-green-200 rounded-lg shadow-sm p-6">
        <div class="flex items-center mb-4">
          <svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="ml-2 text-lg font-medium text-green-800">Inscription réussie !</h3>
        </div>
        <p class="text-green-700 mb-4">
          Votre compte a été créé avec succès. Un email de vérification a été envoyé à <strong>{{ form.email }}</strong>.
        </p>
        <p class="text-sm text-green-600 mb-4">
          Veuillez vérifier votre boîte mail et cliquer sur le lien de vérification pour activer votre compte.
        </p>
        <div class="flex gap-2">
          <button
            @click="resendVerificationEmail"
            :disabled="resendCooldown > 0"
            class="text-green-600 hover:text-green-500 text-sm font-medium disabled:opacity-50"
          >
            {{ resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer l\'email de vérification' }}
          </button>
          <span class="text-green-600">•</span>
          <router-link 
            to="/login" 
            class="text-green-600 hover:text-green-500 text-sm font-medium"
          >
            Aller à la connexion
          </router-link>
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
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AuthService from '../services/auth'

export default {
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()

    // États du formulaire
    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })

    const showPassword = ref(false)
    const registerError = ref('')
    const registerSuccess = ref(false)
    const errors = ref({})
    const resendCooldown = ref(0)
    const passwordStrength = ref({
      score: 0,
      text: '',
      color: ''
    })

    // États calculés
    const isLoading = computed(() => store.getters.isLoading)

    // Vérification de la force du mot de passe
    const checkPasswordStrength = () => {
      const password = form.value.password
      let score = 0
      let text = ''
      let color = ''

      if (password.length >= 8) score++
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++

      switch (score) {
        case 0:
        case 1:
          text = 'Très faible'
          color = 'text-red-600'
          break
        case 2:
          text = 'Faible'
          color = 'text-yellow-600'
          break
        case 3:
          text = 'Moyen'
          color = 'text-blue-600'
          break
        case 4:
        case 5:
          text = 'Fort'
          color = 'text-green-600'
          break
      }

      passwordStrength.value = { score: Math.min(score, 4), text, color }
    }

    // Validation du formulaire
    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.firstName.trim()) {
        errors.value.firstName = 'Le prénom est requis'
      }

      if (!form.value.lastName.trim()) {
        errors.value.lastName = 'Le nom est requis'
      }

      if (!form.value.email) {
        errors.value.email = 'L\'adresse email est requise'
      } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = 'L\'adresse email n\'est pas valide'
      }

      if (!form.value.password) {
        errors.value.password = 'Le mot de passe est requis'
      } else if (form.value.password.length < 8) {
        errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
      }

      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = 'La confirmation du mot de passe est requise'
      } else if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
      }

      if (!form.value.acceptTerms) {
        errors.value.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
      }

      return Object.keys(errors.value).length === 0
    }

    // Gestion de l'inscription
    const handleRegister = async () => {
      registerError.value = ''
      registerSuccess.value = false
      
      if (!validateForm()) {
        return
      }

      try {
        const userData = {
          firstName: form.value.firstName.trim(),
          lastName: form.value.lastName.trim(),
          email: form.value.email.trim(),
          password: form.value.password
        }

        const result = await AuthService.register(userData)
        
        if (result.success) {
          registerSuccess.value = true
          console.log('✅ Inscription réussie, email de vérification envoyé')
        } else {
          registerError.value = result.message
          
          // Afficher les erreurs de validation spécifiques
          if (result.errors) {
            Object.assign(errors.value, result.errors)
          }
        }
      } catch (error) {
        registerError.value = 'Une erreur inattendue s\'est produite'
        console.error('Erreur d\'inscription:', error)
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

    return {
      form,
      showPassword,
      registerError,
      registerSuccess,
      errors,
      resendCooldown,
      passwordStrength,
      isLoading,
      handleRegister,
      resendVerificationEmail,
      checkPasswordStrength
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

/* Animation pour les messages */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Styles pour l'indicateur de force du mot de passe */
.password-strength-bar {
  transition: all 0.3s ease;
}
</style>