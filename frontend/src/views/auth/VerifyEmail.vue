<template>
  <div>
    <h2>Vérification Email</h2>
    <form @submit.prevent="handleVerify">
      <input v-model="token" placeholder="Token de vérification" required />
      <button type="submit">Vérifier</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const token = ref('')
const router = useRouter()
const auth = useAuthStore()

const handleVerify = async () => {
  try {
    await auth.verifyEmail({ token: token.value })
    await auth.fetchProfile()
    if (auth.user.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/merchant-choice')
    }
  } catch (e) {
    alert('Erreur de vérification')
  }
}
</script>