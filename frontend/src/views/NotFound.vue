<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-gray-400" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Page non trouvée
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Que souhaitez-vous faire ?
            </h3>
            
            <div class="space-y-3">
              <router-link
                to="/dashboard"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour au Dashboard
              </router-link>
              
              <button
                @click="goBack"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Page précédente
              </button>
            </div>
          </div>

          <div class="text-center">
            <p class="text-xs text-gray-500">
              Code d'erreur: 404
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>
