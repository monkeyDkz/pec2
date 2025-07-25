#!/bin/bash

echo "📁 Création des dossiers nécessaires..."
mkdir -p src/services src/stores src/views/user

echo "📝 Écriture : src/services/api.js"
cat > src/services/api.js <<'EOF'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...')
      localStorage.removeItem('jwt')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
EOF

echo "📝 Écriture : src/services/authService.js"
cat > src/services/authService.js <<'EOF'
import api from './api'

export default {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('jwt')
    window.location.href = '/login'
  }
}
EOF

echo "📝 Écriture : src/stores/auth.js"
cat > src/stores/auth.js <<'EOF'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('jwt') || null
  }),
  actions: {
    async login(credentials) {
      const response = await authService.login(credentials)
      this.token = response.data.token
      localStorage.setItem('jwt', this.token)
      await this.fetchProfile()
    },
    async fetchProfile() {
      const response = await authService.getProfile()
      this.user = response.data
    },
    logout() {
      authService.logout()
      this.user = null
      this.token = null
    }
  }
})
EOF

echo "📝 Écriture : src/stores/merchants.js"
cat > src/stores/merchants.js <<'EOF'
import { defineStore } from 'pinia'
import merchantService from '@/services/merchantService'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    merchants: [],
    requests: []
  }),
  actions: {
    async loadMyMerchants() {
      try {
        const res = await merchantService.getMyMerchants()
        this.merchants = res.data
      } catch (err) {
        console.error('Erreur lors du chargement des marchands :', err)
      }
    },
    async loadRequests() {
      try {
        const res = await merchantService.getUserRequests()
        this.requests = res.data
      } catch (err) {
        console.error('Erreur lors du chargement des demandes :', err)
      }
    },
    async createMerchant(payload) {
      await merchantService.createMerchantRequest(payload)
      await this.loadRequests()
    }
  }
})
EOF

echo "📝 Écriture : src/views/user/MerchantChoice.vue"
cat > src/views/user/MerchantChoice.vue <<'EOF'
<template>
  <div class="flex flex-col gap-4 p-4">
    <h2 class="text-xl font-bold">Bienvenue 👋</h2>
    <p>Souhaitez-vous créer un nouveau marchand ou rejoindre un existant ?</p>

    <div class="flex gap-4">
      <button @click="router.push('/user/create-merchant')" class="btn">Créer</button>
      <button @click="router.push('/user/join-merchant')" class="btn">Rejoindre</button>
    </div>

    <RequestStatusCard v-if="requests.length > 0" :requests="requests" />
  </div>
</template>

<script setup>
import { useMerchantStore } from '@/stores/merchants'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useMerchantStore()

onMounted(async () => {
  await store.loadRequests()
})
</script>
EOF

echo "📝 Écriture : src/views/user/CreateMerchantRequest.vue"
cat > src/views/user/CreateMerchantRequest.vue <<'EOF'
<template>
  <form @submit.prevent="submit">
    <input v-model="form.merchantName" placeholder="Nom du marchand" />
    <input v-model="form.websiteUrl" placeholder="Site web" />
    <input v-model="form.companyName" placeholder="Raison sociale" />
    <input v-model="form.businessType" placeholder="Type d'activité" />
    <input v-model="form.description" placeholder="Description" />
    <input v-model="form.companyAddress" placeholder="Adresse" />
    <input v-model="form.companyEmail" placeholder="Email société" />
    <input v-model="form.companyPhone" placeholder="Téléphone" />
    <input v-model="form.siret" placeholder="SIRET" />
    <input v-model="form.justification" placeholder="Justification" />
    <button type="submit">Envoyer</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useMerchantStore } from '@/stores/merchants'
import { useRouter } from 'vue-router'

const form = ref({
  merchantName: '',
  websiteUrl: '',
  companyName: '',
  businessType: '',
  description: '',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  siret: '',
  justification: ''
})

const store = useMerchantStore()
const router = useRouter()

const submit = async () => {
  try {
    await store.createMerchant(form.value)
    router.push('/user/pending-requests')
  } catch (e) {
    console.error('Erreur lors de la création du marchand :', e)
  }
}
</script>
EOF

