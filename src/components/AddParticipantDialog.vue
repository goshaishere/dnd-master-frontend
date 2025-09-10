<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title>
        {{ type === 'player' ? 'Добавить игрока' : 'Добавить существо' }}
      </v-card-title>
      <v-card-text>
        <v-form v-model="formValid" ref="form">
          <v-select
            v-if="type === 'player'"
            v-model="selectedCharacter"
            label="Выберите персонажа"
            :items="characterOptions"
            item-title="name"
            item-value="id"
            :rules="[v => !!v || 'Выберите персонажа']"
            required
          ></v-select>
          
          <v-select
            v-if="type === 'creature'"
            v-model="selectedCreature"
            label="Выберите существо"
            :items="creatureOptions"
            item-title="name"
            item-value="id"
            :rules="[v => !!v || 'Выберите существо']"
            required
          ></v-select>
          
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="participantData.hp"
                label="Хиты"
                type="number"
                :rules="[v => v > 0 || 'Хиты должны быть больше 0']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="participantData.maxHp"
                label="Максимальные хиты"
                type="number"
                :rules="[v => v > 0 || 'Максимальные хиты должны быть больше 0']"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="participantData.ac"
                label="Класс брони"
                type="number"
                :rules="[v => v >= 0 || 'КБ не может быть отрицательным']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="participantData.speed"
                label="Скорость"
                :rules="[v => !!v || 'Скорость обязательна']"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-text-field
            v-model.number="participantData.initiative"
            label="Инициатива"
            type="number"
            :rules="[v => v >= 0 || 'Инициатива не может быть отрицательной']"
            required
          ></v-text-field>
          
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="participantData.position.x"
                label="Позиция X"
                type="number"
                :rules="[v => v >= 0 || 'Позиция не может быть отрицательной']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="participantData.position.y"
                label="Позиция Y"
                type="number"
                :rules="[v => v >= 0 || 'Позиция не может быть отрицательной']"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn
          color="primary"
          @click="addParticipant"
          :disabled="!formValid"
        >
          Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type { GameSession, SessionPlayer, SessionCreature } from '@/types'

interface Props {
  modelValue: boolean
  session: GameSession | null
  type: 'player' | 'creature'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  add: [participant: SessionPlayer | SessionCreature]
}>()

const appStore = useAppStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formValid = ref(false)
const selectedCharacter = ref('')
const selectedCreature = ref('')

const participantData = ref({
  hp: 100,
  maxHp: 100,
  ac: 10,
  speed: '30 футов',
  initiative: 10,
  position: { x: 0, y: 0 },
  conditions: []
})

// Опции для выбора
const characterOptions = computed(() => 
  appStore.characters.map(char => ({
    name: `${char.name} (${char.race} ${char.class} ${char.level} уровня)`,
    id: char.id
  }))
)

const creatureOptions = computed(() => 
  appStore.allCreatures.map(creature => ({
    name: `${creature.name} (УО ${creature.challenge})`,
    id: creature.id
  }))
)

// Отслеживание изменений выбора
watch(selectedCharacter, (newValue) => {
  if (newValue) {
    const character = appStore.getCharacterById(newValue)
    if (character) {
      participantData.value.hp = 100 // Базовые хиты
      participantData.value.maxHp = 100
      participantData.value.ac = 10
      participantData.value.speed = '30 футов'
    }
  }
})

watch(selectedCreature, (newValue) => {
  if (newValue) {
    const creature = appStore.getCreatureById(newValue)
    if (creature) {
      participantData.value.hp = creature.hp
      participantData.value.maxHp = creature.hp
      participantData.value.ac = creature.ac
      participantData.value.speed = creature.speed
    }
  }
})

const addParticipant = () => {
  if (props.type === 'player' && selectedCharacter.value) {
    const character = appStore.getCharacterById(selectedCharacter.value)
    if (character) {
      const player: SessionPlayer = {
        characterId: character.id,
        position: participantData.value.position,
        hp: participantData.value.hp,
        conditions: participantData.value.conditions,
        initiative: participantData.value.initiative,
        turnOrder: 0
      }
      emit('add', player)
    }
  } else if (props.type === 'creature' && selectedCreature.value) {
    const creature = appStore.getCreatureById(selectedCreature.value)
    if (creature) {
      const sessionCreature: SessionCreature = {
        creatureId: creature.id,
        position: participantData.value.position,
        hp: participantData.value.hp,
        conditions: participantData.value.conditions,
        initiative: participantData.value.initiative,
        turnOrder: 0
      }
      emit('add', sessionCreature)
    }
  }
  
  // Сброс формы
  selectedCharacter.value = ''
  selectedCreature.value = ''
  participantData.value = {
    hp: 100,
    maxHp: 100,
    ac: 10,
    speed: '30 футов',
    initiative: 10,
    position: { x: 0, y: 0 },
    conditions: []
  }
}
</script>
