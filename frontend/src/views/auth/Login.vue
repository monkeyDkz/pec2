<template>
  <div>
    <h2>Connexion</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" placeholder="Email" type="email" required />
      <input v-model="password" placeholder="Mot de passe" type="password" required />
      <button type="submit">Se connecter</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await auth.login({ email: email.value, password: password.value })
    if (auth.user.role === 'admin') {
      router.push('/admin/dashboard')
    } else if (auth.user.role === 'merchant') {
      router.push('/merchant/dashboard')
    } else {
      router.push('/user/merchant-choice')
    }
  } catch (e) {
    alert('Erreur de connexion')
  }
}
</script>