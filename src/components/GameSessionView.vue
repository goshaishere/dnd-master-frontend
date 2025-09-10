<template>
  <div class="game-session">
    <!-- Панель управления сессией -->
    <v-app-bar color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ session?.name || 'Игровая сессия' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Статус сессии -->
      <v-chip :color="getStatusColor(session?.status)" class="mr-2">
        {{ getStatusName(session?.status) }}
      </v-chip>
      
      <!-- Раунд и ход -->
      <div class="mr-4">
        <span class="mr-2">Раунд: {{ session?.round || 1 }}</span>
        <span>Ход: {{ currentTurn + 1 }}</span>
      </div>
      
      <!-- Кнопки управления -->
      <v-btn icon @click="pauseSession">
        <v-icon>mdi-pause</v-icon>
      </v-btn>
      <v-btn icon @click="nextTurn">
        <v-icon>mdi-skip-next</v-icon>
      </v-btn>
    </v-app-bar>

    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <!-- Левая панель - участники -->
        <v-col cols="12" md="3">
          <v-card class="participants-panel" height="100vh">
            <v-card-title>
              <v-icon class="mr-2">mdi-account-group</v-icon>
              Участники
            </v-card-title>
            <v-card-text class="pa-0">
              <!-- Инициатива -->
              <v-list>
                <v-list-subheader>Порядок ходов</v-list-subheader>
                <v-list-item
                  v-for="(participant, index) in turnOrder"
                  :key="participant.id"
                  :class="{ 'active-turn': index === currentTurn }"
                  @click="selectParticipant(participant)"
                >
                  <template v-slot:prepend>
                    <v-avatar size="32" :color="getParticipantColor(participant.type)">
                      <v-icon color="white">{{ getParticipantIcon(participant.type) }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ participant.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Инициатива: {{ participant.initiative }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <div class="text-center">
                      <div class="text-caption">{{ participant.hp }}/{{ participant.maxHp }}</div>
                      <v-progress-linear
                        :model-value="(participant.hp / participant.maxHp) * 100"
                        :color="getHpColor(participant.hp, participant.maxHp)"
                        height="4"
                      ></v-progress-linear>
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <!-- Кнопки управления -->
              <v-divider></v-divider>
              <div class="pa-4">
                <v-btn
                  color="primary"
                  block
                  @click="rollInitiative"
                  class="mb-2"
                >
                  <v-icon start>mdi-dice-d20</v-icon>
                  Бросить инициативу
                </v-btn>
                <v-btn
                  color="success"
                  block
                  @click="addPlayer"
                  class="mb-2"
                >
                  <v-icon start>mdi-account-plus</v-icon>
                  Добавить игрока
                </v-btn>
                <v-btn
                  color="warning"
                  block
                  @click="addCreature"
                >
                  <v-icon start>mdi-dragon</v-icon>
                  Добавить существо
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Центральная область - карта -->
        <v-col cols="12" md="6">
          <GameMapCanvas
            :map="gameMap"
            :participants="allParticipants"
            :selected-participant="selectedParticipant"
            :current-turn="currentTurn"
            @participant-move="onParticipantMove"
            @participant-select="selectParticipant"
          />
        </v-col>

        <!-- Правая панель - детали -->
        <v-col cols="12" md="3">
          <v-card class="details-panel" height="100vh">
            <v-card-title>
              <v-icon class="mr-2">mdi-information</v-icon>
              Детали
            </v-card-title>
            <v-card-text>
              <div v-if="selectedParticipant">
                <!-- Информация о выбранном участнике -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6">
                    {{ selectedParticipant.name }}
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-2">
                      <strong>Тип:</strong> {{ getParticipantTypeName(selectedParticipant.type) }}
                    </div>
                    <div class="mb-2">
                      <strong>Хиты:</strong> {{ selectedParticipant.hp }}/{{ selectedParticipant.maxHp }}
                    </div>
                    <div class="mb-2">
                      <strong>КБ:</strong> {{ selectedParticipant.ac }}
                    </div>
                    <div class="mb-2">
                      <strong>Скорость:</strong> {{ selectedParticipant.speed }}
                    </div>
                    <div class="mb-2">
                      <strong>Инициатива:</strong> {{ selectedParticipant.initiative }}
                    </div>
                    
                    <!-- Управление хитами -->
                    <v-divider class="my-3"></v-divider>
                    <h4>Управление хитами</h4>
                    <div class="d-flex align-center mb-2">
                      <v-text-field
                        v-model.number="hpChange"
                        label="Изменение хитов"
                        type="number"
                        density="compact"
                        class="mr-2"
                      ></v-text-field>
                      <v-btn
                        color="success"
                        size="small"
                        @click="healParticipant"
                      >
                        Лечить
                      </v-btn>
                      <v-btn
                        color="error"
                        size="small"
                        @click="damageParticipant"
                      >
                        Урон
                      </v-btn>
                    </div>
                    
                    <!-- Условия -->
                    <v-divider class="my-3"></v-divider>
                    <h4>Условия</h4>
                    <v-chip
                      v-for="condition in selectedParticipant.conditions"
                      :key="condition"
                      size="small"
                      class="mr-1 mb-1"
                      closable
                      @click:close="removeCondition(condition)"
                    >
                      {{ condition }}
                    </v-chip>
                    <v-btn
                      size="small"
                      variant="outlined"
                      @click="addCondition"
                      class="mt-2"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      Добавить условие
                    </v-btn>
                  </v-card-text>
                </v-card>

                <!-- Действия -->
                <v-card variant="outlined">
                  <v-card-title class="text-h6">Действия</v-card-title>
                  <v-card-text>
                    <v-btn
                      color="primary"
                      block
                      @click="moveParticipant"
                      class="mb-2"
                    >
                      <v-icon start>mdi-arrow-all</v-icon>
                      Переместить
                    </v-btn>
                    <v-btn
                      color="warning"
                      block
                      @click="attackParticipant"
                      class="mb-2"
                    >
                      <v-icon start>mdi-sword-cross</v-icon>
                      Атака
                    </v-btn>
                    <v-btn
                      color="info"
                      block
                      @click="castSpell"
                    >
                      <v-icon start>mdi-magic-staff</v-icon>
                      Заклинание
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>
              <div v-else class="text-center text-grey">
                Выберите участника для просмотра деталей
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалоги -->
    <AddParticipantDialog
      v-model="addParticipantDialog"
      :session="session"
      :type="participantType"
      @add="onParticipantAdded"
    />

    <ConditionDialog
      v-model="conditionDialog"
      @add="onConditionAdded"
    />

    <MoveDialog
      v-model="moveDialog"
      :participant="selectedParticipant"
      :map="gameMap"
      @move="onParticipantMoved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { GameSession, SessionPlayer, SessionCreature, GameMap } from '@/types'
import GameMapCanvas from '@/components/GameMapCanvas.vue'
import AddParticipantDialog from '@/components/AddParticipantDialog.vue'
import ConditionDialog from '@/components/ConditionDialog.vue'
import MoveDialog from '@/components/MoveDialog.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const sessionId = computed(() => route.params.id as string)
const session = computed(() => appStore.getGameSessionById(sessionId.value))
const gameMap = computed(() => session.value ? appStore.getMapById(session.value.mapId) : null)

// Состояние игры
const currentTurn = ref(0)
const selectedParticipant = ref<SessionPlayer | SessionCreature | null>(null)
const hpChange = ref(0)

// Диалоги
const addParticipantDialog = ref(false)
const conditionDialog = ref(false)
const moveDialog = ref(false)
const participantType = ref<'player' | 'creature'>('player')

// Участники игры
const players = computed(() => session.value?.players || [])
const creatures = computed(() => session.value?.creatures || [])
const allParticipants = computed(() => [...players.value, ...creatures.value])

// Порядок ходов (по инициативе)
const turnOrder = computed(() => {
  return [...allParticipants.value].sort((a, b) => b.initiative - a.initiative)
})

onMounted(() => {
  if (session.value) {
    // Восстанавливаем состояние сессии
    currentTurn.value = session.value.currentTurn || 0
  }
})

// Управление сессией
const goBack = () => {
  router.push('/sessions')
}

const pauseSession = () => {
  if (session.value) {
    appStore.updateGameSession(session.value.id, { 
      status: session.value.status === 'active' ? 'paused' : 'active' 
    })
  }
}

const nextTurn = () => {
  currentTurn.value = (currentTurn.value + 1) % turnOrder.value.length
  
  if (session.value) {
    appStore.updateGameSession(session.value.id, {
      currentTurn: currentTurn.value,
      round: currentTurn.value === 0 ? (session.value.round || 1) + 1 : session.value.round || 1
    })
  }
}

// Управление участниками
const selectParticipant = (participant: SessionPlayer | SessionCreature) => {
  selectedParticipant.value = participant
}

const addPlayer = () => {
  participantType.value = 'player'
  addParticipantDialog.value = true
}

const addCreature = () => {
  participantType.value = 'creature'
  addParticipantDialog.value = true
}

const onParticipantAdded = (participant: SessionPlayer | SessionCreature) => {
  if (session.value) {
    if (participant.type === 'player') {
      const players = [...session.value.players, participant as SessionPlayer]
      appStore.updateGameSession(session.value.id, { players })
    } else {
      const creatures = [...session.value.creatures, participant as SessionCreature]
      appStore.updateGameSession(session.value.id, { creatures })
    }
  }
}

// Бросок инициативы
const rollInitiative = () => {
  allParticipants.value.forEach(participant => {
    const roll = Math.floor(Math.random() * 20) + 1
    participant.initiative = roll
  })
  
  // Обновляем сессию
  if (session.value) {
    appStore.updateGameSession(session.value.id, {
      players: players.value,
      creatures: creatures.value
    })
  }
}

// Управление хитами
const healParticipant = () => {
  if (selectedParticipant.value && hpChange.value > 0) {
    selectedParticipant.value.hp = Math.min(
      selectedParticipant.value.hp + hpChange.value,
      selectedParticipant.value.maxHp
    )
    updateParticipant()
  }
}

const damageParticipant = () => {
  if (selectedParticipant.value && hpChange.value > 0) {
    selectedParticipant.value.hp = Math.max(
      selectedParticipant.value.hp - hpChange.value,
      0
    )
    updateParticipant()
  }
}

const updateParticipant = () => {
  if (!selectedParticipant.value || !session.value) return

  if (selectedParticipant.value.type === 'player') {
    const players = session.value.players.map(p => 
      p.characterId === selectedParticipant.value?.characterId ? selectedParticipant.value as SessionPlayer : p
    )
    appStore.updateGameSession(session.value.id, { players })
  } else {
    const creatures = session.value.creatures.map(c => 
      c.creatureId === selectedParticipant.value?.creatureId ? selectedParticipant.value as SessionCreature : c
    )
    appStore.updateGameSession(session.value.id, { creatures })
  }
}

// Условия
const addCondition = () => {
  conditionDialog.value = true
}

const removeCondition = (condition: string) => {
  if (selectedParticipant.value) {
    selectedParticipant.value.conditions = selectedParticipant.value.conditions.filter(c => c !== condition)
    updateParticipant()
  }
}

const onConditionAdded = (condition: string) => {
  if (selectedParticipant.value) {
    selectedParticipant.value.conditions.push(condition)
    updateParticipant()
  }
}

// Действия
const moveParticipant = () => {
  moveDialog.value = true
}

const attackParticipant = () => {
  // Логика атаки
  console.log('Атака:', selectedParticipant.value)
}

const castSpell = () => {
  // Логика заклинаний
  console.log('Заклинание:', selectedParticipant.value)
}

const onParticipantMove = (participant: SessionPlayer | SessionCreature, newPosition: { x: number, y: number }) => {
  participant.position = newPosition
  updateParticipant()
}

const onParticipantMoved = (newPosition: { x: number, y: number }) => {
  if (selectedParticipant.value) {
    selectedParticipant.value.position = newPosition
    updateParticipant()
  }
}

// Вспомогательные функции
const getStatusName = (status?: string) => {
  const statusNames: { [key: string]: string } = {
    preparation: 'Подготовка',
    active: 'Активна',
    paused: 'Приостановлена',
    finished: 'Завершена'
  }
  return statusNames[status || 'preparation'] || 'Неизвестно'
}

const getStatusColor = (status?: string) => {
  const statusColors: { [key: string]: string } = {
    preparation: 'orange',
    active: 'green',
    paused: 'yellow',
    finished: 'grey'
  }
  return statusColors[status || 'preparation'] || 'primary'
}

const getParticipantColor = (type: string) => {
  return type === 'player' ? 'primary' : 'error'
}

const getParticipantIcon = (type: string) => {
  return type === 'player' ? 'mdi-account' : 'mdi-dragon'
}

const getParticipantTypeName = (type: string) => {
  return type === 'player' ? 'Игрок' : 'Существо'
}

const getHpColor = (hp: number, maxHp: number) => {
  const percentage = hp / maxHp
  if (percentage > 0.6) return 'success'
  if (percentage > 0.3) return 'warning'
  return 'error'
}
</script>

<style scoped>
.game-session {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.participants-panel,
.details-panel {
  overflow-y: auto;
}

.active-turn {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.v-app-bar {
  flex-shrink: 0;
}
</style>
