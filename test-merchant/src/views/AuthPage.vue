<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
        <h1 class="text-2xl font-bold mb-2">🔐 Test Merchant Portal</h1>
        <p class="text-blue-100">{{ isLogin ? 'Connexion à votre compte' : 'Créer un nouveau compte' }}</p>
      </div>

      <!-- Form -->
      <div class="p-6">
        <!-- Toggle Tabs -->
        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            @click="isLogin = true"
            :class="{ 'bg-white shadow-sm': isLogin, 'text-gray-600': !isLogin }"
            class="flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200"
          >
            Connexion
          </button>
          <button
            @click="isLogin = false"
            :class="{ 'bg-white shadow-sm': !isLogin, 'text-gray-600': isLogin }"
            class="flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200"
          >
            Inscription
          </button>
        </div>

        <!-- Status Message -->
        <div v-if="statusMessage" :class="statusClass" class="p-3 rounded-lg mb-4">
          <div class="flex items-center">
            <div class="text-sm">{{ statusMessage }}</div>
          </div>
        </div>

        <!-- Login Form -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div class="relative">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                v-model="registerForm.firstName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                v-model="registerForm.lastName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div class="relative">
              <input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="registerForm.acceptTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-700">
              J'accepte les <a href="#" class="text-blue-600 hover:text-blue-800">conditions d'utilisation</a>
            </label>
          </div>

          <button
            type="submit"
            :disabled="loading || !isPasswordValid"
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Création...' : 'Créer le compte' }}
          </button>
        </form>

        <!-- Quick Demo Access -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center mb-3">Accès rapide pour les tests :</p>
          <button
            @click="quickDemo"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            🚀 Accès démo rapide (sans authentification)
          </button>
        </div>

        <!-- Links -->
        <div class="mt-4 text-center space-y-2">
          <p class="text-sm text-gray-600">
            Besoin d'aide ? 
            <a href="#" class="text-blue-600 hover:text-blue-800">Support technique</a>
          </p>
          <p class="text-xs text-gray-500">
            Version de test - Données simulées uniquement
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/services/api'

export default {
  name: 'AuthPage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const api = useApi()

    const isLogin = ref(true)
    const loading = ref(false)
    const showPassword = ref(false)
    const statusMessage = ref('')
    const statusType = ref('')

    const loginForm = reactive({
      email: '',
      password: ''
    })

    const registerForm = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })

    const statusClass = computed(() => {
      return {
        'bg-green-100 border border-green-400 text-green-700': statusType.value === 'success',
        'bg-red-100 border border-red-400 text-red-700': statusType.value === 'error',
        'bg-blue-100 border border-blue-400 text-blue-700': statusType.value === 'info',
        'bg-yellow-100 border border-yellow-400 text-yellow-700': statusType.value === 'warning'
      }
    })

    const isPasswordValid = computed(() => {
      return registerForm.password.length >= 6 && 
             registerForm.password === registerForm.confirmPassword
    })

    const showStatus = (message, type = 'info') => {
      statusMessage.value = message
      statusType.value = type
      setTimeout(() => {
        statusMessage.value = ''
        statusType.value = ''
      }, 5000)
    }

    const handleLogin = async () => {
      loading.value = true
      try {
        // Essayer l'API réelle
        try {
          const response = await api.auth.login(loginForm)
          if (response.token) {
            authStore.setUser({
              email: loginForm.email,
              token: response.token,
              profile: response.user
            })
            showStatus('✅ Connexion réussie !', 'success')
            setTimeout(() => router.push({ name: 'CredentialsConfig' }), 1000)
            return
          }
        } catch (apiError) {
          console.warn('API non disponible, mode simulation activé')
        }

        // Mode simulation pour les tests
        if (loginForm.email && loginForm.password) {
          authStore.setUser({
            email: loginForm.email,
            token: `demo_token_${Date.now()}`,
            profile: {
              id: 'demo_user',
              email: loginForm.email,
              firstName: 'Demo',
              lastName: 'User'
            }
          })
          showStatus('✅ Connexion en mode démo réussie !', 'success')
          setTimeout(() => router.push({ name: 'CredentialsConfig' }), 1000)
        }

      } catch (error) {
        console.error('Erreur de connexion:', error)
        showStatus('❌ Erreur de connexion. Vérifiez vos identifiants.', 'error')
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      if (!isPasswordValid.value) {
        showStatus('❌ Les mots de passe ne correspondent pas', 'error')
        return
      }

      loading.value = true
      try {
        // Essayer l'API réelle
        try {
          const response = await api.auth.register({
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            email: registerForm.email,
            password: registerForm.password
          })
          
          if (response.success) {
            showStatus('✅ Compte créé ! Vérifiez votre email pour activer votre compte.', 'success')
            isLogin.value = true
            return
          }
        } catch (apiError) {
          console.warn('API non disponible, mode simulation activé')
        }

        // Mode simulation
        authStore.setUser({
          email: registerForm.email,
          token: `demo_token_${Date.now()}`,
          profile: {
            id: 'demo_user',
            email: registerForm.email,
            firstName: registerForm.firstName,
            lastName: registerForm.lastName
          }
        })
        
        showStatus('✅ Compte créé en mode démo !', 'success')
        setTimeout(() => router.push({ name: 'CredentialsConfig' }), 1000)

      } catch (error) {
        console.error('Erreur d\'inscription:', error)
        showStatus('❌ Erreur lors de la création du compte', 'error')
      } finally {
        loading.value = false
      }
    }

    const quickDemo = () => {
      authStore.setUser({
        email: 'demo@test-merchant.com',
        token: `demo_token_${Date.now()}`,
        profile: {
          id: 'demo_user',
          email: 'demo@test-merchant.com',
          firstName: 'Demo',
          lastName: 'User'
        }
      })
      
      showStatus('🚀 Mode démo activé !', 'success')
      setTimeout(() => router.push({ name: 'CredentialsConfig' }), 500)
    }

    return {
      isLogin,
      loading,
      showPassword,
      statusMessage,
      statusClass,
      loginForm,
      registerForm,
      isPasswordValid,
      handleLogin,
      handleRegister,
      quickDemo
    }
  }
}
</script>

<style scoped>
/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Form animations */
input:focus {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
