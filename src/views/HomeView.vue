<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 mb-4">
          <v-card-title class="text-h4 text-center mb-4">
            <v-icon size="large" class="mr-2">mdi-dice-d20</v-icon>
            Добро пожаловать в D&D Master!
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6 mb-4">
              Ваш личный кабинет для управления играми в Dungeons & Dragons
            </p>
            <p class="text-body-1">
              Здесь вы можете создавать карты, управлять персонажами, вести бестиарий и проводить игровые сессии.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="3" v-for="stat in stats" :key="stat.title">
        <v-card class="pa-4 text-center">
          <v-icon :color="stat.color" size="48" class="mb-2">{{ stat.icon }}</v-icon>
          <v-card-title class="text-h4">{{ stat.value }}</v-card-title>
          <v-card-subtitle>{{ stat.title }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Быстрые действия
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3" v-for="action in quickActions" :key="action.title">
                <v-btn
                  :color="action.color"
                  variant="outlined"
                  block
                  class="mb-2"
                  :to="action.to"
                >
                  <v-icon class="mr-2">{{ action.icon }}</v-icon>
                  {{ action.title }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-clock-outline</v-icon>
            Последние активности
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :prepend-icon="activity.icon"
                :title="activity.title"
                :subtitle="activity.subtitle"
              >
                <template v-slot:append>
                  <v-chip size="small" :color="activity.color">
                    {{ activity.time }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

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

const quickActions = [
  {
    title: 'Создать карту',
    icon: 'mdi-map-plus',
    color: 'primary',
    to: '/maps'
  },
  {
    title: 'Создать персонажа',
    icon: 'mdi-account-plus',
    color: 'success',
    to: '/characters'
  },
  {
    title: 'Добавить существо',
    icon: 'mdi-dragon',
    color: 'warning',
    to: '/bestiary'
  },
  {
    title: 'Новая сессия',
    icon: 'mdi-gamepad-variant',
    color: 'info',
    to: '/sessions'
  }
]

const recentActivities = computed(() => {
  const activities = []
  
  // Последние карты
  const recentMaps = appStore.maps
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2)
    .map(map => ({
      id: `map-${map.id}`,
      title: `Карта: ${map.name}`,
      subtitle: `Обновлена ${new Date(map.updatedAt).toLocaleDateString()}`,
      icon: 'mdi-map',
      color: 'primary',
      time: 'недавно'
    }))
  
  // Последние персонажи
  const recentCharacters = appStore.characters
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2)
    .map(char => ({
      id: `char-${char.id}`,
      title: `Персонаж: ${char.name}`,
      subtitle: `${char.race} ${char.class} ${char.level} уровня`,
      icon: 'mdi-account',
      color: 'success',
      time: 'недавно'
    }))
  
  activities.push(...recentMaps, ...recentCharacters)
  
  return activities.slice(0, 5)
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
