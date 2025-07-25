<template>
  <div>🔁 Redirection en cours...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import merchantService from '@/services/merchantService'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const user = auth.user

  if (!user) {
    return router.push('/login')
  }

  if (user.role === 'admin') {
    return router.push('/admin/dashboard')
  }

  if (user.role === 'merchant') {
    return router.push('/merchant/dashboard')
  }

  // Si user simple, on vérifie s'il est lié à un marchand
  try {
    const res = await merchantService.getUserMerchants()
    const hasMerchant = res.data.length > 0

    if (hasMerchant) {
      router.push('/merchant/dashboard')
    } else {
      router.push('/user/merchant-choice')
    }
  } catch (err) {
    console.error('❌ Erreur redirection RootDashboard:', err.message)
    router.push('/login')
  }
})
</script>
