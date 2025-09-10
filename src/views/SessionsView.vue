<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              <v-icon class="mr-2">mdi-gamepad-variant</v-icon>
              Игровые сессии
            </span>
            <v-btn color="primary" @click="createNewSession">
              <v-icon start>mdi-plus</v-icon>
              Новая сессия
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row v-if="gameSessions.length === 0">
              <v-col cols="12" class="text-center py-8">
                <v-icon size="64" color="grey">mdi-gamepad-variant-outline</v-icon>
                <h3 class="mt-4">Игровые сессии не найдены</h3>
                <p class="text-grey">Создайте свою первую игровую сессию</p>
                <v-btn color="primary" @click="createNewSession" class="mt-4">
                  <v-icon start>mdi-plus</v-icon>
                  Новая сессия
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col
                v-for="session in gameSessions"
                :key="session.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card class="session-card" hover>
                  <v-card-title>{{ session.name }}</v-card-title>
                  <v-card-subtitle>
                    <v-chip
                      :color="getStatusColor(session.status)"
                      size="small"
                      class="mr-2"
                    >
                      {{ getStatusName(session.status) }}
                    </v-chip>
                    Раунд {{ session.round }}
                  </v-card-subtitle>
                  <v-card-text>
                    <p class="text-body-2">{{ session.description }}</p>
                    <div class="mt-2">
                      <strong>Участники:</strong>
                      <div class="participants">
                        <div class="participant-count">
                          <v-icon size="small" class="mr-1">mdi-account-group</v-icon>
                          {{ session.players.length }} игроков
                        </div>
                        <div class="participant-count">
                          <v-icon size="small" class="mr-1">mdi-dragon</v-icon>
                          {{ session.creatures.length }} существ
                        </div>
                      </div>
                    </div>
                    <div class="mt-2">
                      <small class="text-grey">
                        Создана: {{ new Date(session.createdAt).toLocaleDateString() }}
                      </small>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="text"
                      @click="openSession(session)"
                    >
                      Открыть
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      @click="deleteSession(session.id)"
                    >
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания сессии -->
    <v-dialog v-model="sessionDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новую игровую сессию</v-card-title>
        <v-card-text>
          <v-form v-model="sessionFormValid" ref="sessionForm">
            <v-text-field
              v-model="newSession.name"
              label="Название сессии"
              :rules="[v => !!v || 'Название обязательно']"
              required
            ></v-text-field>
            <v-textarea
              v-model="newSession.description"
              label="Описание"
              rows="3"
            ></v-textarea>
            <v-select
              v-model="newSession.mapId"
              label="Карта"
              :items="mapOptions"
              :rules="[v => !!v || 'Выберите карту']"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="sessionDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="createSession"
            :disabled="!sessionFormValid"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { GameSession } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()
const appStore = useAppStore()

const gameSessions = computed(() => appStore.gameSessions)
const sessionDialog = ref(false)
const sessionFormValid = ref(false)

const newSession = ref<Partial<GameSession>>({
  name: '',
  description: '',
  mapId: '',
  players: [],
  creatures: [],
  currentTurn: 0,
  round: 1,
  status: 'preparation'
})

const mapOptions = computed(() => 
  appStore.maps.map(map => ({
    title: map.name,
    value: map.id
  }))
)

const getStatusName = (status: string) => {
  const statusNames: { [key: string]: string } = {
    preparation: 'Подготовка',
    active: 'Активна',
    paused: 'Приостановлена',
    finished: 'Завершена'
  }
  return statusNames[status] || status
}

const getStatusColor = (status: string) => {
  const statusColors: { [key: string]: string } = {
    preparation: 'orange',
    active: 'green',
    paused: 'yellow',
    finished: 'grey'
  }
  return statusColors[status] || 'primary'
}

const createNewSession = () => {
  sessionDialog.value = true
}

const createSession = () => {
  if (sessionFormValid.value) {
    const session: GameSession = {
      id: uuidv4(),
      name: newSession.value.name!,
      description: newSession.value.description || '',
      mapId: newSession.value.mapId!,
      players: [],
      creatures: [],
      currentTurn: 0,
      round: 1,
      status: 'preparation',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    appStore.addGameSession(session)
    sessionDialog.value = false
    
    // Сброс формы
    newSession.value = {
      name: '',
      description: '',
      mapId: '',
      players: [],
      creatures: [],
      currentTurn: 0,
      round: 1,
      status: 'preparation'
    }
  }
}

const openSession = (session: GameSession) => {
  router.push(`/sessions/${session.id}/play`)
}

const deleteSession = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту сессию?')) {
    appStore.deleteGameSession(id)
  }
}
</script>

<style scoped>
.session-card {
  transition: transform 0.2s ease-in-out;
}

.session-card:hover {
  transform: translateY(-4px);
}

.participants {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.participant-count {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}
</style>
