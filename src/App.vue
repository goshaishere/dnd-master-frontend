<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AppLayout from '@/components/AppLayout.vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.loadFromLocalStorage()
  appStore.initializeBaseData()
})
</script>

<template>
  <v-app>
    <AppLayout />
  </v-app>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
