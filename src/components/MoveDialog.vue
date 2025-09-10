<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>Переместить {{ participant?.name }}</v-card-title>
      <v-card-text>
        <v-form v-model="formValid" ref="form">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="newPosition.x"
                label="Новая позиция X"
                type="number"
                :rules="[v => v >= 0 && v < (map?.width || 22) || 'Позиция вне карты']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newPosition.y"
                label="Новая позиция Y"
                type="number"
                :rules="[v => v >= 0 && v < (map?.height || 28) || 'Позиция вне карты']"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          
          <div class="mt-4">
            <h4>Текущая позиция: {{ participant?.position.x }}, {{ participant?.position.y }}</h4>
            <h4>Новая позиция: {{ newPosition.x }}, {{ newPosition.y }}</h4>
            
            <div class="mt-2">
              <strong>Расстояние:</strong> {{ distance }} клеток
            </div>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn
          color="primary"
          @click="moveParticipant"
          :disabled="!formValid"
        >
          Переместить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GameMap, SessionPlayer, SessionCreature } from '@/types'

interface Props {
  modelValue: boolean
  participant: SessionPlayer | SessionCreature | null
  map: GameMap | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  move: [position: { x: number, y: number }]
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formValid = ref(false)
const newPosition = ref({ x: 0, y: 0 })

// Отслеживание изменений участника
watch(() => props.participant, (participant) => {
  if (participant) {
    newPosition.value = { ...participant.position }
  }
}, { immediate: true })

// Вычисление расстояния
const distance = computed(() => {
  if (!props.participant) return 0
  
  const dx = Math.abs(newPosition.value.x - props.participant.position.x)
  const dy = Math.abs(newPosition.value.y - props.participant.position.y)
  
  return Math.max(dx, dy) // Расстояние в клетках (Chebyshev distance)
})

const moveParticipant = () => {
  emit('move', { ...newPosition.value })
}
</script>
