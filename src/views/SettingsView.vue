<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-cog</v-icon>
            Настройки
          </v-card-title>
          <v-card-text>
            <v-form v-model="settingsFormValid" ref="settingsForm">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-4">
                    <v-card-title class="text-h6">Внешний вид</v-card-title>
                    <v-card-text>
                      <v-select
                        v-model="settings.theme"
                        label="Тема"
                        :items="themeOptions"
                        @update:model-value="updateSettings"
                      ></v-select>
                      <v-select
                        v-model="settings.language"
                        label="Язык"
                        :items="languageOptions"
                        @update:model-value="updateSettings"
                      ></v-select>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-4">
                    <v-card-title class="text-h6">Карты по умолчанию</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model.number="settings.defaultMapSize.width"
                            label="Ширина (клетки)"
                            type="number"
                            @update:model-value="updateSettings"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model.number="settings.defaultMapSize.height"
                            label="Высота (клетки)"
                            type="number"
                            @update:model-value="updateSettings"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-text-field
                        v-model.number="settings.defaultCellSize"
                        label="Размер клетки (пиксели)"
                        type="number"
                        @update:model-value="updateSettings"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4">
                    <v-card-title class="text-h6">Данные</v-card-title>
                    <v-card-text>
                      <v-switch
                        v-model="settings.autoSave"
                        label="Автосохранение"
                        @update:model-value="updateSettings"
                      ></v-switch>
                      <div class="mt-4">
                        <h4>Экспорт и импорт данных</h4>
                        <p class="text-body-2 mb-4">
                          Вы можете экспортировать все свои данные в JSON файл для резервного копирования
                          или переноса на другое устройство.
                        </p>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-btn
                              color="primary"
                              variant="outlined"
                              block
                              @click="exportData"
                            >
                              <v-icon start>mdi-download</v-icon>
                              Экспорт данных
                            </v-btn>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-file-input
                              v-model="importFile"
                              accept=".json"
                              label="Импорт данных"
                              prepend-icon="mdi-upload"
                              @change="importData"
                            ></v-file-input>
                          </v-col>
                        </v-row>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4">
                    <v-card-title class="text-h6">Статистика</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
                          <div class="text-center">
                            <v-icon :color="stat.color" size="32" class="mb-2">{{ stat.icon }}</v-icon>
                            <div class="text-h5">{{ stat.value }}</div>
                            <div class="text-body-2">{{ stat.title }}</div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4">
                    <v-card-title class="text-h6">О приложении</v-card-title>
                    <v-card-text>
                      <div class="text-center">
                        <v-icon size="64" color="primary" class="mb-4">mdi-dice-d20</v-icon>
                        <h3 class="mb-2">D&D Master</h3>
                        <p class="text-body-1 mb-4">
                          Личный кабинет мастера для управления играми в Dungeons & Dragons
                        </p>
                        <p class="text-body-2 text-grey">
                          Версия 1.0.0 • Создано с помощью Vue 3, Vuetify и TypeScript
                        </p>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const settingsFormValid = ref(true)
const importFile = ref<File[]>([])

const settings = computed(() => appStore.settings)

const themeOptions = [
  { title: 'Светлая', value: 'light' },
  { title: 'Темная', value: 'dark' }
]

const languageOptions = [
  { title: 'Русский', value: 'ru' },
  { title: 'English', value: 'en' }
]

const stats = computed(() => [
  {
    title: 'Карты',
    value: appStore.maps.length,
    icon: 'mdi-map',
    color: 'primary'
  },
  {
    title: 'Персонажи',
    value: appStore.characters.length,
    icon: 'mdi-account-group',
    color: 'success'
  },
  {
    title: 'Существа',
    value: appStore.allCreatures.length,
    icon: 'mdi-dragon',
    color: 'warning'
  },
  {
    title: 'Сессии',
    value: appStore.gameSessions.length,
    icon: 'mdi-gamepad-variant',
    color: 'info'
  }
])

const updateSettings = () => {
  appStore.updateSettings(settings.value)
}

const exportData = () => {
  appStore.exportData()
}

const importData = async () => {
  if (importFile.value.length > 0) {
    try {
      await appStore.importData(importFile.value[0])
      importFile.value = []
      // Здесь можно показать уведомление об успехе
    } catch (error) {
      console.error('Ошибка импорта:', error)
      // Здесь можно показать уведомление об ошибке
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
