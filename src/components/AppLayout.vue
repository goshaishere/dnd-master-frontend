<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item class="logo-section" nav>
        <template v-slot:prepend>
          <div class="logo-container">
            <div class="dnd-logo">
              <div class="dice-icon">
                <v-icon size="28" color="white">mdi-dice-d20</v-icon>
              </div>
              <div class="logo-text">
                <div class="logo-title">D&D</div>
                <div class="logo-subtitle">Master</div>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :to="item.to"
          :active="currentRoute === item.value"
        ></v-list-item>
      </v-list>

    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const theme = useTheme()
const appStore = useAppStore()

const drawer = ref(true)
const rail = ref(false)

const isDark = computed(() => theme.global.current.value.dark)

const menuItems = [
  { title: 'Главная', icon: 'mdi-home', value: 'home', to: '/' },
  { title: 'Карты', icon: 'mdi-map', value: 'maps', to: '/maps' },
  { title: 'Персонажи', icon: 'mdi-account-group', value: 'characters', to: '/characters' },
  { title: 'Бестиарий', icon: 'mdi-skull', value: 'bestiary', to: '/bestiary' },
  { title: 'Игровые сессии', icon: 'mdi-gamepad-variant', value: 'sessions', to: '/sessions' },
  { title: 'Настройки', icon: 'mdi-cog', value: 'settings', to: '/settings' }
]

const currentRoute = computed(() => route.name)
const currentPageTitle = computed(() => {
  const item = menuItems.find(item => item.value === route.name)
  return item ? item.title : 'D&D Master'
})

const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = newTheme
  appStore.updateSettings({ theme: newTheme })
}

</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.logo-section {
  padding: 16px !important;
  margin-bottom: 8px;
}

.logo-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.dnd-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 50%, #0D47A1 100%);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;
  width: 100%;
}

.dnd-logo:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.dice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.logo-text {
  display: flex;
  flex-direction: column;
  color: white;
  font-weight: bold;
}

.logo-title {
  font-size: 16px;
  line-height: 1;
  font-family: 'Roboto', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.logo-subtitle {
  font-size: 12px;
  line-height: 1;
  opacity: 0.9;
  font-family: 'Roboto', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Адаптивность для rail режима */
.v-navigation-drawer--rail .logo-container {
  justify-content: center;
}

.v-navigation-drawer--rail .dnd-logo {
  width: auto;
  padding: 6px;
  gap: 0;
}

.v-navigation-drawer--rail .logo-text {
  display: none;
}

.v-navigation-drawer--rail .dice-icon {
  width: 28px;
  height: 28px;
}

.v-navigation-drawer--rail .dice-icon .v-icon {
  font-size: 20px !important;
}

/* Темная тема */
.v-theme--dark .dnd-logo {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 50%, #0D47A1 100%);
}

/* Анимация появления */
@keyframes logoGlow {
  0% { box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3); }
  50% { box-shadow: 0 4px 12px rgba(25, 118, 210, 0.5); }
  100% { box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3); }
}

.dnd-logo {
  animation: logoGlow 3s ease-in-out infinite;
}
</style>