echo "✅ Tous les fichiers ont été créés et configurés."
#!/bin/bash

echo "📁 Création des dossiers nécessaires..."
mkdir -p src/services src/stores src/views/user

echo "📝 Écriture : src/services/api.js"
cat > src/services/api.js <<'EOF'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...')
      localStorage.removeItem('jwt')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
EOF

echo "📝 Écriture : src/services/authService.js"
cat > src/services/authService.js <<'EOF'
import api from './api'

export default {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('jwt')
    window.location.href = '/login'
  }
}
EOF

echo "📝 Écriture : src/stores/auth.js"
cat > src/stores/auth.js <<'EOF'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('jwt') || null
  }),
  actions: {
    async login(credentials) {
      const response = await authService.login(credentials)
      this.token = response.data.token
      localStorage.setItem('jwt', this.token)
      await this.fetchProfile()
    },
    async fetchProfile() {
      const response = await authService.getProfile()
      this.user = response.data
    },
    logout() {
      authService.logout()
      this.user = null
      this.token = null
    }
  }
})
EOF

echo "📝 Écriture : src/stores/merchants.js"
cat > src/stores/merchants.js <<'EOF'
import { defineStore } from 'pinia'
import merchantService from '@/services/merchantService'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    merchants: [],
    requests: []
  }),
  actions: {
    async loadMyMerchants() {
      try {
        const res = await merchantService.getMyMerchants()
        this.merchants = res.data
      } catch (err) {
        console.error('Erreur lors du chargement des marchands :', err)
      }
    },
    async loadRequests() {
      try {
        const res = await merchantService.getUserRequests()
        this.requests = res.data
      } catch (err) {
        console.error('Erreur lors du chargement des demandes :', err)
      }
    },
    async createMerchant(payload) {
      await merchantService.createMerchantRequest(payload)
      await this.loadRequests()
    }
  }
})
EOF

echo "📝 Écriture : src/views/user/MerchantChoice.vue"
cat > src/views/user/MerchantChoice.vue <<'EOF'
<template>
  <div class="flex flex-col gap-4 p-4">
    <h2 class="text-xl font-bold">Bienvenue 👋</h2>
    <p>Souhaitez-vous créer un nouveau marchand ou rejoindre un existant ?</p>

    <div class="flex gap-4">
      <button @click="router.push('/user/create-merchant')" class="btn">Créer</button>
      <button @click="router.push('/user/join-merchant')" class="btn">Rejoindre</button>
    </div>

    <RequestStatusCard v-if="requests.length > 0" :requests="requests" />
  </div>
</template>

<script setup>
import { useMerchantStore } from '@/stores/merchants'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useMerchantStore()

onMounted(async () => {
  await store.loadRequests()
})
</script>
EOF

echo "📝 Écriture : src/views/user/CreateMerchantRequest.vue"
cat > src/views/user/CreateMerchantRequest.vue <<'EOF'
<template>
  <form @submit.prevent="submit">
    <input v-model="form.merchantName" placeholder="Nom du marchand" />
    <input v-model="form.websiteUrl" placeholder="Site web" />
    <input v-model="form.companyName" placeholder="Raison sociale" />
    <input v-model="form.businessType" placeholder="Type d'activité" />
    <input v-model="form.description" placeholder="Description" />
    <input v-model="form.companyAddress" placeholder="Adresse" />
    <input v-model="form.companyEmail" placeholder="Email société" />
    <input v-model="form.companyPhone" placeholder="Téléphone" />
    <input v-model="form.siret" placeholder="SIRET" />
    <input v-model="form.justification" placeholder="Justification" />
    <button type="submit">Envoyer</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useMerchantStore } from '@/stores/merchants'
import { useRouter } from 'vue-router'

const form = ref({
  merchantName: '',
  websiteUrl: '',
  companyName: '',
  businessType: '',
  description: '',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  siret: '',
  justification: ''
})

const store = useMerchantStore()
const router = useRouter()

const submit = async () => {
  try {
    await store.createMerchant(form.value)
    router.push('/user/pending-requests')
  } catch (e) {
    console.error('Erreur lors de la création du marchand :', e)
  }
}
</script>
EOF

echo "✅ Tous les fichiers ont été créés et configurés."
