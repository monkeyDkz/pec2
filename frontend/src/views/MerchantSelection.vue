<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Espace Marchand</h1>
      <p class="text-gray-600 mt-2">Choisissez un marchand existant ou créez-en un nouveau</p>
    </div>

    <!-- Onglets -->
    <div class="mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'existing'"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'existing'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Marchands Existants
        </button>
        <button
          @click="activeTab = 'create'"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'create'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Créer un Marchand
        </button>
        <button
          @click="activeTab = 'requests'"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'requests'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Mes Demandes
          <span v-if="pendingRequestsCount > 0" class="ml-2 bg-orange-100 text-orange-800 py-0.5 px-2 rounded-full text-xs">
            {{ pendingRequestsCount }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="bg-white rounded-lg shadow">
      <!-- Marchands existants -->
      <div v-if="activeTab === 'existing'" class="p-6">
        <h2 class="text-xl font-semibold mb-4">Marchands Disponibles</h2>
        
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-500">Chargement des marchands...</p>
        </div>

        <div v-else-if="existingMerchants.length === 0" class="text-center py-8 text-gray-500">
          <p>Aucun marchand disponible pour rejoindre.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="merchant in existingMerchants"
            :key="merchant.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-semibold text-lg mb-2">{{ merchant.name }}</h3>
            <p class="text-gray-600 text-sm mb-3">{{ merchant.description || 'Aucune description' }}</p>
            <div class="flex justify-between items-center">
              <span :class="getStatusClass(merchant.status)">
                {{ getStatusText(merchant.status) }}
              </span>
              <BaseButton
                v-if="merchant.status === 'active'"
                size="sm"
                variant="primary"
                @click="requestToJoinMerchant(merchant)"
                :disabled="actionLoading"
              >
                Rejoindre
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Créer un marchand -->
      <div v-if="activeTab === 'create'" class="p-6">
        <h2 class="text-xl font-semibold mb-4">Créer un Nouveau Marchand</h2>
        
        <form @submit.prevent="submitMerchantRequest" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="merchantName" class="block text-sm font-medium text-gray-700 mb-2">
                Nom du marchand *
              </label>
              <input
                id="merchantName"
                v-model="form.merchantName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Mon E-commerce"
              />
            </div>

            <div>
              <label for="companyName" class="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                id="companyName"
                v-model="form.companyName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Ma Société SARL"
              />
            </div>

            <div>
              <label for="websiteUrl" class="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                id="websiteUrl"
                v-model="form.websiteUrl"
                type="url"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://mon-site.com"
              />
            </div>

            <div>
              <label for="businessType" class="block text-sm font-medium text-gray-700 mb-2">
                Type d'activité *
              </label>
              <select
                id="businessType"
                v-model="form.businessType"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                <option value="ecommerce">E-commerce</option>
                <option value="retail">Commerce de détail</option>
                <option value="service">Services</option>
                <option value="marketplace">Marketplace</option>
                <option value="subscription">Abonnements</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label for="companyEmail" class="block text-sm font-medium text-gray-700 mb-2">
                Email de l'entreprise *
              </label>
              <input
                id="companyEmail"
                v-model="form.companyEmail"
                type="email"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@mon-entreprise.com"
              />
            </div>

            <div>
              <label for="companyPhone" class="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                id="companyPhone"
                v-model="form.companyPhone"
                type="tel"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <div>
            <label for="companyAddress" class="block text-sm font-medium text-gray-700 mb-2">
              Adresse de l'entreprise *
            </label>
            <textarea
              id="companyAddress"
              v-model="form.companyAddress"
              required
              rows="2"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adresse complète de votre entreprise"
            ></textarea>
          </div>

          <div>
            <label for="siret" class="block text-sm font-medium text-gray-700 mb-2">
              SIRET
            </label>
            <input
              id="siret"
              v-model="form.siret"
              type="text"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345678901234"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description de l'activité *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              required
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez votre activité, vos produits/services..."
            ></textarea>
          </div>

          <div>
            <label for="justification" class="block text-sm font-medium text-gray-700 mb-2">
              Justification de la demande *
            </label>
            <textarea
              id="justification"
              v-model="form.justification"
              required
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Expliquez pourquoi vous souhaitez créer ce compte marchand..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <BaseButton
              type="button"
              variant="secondary"
              @click="resetForm"
            >
              Annuler
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="actionLoading"
            >
              {{ actionLoading ? 'Envoi en cours...' : 'Soumettre la demande' }}
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Mes demandes -->
      <div v-if="activeTab === 'requests'" class="p-6">
        <h2 class="text-xl font-semibold mb-4">Mes Demandes</h2>
        
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-500">Chargement des demandes...</p>
        </div>

        <div v-else-if="userRequests.length === 0" class="text-center py-8 text-gray-500">
          <p>Vous n'avez aucune demande en cours.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="request in userRequests"
            :key="request.id"
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-lg">{{ request.requested_merchant_name }}</h3>
                <p class="text-gray-600 text-sm">{{ request.requested_description || 'Aucune description' }}</p>
                <p class="text-gray-500 text-xs mt-2">
                  Demandé le {{ formatDate(request.created_at) }}
                </p>
              </div>
              <span :class="getStatusClass(request.status)">
                {{ getStatusText(request.status) }}
              </span>
            </div>
            
            <div v-if="request.admin_notes && request.status === 'rejected'" class="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p class="text-red-800 text-sm"><strong>Raison du refus:</strong></p>
              <p class="text-red-700 text-sm mt-1">{{ request.admin_notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import BaseButton from '@/components/common/BaseButton.vue'
import ApiService from '@/services/api'

export default {
  name: 'MerchantSelection',
  components: {
    BaseButton
  },
  setup() {
    const activeTab = ref('existing')
    const loading = ref(false)
    const actionLoading = ref(false)
    const existingMerchants = ref([])
    const userRequests = ref([])

    // Formulaire de création
    const form = ref({
      merchantName: '',
      companyName: '',
      websiteUrl: '',
      businessType: '',
      companyEmail: '',
      companyPhone: '',
      companyAddress: '',
      siret: '',
      description: '',
      justification: ''
    })

    const pendingRequestsCount = computed(() => {
      return userRequests.value.filter(r => r.status === 'pending').length
    })

    const loadExistingMerchants = async () => {
      loading.value = true
      try {
        const response = await ApiService.get('/merchants/available')
        existingMerchants.value = response.data?.merchants || response.merchants || []
        console.log('✅ Marchands disponibles chargés:', existingMerchants.value.length)
      } catch (error) {
        console.error('Erreur lors du chargement des marchands:', error)
        existingMerchants.value = []
      } finally {
        loading.value = false
      }
    }

    const loadUserRequests = async () => {
      loading.value = true
      try {
        const response = await ApiService.get('/merchants/my-requests')
        userRequests.value = response.data?.requests || response.requests || []
        console.log('✅ Demandes utilisateur chargées:', userRequests.value.length)
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error)
        userRequests.value = []
      } finally {
        loading.value = false
      }
    }

    const submitMerchantRequest = async () => {
      if (actionLoading.value) return

      try {
        actionLoading.value = true
        console.log('🔄 Soumission de la demande de marchand:', form.value.merchantName)

        const requestData = {
          type: 'create_merchant',
          requested_merchant_name: form.value.merchantName,
          requested_company_name: form.value.companyName,
          requested_website_url: form.value.websiteUrl,
          requested_business_type: form.value.businessType,
          requested_company_email: form.value.companyEmail,
          requested_company_phone: form.value.companyPhone,
          requested_company_address: form.value.companyAddress,
          requested_siret: form.value.siret,
          requested_description: form.value.description,
          justification: form.value.justification
        }

        const response = await ApiService.post('/merchants/request', requestData)
        console.log('✅ Demande soumise avec succès:', response)

        // Réinitialiser le formulaire et changer d'onglet
        resetForm()
        activeTab.value = 'requests'
        await loadUserRequests()

        alert('Votre demande a été soumise avec succès ! Vous recevrez un email une fois qu\'elle sera traitée.')

      } catch (error) {
        console.error('❌ Erreur lors de la soumission:', error)
        alert('Erreur lors de la soumission de la demande. Veuillez réessayer.')
      } finally {
        actionLoading.value = false
      }
    }

    const requestToJoinMerchant = async (merchant) => {
      if (actionLoading.value) return

      try {
        actionLoading.value = true
        console.log('🔄 Demande de rejoindre le marchand:', merchant.name)

        const requestData = {
          type: 'join_merchant',
          merchant_id: merchant.id,
          requested_role: 'developer',
          justification: `Demande pour rejoindre le marchand ${merchant.name}`
        }

        const response = await ApiService.post('/merchants/request', requestData)
        console.log('✅ Demande de rejoindre soumise:', response)

        activeTab.value = 'requests'
        await loadUserRequests()

        alert(`Votre demande pour rejoindre ${merchant.name} a été soumise !`)

      } catch (error) {
        console.error('❌ Erreur lors de la demande:', error)
        alert('Erreur lors de la demande. Veuillez réessayer.')
      } finally {
        actionLoading.value = false
      }
    }

    const resetForm = () => {
      form.value = {
        merchantName: '',
        companyName: '',
        websiteUrl: '',
        businessType: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        siret: '',
        description: '',
        justification: ''
      }
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'pending':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'
        case 'approved':
        case 'active':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
        case 'rejected':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
        case 'suspended':
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
        default:
          return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'pending':
          return 'En attente'
        case 'approved':
          return 'Approuvé'
        case 'active':
          return 'Actif'
        case 'rejected':
          return 'Rejeté'
        case 'suspended':
          return 'Suspendu'
        default:
          return status
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadExistingMerchants()
      loadUserRequests()
    })

    return {
      activeTab,
      loading,
      actionLoading,
      existingMerchants,
      userRequests,
      form,
      pendingRequestsCount,
      submitMerchantRequest,
      requestToJoinMerchant,
      resetForm,
      getStatusClass,
      getStatusText,
      formatDate
    }
  }
}
</script>
