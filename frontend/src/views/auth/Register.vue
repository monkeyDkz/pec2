<template>
  <div>
    <h2>Inscription</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="first_name" placeholder="Prénom" required />
      <input v-model="last_name" placeholder="Nom" required />
      <input v-model="email" placeholder="Email" type="email" required />
      <input v-model="password" placeholder="Mot de passe" type="password" required />
      <button type="submit">S'inscrire</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const first_name = ref('')
const last_name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  try {
    await auth.register({ first_name: first_name.value, last_name: last_name.value, email: email.value, password: password.value })
    alert('Inscription réussie. Vérifiez vos emails.')
    router.push('/verify-email')
  } catch (e) {
    alert('Erreur lors de l’inscription')
  }
}
</script>