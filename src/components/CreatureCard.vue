<template>
  <v-card class="creature-card" hover>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ creature.name }}</span>
      <v-chip
        :color="getChallengeColor(creature.challenge)"
        size="small"
      >
        УО {{ creature.challenge }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ getTypeName(creature.type) }} • {{ getSizeName(creature.size) }}
    </v-card-subtitle>
    <v-card-text>
      <div class="creature-stats">
        <div class="stat-row">
          <span class="stat-label">КБ:</span>
          <span class="stat-value">{{ creature.ac }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Хиты:</span>
          <span class="stat-value">{{ creature.hp }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Скорость:</span>
          <span class="stat-value">{{ creature.speed }}</span>
        </div>
      </div>
      <div class="mt-2">
        <strong>Характеристики:</strong>
        <div class="stats-grid">
          <div v-for="(value, stat) in creature.stats" :key="stat" class="stat-item">
            <span class="stat-name">{{ getStatAbbr(stat) }}</span>
            <span class="stat-value">{{ value }}</span>
          </div>
        </div>
      </div>
      <div v-if="creature.description" class="mt-2">
        <p class="text-body-2">{{ creature.description.substring(0, 100) }}{{ creature.description.length > 100 ? '...' : '' }}</p>
      </div>
    </v-card-text>
    <v-card-actions v-if="isCustom">
      <v-btn
        color="primary"
        variant="text"
        @click="editCreature"
      >
        Редактировать
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-delete"
        color="error"
        variant="text"
        @click="deleteCreature"
      >
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import type { Creature } from '@/types'

interface Props {
  creature: Creature
  isCustom: boolean
}

const props = defineProps<Props>()
const appStore = useAppStore()

const getTypeName = (type: string) => {
  const typeNames: { [key: string]: string } = {
    beast: 'Зверь',
    humanoid: 'Гуманоид',
    dragon: 'Дракон',
    undead: 'Нежить',
    elemental: 'Элементаль',
    fiend: 'Демон',
    celestial: 'Небожитель',
    aberration: 'Аберрация'
  }
  return typeNames[type] || type
}

const getSizeName = (size: string) => {
  const sizeNames: { [key: string]: string } = {
    tiny: 'Крошечный',
    small: 'Маленький',
    medium: 'Средний',
    large: 'Большой',
    huge: 'Огромный',
    gargantuan: 'Гигантский'
  }
  return sizeNames[size] || size
}

const getStatAbbr = (stat: string) => {
  const statAbbrs: { [key: string]: string } = {
    strength: 'СИЛ',
    dexterity: 'ЛОВ',
    constitution: 'ТЕЛ',
    intelligence: 'ИНТ',
    wisdom: 'МУД',
    charisma: 'ХАР'
  }
  return statAbbrs[stat] || stat
}

const getChallengeColor = (challenge: number) => {
  if (challenge <= 0.25) return 'green'
  if (challenge <= 1) return 'light-green'
  if (challenge <= 3) return 'yellow'
  if (challenge <= 7) return 'orange'
  if (challenge <= 12) return 'red'
  return 'purple'
}

const editCreature = () => {
  // Эмитим событие для родительского компонента
  // В реальном приложении здесь будет логика редактирования
}

const deleteCreature = () => {
  if (confirm('Вы уверены, что хотите удалить это существо?')) {
    appStore.deleteCustomCreature(props.creature.id)
  }
}
</script>

<style scoped>
.creature-card {
  transition: transform 0.2s ease-in-out;
}

.creature-card:hover {
  transform: translateY(-4px);
}

.creature-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.stat-value {
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-name {
  font-weight: 500;
}
</style>
