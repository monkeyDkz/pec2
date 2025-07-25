<template>
  <div>
    <h2>Bienvenue {{ user?.first_name }}</h2>
    <p>Vous n'êtes pas encore lié à un marchand.</p>

    <button @click="$router.push('/user/join-merchant')">🔗 Rejoindre un marchand existant</button>
    <button @click="$router.push('/user/create-merchant')">🏢 Créer une demande de marchand</button>
    <button @click="$router.push('/user/pending-requests')">⏳ Voir mes demandes en attente</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const user = auth.user
</script>
