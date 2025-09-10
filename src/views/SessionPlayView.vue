<template>
  <GameSessionView :session-id="sessionId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GameSessionView from '@/components/GameSessionView.vue'

const route = useRoute()
const sessionId = computed(() => route.params.id as string)
</script>
