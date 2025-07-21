<template>
  <div 
    v-if="request"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="close"
  >
    <div 
      class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <BuildingStorefrontIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ request.merchantName || request.businessName }}
            </h3>
            <p class="text-sm text-gray-600">{{ request.userEmail }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <StatusBadge :status="request.status" />
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="mt-6 space-y-6 max-h-96 overflow-y-auto">
        <!-- Informations générales -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Informations générales</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date de demande
              </label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(request.createdAt) }}</p>
            </div>
            <div v-if="request.businessType">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Type d'activité
              </label>
              <p class="mt-1 text-sm text-gray-900">{{ request.businessType }}</p>
            </div>
            <div v-if="request.website">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Site web
              </label>
              <a 
                :href="request.website" 
                target="_blank"
                class="mt-1 text-sm text-blue-600 hover:text-blue-500"
              >
                {{ request.website }}
              </a>
            </div>
            <div v-if="request.phoneNumber">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Téléphone
              </label>
              <p class="mt-1 text-sm text-gray-900">{{ request.phoneNumber }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="request.description">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Description de l'activité</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ request.description }}</p>
          </div>
        </div>

        <!-- Informations utilisateur -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Demandeur</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email
              </label>
              <p class="mt-1 text-sm text-gray-900">{{ request.userEmail }}</p>
            </div>
            <div v-if="request.userName">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nom
              </label>
              <p class="mt-1 text-sm text-gray-900">{{ request.userName }}</p>
            </div>
          </div>
        </div>

        <!-- Documents et pièces jointes -->
        <div v-if="request.documents && request.documents.length > 0">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Documents joints</h4>
          <div class="space-y-2">
            <div
              v-for="doc in request.documents"
              :key="doc.id"
              class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <DocumentIcon class="w-5 h-5 text-gray-400" />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ doc.name }}</p>
                <p class="text-xs text-gray-500">{{ doc.type }} • {{ formatFileSize(doc.size) }}</p>
              </div>
              <a
                :href="doc.url"
                target="_blank"
                class="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Télécharger
              </a>
            </div>
          </div>
        </div>

        <!-- Notes admin existantes -->
        <div v-if="request.adminNotes">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Notes administrateur</h4>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800 whitespace-pre-wrap">{{ request.adminNotes }}</p>
          </div>
        </div>

        <!-- Formulaire de traitement (pour les demandes en attente) -->
        <div v-if="request.status === 'pending'">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Traitement de la demande</h4>
          <div class="space-y-4">
            <div>
              <label for="admin-notes" class="block text-sm font-medium text-gray-700">
                Notes administrateur (optionnel)
              </label>
              <textarea
                id="admin-notes"
                v-model="adminNotes"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ajouter des notes sur cette demande..."
              />
            </div>

            <div class="flex space-x-3">
              <button
                @click="handleApprove"
                :disabled="processing"
                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                <span v-if="!processing">Approuver</span>
                <span v-else>Traitement...</span>
              </button>
              <button
                @click="handleReject"
                :disabled="processing"
                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XMarkIcon class="w-4 h-4 mr-2" />
                <span v-if="!processing">Rejeter</span>
                <span v-else>Traitement...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Informations de traitement (pour les demandes traitées) -->
        <div v-else-if="request.processedAt">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Traitement</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ request.status === 'approved' ? 'Approuvée' : 'Rejetée' }}
                </p>
                <p class="text-xs text-gray-500">{{ formatDate(request.processedAt) }}</p>
              </div>
              <StatusBadge :status="request.status" />
            </div>
            <div v-if="request.adminNotes" class="mt-3">
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ request.adminNotes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 pt-4 border-t border-gray-200 flex justify-end">
        <button
          @click="close"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import {
  BuildingStorefrontIcon,
  XMarkIcon,
  CheckIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  request: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'approve', 'reject'])

const adminNotes = ref('')
const processing = ref(false)

const close = () => {
  emit('close')
}

const handleApprove = async () => {
  processing.value = true
  try {
    emit('approve', props.request.id, adminNotes.value)
  } finally {
    processing.value = false
  }
}

const handleReject = async () => {
  processing.value = true
  try {
    emit('reject', props.request.id, adminNotes.value)
  } finally {
    processing.value = false
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
