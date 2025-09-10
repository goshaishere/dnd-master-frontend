<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              <v-icon class="mr-2">mdi-map</v-icon>
              Карты
            </span>
            <v-btn color="primary" @click="createNewMap">
              <v-icon start>mdi-plus</v-icon>
              Создать карту
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row v-if="maps.length === 0">
              <v-col cols="12" class="text-center py-8">
                <v-icon size="64" color="grey">mdi-map-outline</v-icon>
                <h3 class="mt-4">Карты не найдены</h3>
                <p class="text-grey">Создайте свою первую карту для начала игры</p>
                <v-btn color="primary" @click="createNewMap" class="mt-4">
                  <v-icon start>mdi-plus</v-icon>
                  Создать карту
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col
                v-for="map in maps"
                :key="map.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="map-card"
                  @click="openMap(map)"
                  hover
                >
                  <v-img
                    height="200"
                    :src="getMapPreview(map)"
                    cover
                  >
                    <v-overlay
                      :model-value="false"
                      contained
                      scrim="rgba(0, 0, 0, 0.3)"
                    >
                      <div class="text-center">
                        <v-icon size="48" color="white">mdi-map</v-icon>
                        <h3 class="text-white mt-2">{{ map.name }}</h3>
                      </div>
                    </v-overlay>
                  </v-img>
                  <v-card-title>{{ map.name }}</v-card-title>
                  <v-card-subtitle>
                    {{ map.width }}×{{ map.height }} клеток
                  </v-card-subtitle>
                  <v-card-text>
                    <p class="text-body-2">{{ map.description }}</p>
                    <v-chip size="small" :color="map.cellType === 'square' ? 'primary' : 'secondary'">
                      {{ map.cellType === 'square' ? 'Квадратные' : 'Шестиугольные' }}
                    </v-chip>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="text"
                      @click.stop="openMap(map)"
                    >
                      Открыть
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      @click.stop="deleteMap(map.id)"
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

    <!-- Диалог создания карты -->
    <v-dialog v-model="createMapDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новую карту</v-card-title>
        <v-card-text>
          <v-form v-model="mapFormValid" ref="mapForm">
            <v-text-field
              v-model="newMap.name"
              label="Название карты"
              :rules="[v => !!v || 'Название обязательно']"
              required
            ></v-text-field>
            <v-textarea
              v-model="newMap.description"
              label="Описание"
              rows="3"
            ></v-textarea>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newMap.width"
                  label="Ширина (клетки)"
                  type="number"
                  :rules="[v => v > 0 || 'Ширина должна быть больше 0']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newMap.height"
                  label="Высота (клетки)"
                  type="number"
                  :rules="[v => v > 0 || 'Высота должна быть больше 0']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-select
              v-model="newMap.cellType"
              label="Тип клеток"
              :items="cellTypes"
              required
            ></v-select>
            <v-text-field
              v-model.number="newMap.cellSize"
              label="Размер клетки (пиксели)"
              type="number"
              :rules="[v => v > 0 || 'Размер должен быть больше 0']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createMapDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="createMap"
            :disabled="!mapFormValid"
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
import type { GameMap } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()
const appStore = useAppStore()

const maps = computed(() => appStore.maps)
const createMapDialog = ref(false)
const mapFormValid = ref(false)

const newMap = ref<Partial<GameMap>>({
  name: '',
  description: '',
  width: 22,
  height: 28,
  cellType: 'square',
  cellSize: 50,
  backgroundColor: '#4a5d23',
  gridColor: '#8b4513'
})

const cellTypes = [
  { title: 'Квадратные', value: 'square' },
  { title: 'Шестиугольные', value: 'hexagon' }
]

const createNewMap = () => {
  router.push('/maps/new')
}

const createMap = () => {
  if (mapFormValid.value) {
    const map: GameMap = {
      id: uuidv4(),
      name: newMap.value.name!,
      description: newMap.value.description || '',
      width: newMap.value.width!,
      height: newMap.value.height!,
      cellSize: newMap.value.cellSize!,
      cellType: newMap.value.cellType!,
      backgroundColor: newMap.value.backgroundColor!,
      gridColor: newMap.value.gridColor!,
      layers: [
        {
          id: uuidv4(),
          name: 'Террейн',
          type: 'terrain',
          visible: true,
          locked: false,
          items: []
        },
        {
          id: uuidv4(),
          name: 'Объекты',
          type: 'objects',
          visible: true,
          locked: false,
          items: []
        },
        {
          id: uuidv4(),
          name: 'Существа',
          type: 'creatures',
          visible: true,
          locked: false,
          items: []
        },
        {
          id: uuidv4(),
          name: 'Игроки',
          type: 'players',
          visible: true,
          locked: false,
          items: []
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    appStore.addMap(map)
    createMapDialog.value = false
    
    // Сброс формы
    newMap.value = {
      name: '',
      description: '',
      width: 22,
      height: 28,
      cellType: 'square',
      cellSize: 50,
      backgroundColor: '#4a5d23',
      gridColor: '#8b4513'
    }
  }
}

const openMap = (map: GameMap) => {
  router.push(`/maps/${map.id}`)
}

const deleteMap = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту карту?')) {
    appStore.deleteMap(id)
  }
}

const getMapPreview = (map: GameMap) => {
  // Здесь можно создать превью карты
  // Пока возвращаем заглушку
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="${map.backgroundColor}"/>
      <text x="150" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="16">
        ${map.name}
      </text>
    </svg>
  `)}`
}
</script>

<style scoped>
.map-card {
  transition: transform 0.2s ease-in-out;
}

.map-card:hover {
  transform: translateY(-4px);
}
</style>
