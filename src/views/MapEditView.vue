<template>
  <div class="map-edit-view">
    <v-app-bar color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ map?.name || 'Редактор карт' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="openSaveDialog">
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
      <v-btn icon @click="openSettingsDialog">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <MapEditor 
      :map-id="mapId" 
      ref="mapEditor"
      @save="onMapSave"
    />

    <!-- Диалог настроек карты -->
    <v-dialog v-model="settingsDialog" max-width="600">
      <v-card>
        <v-card-title>Настройки карты</v-card-title>
        <v-card-text>
          <v-form v-model="settingsFormValid">
            <v-text-field
              v-model="mapSettings.name"
              label="Название карты"
              :rules="[v => !!v || 'Название обязательно']"
            ></v-text-field>
            <v-textarea
              v-model="mapSettings.description"
              label="Описание"
              rows="3"
            ></v-textarea>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="mapSettings.width"
                  label="Ширина (клетки)"
                  type="number"
                  :rules="[v => v > 0 || 'Ширина должна быть больше 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="mapSettings.height"
                  label="Высота (клетки)"
                  type="number"
                  :rules="[v => v > 0 || 'Высота должна быть больше 0']"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="mapSettings.cellType"
                  label="Тип клеток"
                  :items="cellTypes"
                  item-title="name"
                  item-value="value"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="mapSettings.cellSize"
                  label="Размер клетки (пиксели)"
                  type="number"
                  :rules="[v => v > 0 || 'Размер должен быть больше 0']"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-color-picker
                  v-model="mapSettings.backgroundColor"
                  label="Цвет фона"
                ></v-color-picker>
              </v-col>
              <v-col cols="6">
                <v-color-picker
                  v-model="mapSettings.gridColor"
                  label="Цвет сетки"
                ></v-color-picker>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="settingsDialog = false">Отмена</v-btn>
          <v-btn 
            color="primary" 
            @click="applySettings"
            :disabled="!settingsFormValid"
          >
            Применить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог сохранения -->
    <v-dialog v-model="saveDialog" max-width="500">
      <v-card>
        <v-card-title>Сохранить карту</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="saveName"
            label="Название карты"
            :rules="[v => !!v || 'Название обязательно']"
          ></v-text-field>
          <v-textarea
            v-model="saveDescription"
            label="Описание"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="saveDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveMap">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import MapEditor from '@/components/MapEditor.vue'
import type { GameMap } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const mapId = computed(() => route.params.id as string)
const map = computed(() => mapId.value ? appStore.getMapById(mapId.value) : null)

const settingsDialog = ref(false)
const saveDialog = ref(false)
const settingsFormValid = ref(false)

const mapEditor = ref<InstanceType<typeof MapEditor>>()

const mapSettings = ref({
  name: '',
  description: '',
  width: 22,
  height: 28,
  cellType: 'square' as 'square' | 'hexagon',
  cellSize: 50,
  backgroundColor: '#4a5d23',
  gridColor: '#8b4513'
})

const saveName = ref('')
const saveDescription = ref('')

const cellTypes = [
  { name: 'Квадратные', value: 'square' },
  { name: 'Шестиугольные', value: 'hexagon' }
]

onMounted(() => {
  if (map.value) {
    mapSettings.value = {
      name: map.value.name,
      description: map.value.description,
      width: map.value.width,
      height: map.value.height,
      cellType: map.value.cellType,
      cellSize: map.value.cellSize,
      backgroundColor: map.value.backgroundColor,
      gridColor: map.value.gridColor
    }
  }
})

const goBack = () => {
  router.push('/maps')
}

const openSaveDialog = () => {
  if (map.value) {
    saveName.value = map.value.name
    saveDescription.value = map.value.description
  }
  saveDialog.value = true
}

const openSettingsDialog = () => {
  settingsDialog.value = true
}

const applySettings = () => {
  if (mapEditor.value) {
    // Применяем настройки к редактору
    mapEditor.value.updateMapSettings(mapSettings.value)
  }
  settingsDialog.value = false
}

const saveMap = () => {
  if (mapEditor.value) {
    mapEditor.value.saveMap(saveName.value, saveDescription.value)
  }
  saveDialog.value = false
}

const onMapSave = (savedMap: GameMap) => {
  // Карта сохранена, можно показать уведомление
  console.log('Карта сохранена:', savedMap)
}
</script>

<style scoped>
.map-edit-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.v-app-bar {
  flex-shrink: 0;
}
</style>
