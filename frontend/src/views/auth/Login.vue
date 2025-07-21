<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="w-auto h-16 flex items-center">
          <svg class="w-8 h-8 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <span class="text-xl font-bold text-gray-900">PaymentPlatform</span>
        </div>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Connexion à votre compte
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Accédez à votre dashboard de paiement
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="{ 'border-red-500': errors.email }"
                placeholder="votre@email.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </p>
            </div>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                v-model="form.password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-4 w-4 text-gray-400" />
                <EyeSlashIcon v-else class="h-4 w-4 text-gray-400" />
              </button>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>
            </div>
          </div>

          <!-- Se souvenir de moi -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="form.rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <!-- Erreur générale -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Erreur de connexion
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton de connexion -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon 
                  class="h-5 w-5 text-blue-500 group-hover:text-blue-400" 
                  :class="{ 'animate-pulse': loading }"
                />
              </span>
              <span v-if="!loading">Se connecter</span>
              <span v-else class="flex items-center">
                <LoadingSpinner size="sm" class="mr-2" />
                Connexion...
              </span>
            </button>
          </div>
        </form>

        <!-- Compte de test -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Comptes de test</span>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <button
              @click="fillTestAdmin"
              type="button"
              class="w-full text-left px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              👨‍💼 Administrateur (admin@example.com)
            </button>
            <button
              @click="fillTestMerchant"
              type="button"
              class="w-full text-left px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              🏪 Marchand (merchant@example.com)
            </button>
            <button
              @click="fillTestUser"
              type="button"
              class="w-full text-left px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              👤 Utilisateur (user@example.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const { loading, error } = storeToRefs(authStore)

// État du formulaire
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)

// Validation
const validateForm = () => {
  errors.email = ''
  errors.password = ''

  let isValid = true

  if (!form.email) {
    errors.email = 'L\'adresse email est requise'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'L\'adresse email n\'est pas valide'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    isValid = false
  }

  return isValid
}

// Soumission du formulaire
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe
    })

    notificationStore.addSuccess('Connexion réussie !')

    // Redirection selon le rôle
    if (authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else if (authStore.isMerchant) {
      router.push('/merchant/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    // L'erreur est gérée par le store
  }
}

// Remplissage des comptes de test
const fillTestAdmin = () => {
  form.email = 'admin@example.com'
  form.password = 'admin123456'
}

const fillTestMerchant = () => {
  form.email = 'merchant@example.com'
  form.password = 'merchant123456'
}

const fillTestUser = () => {
  form.email = 'user@example.com'
  form.password = 'user123456'
}
</script>
