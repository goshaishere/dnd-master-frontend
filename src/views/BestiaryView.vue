<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              <v-icon class="mr-2">mdi-dragon</v-icon>
              Бестиарий
            </span>
            <v-btn color="primary" @click="createNewCreature">
              <v-icon start>mdi-plus</v-icon>
              Добавить существо
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab" class="mb-4">
              <v-tab value="base">Базовые существа</v-tab>
              <v-tab value="custom">Кастомные существа</v-tab>
            </v-tabs>
            
            <v-window v-model="activeTab">
              <v-window-item value="base">
                <v-row v-if="baseCreatures.length === 0">
                  <v-col cols="12" class="text-center py-8">
                    <v-icon size="64" color="grey">mdi-dragon</v-icon>
                    <h3 class="mt-4">Базовые существа загружаются...</h3>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col
                    v-for="creature in baseCreatures"
                    :key="creature.id"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <CreatureCard :creature="creature" :is-custom="false" />
                  </v-col>
                </v-row>
              </v-window-item>
              
              <v-window-item value="custom">
                <v-row v-if="customCreatures.length === 0">
                  <v-col cols="12" class="text-center py-8">
                    <v-icon size="64" color="grey">mdi-dragon-outline</v-icon>
                    <h3 class="mt-4">Кастомные существа не найдены</h3>
                    <p class="text-grey">Создайте свое первое кастомное существо</p>
                    <v-btn color="primary" @click="createNewCreature" class="mt-4">
                      <v-icon start>mdi-plus</v-icon>
                      Добавить существо
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col
                    v-for="creature in customCreatures"
                    :key="creature.id"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <CreatureCard :creature="creature" :is-custom="true" />
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания/редактирования существа -->
    <v-dialog v-model="creatureDialog" max-width="1000">
      <v-card>
        <v-card-title>{{ editingCreature ? 'Редактировать существо' : 'Создать новое существо' }}</v-card-title>
        <v-card-text>
          <v-form v-model="creatureFormValid" ref="creatureForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newCreature.name"
                  label="Название существа"
                  :rules="[v => !!v || 'Название обязательно']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newCreature.type"
                  label="Тип существа"
                  :items="creatureTypes"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newCreature.size"
                  label="Размер"
                  :items="sizes"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newCreature.alignment"
                  label="Мировоззрение"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newCreature.challenge"
                  label="Уровень опасности"
                  type="number"
                  step="0.25"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="newCreature.ac"
                  label="Класс брони"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="newCreature.hp"
                  label="Хиты"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newCreature.speed"
                  label="Скорость"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <h3>Характеристики</h3>
            <v-row>
              <v-col cols="12" sm="6" md="4" v-for="(value, stat) in newCreature.stats" :key="stat">
                <v-text-field
                  v-model.number="newCreature.stats[stat]"
                  :label="getStatName(stat)"
                  type="number"
                  :rules="[v => v >= 1 && v <= 30 || 'Значение должно быть от 1 до 30']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newCreature.description"
                  label="Описание"
                  rows="4"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newCreature.senses"
                  label="Чувства"
                  rows="2"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newCreature.skills"
                  label="Навыки (через запятую)"
                  rows="2"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newCreature.languages"
                  label="Языки"
                  rows="2"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="creatureDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveCreature"
            :disabled="!creatureFormValid"
          >
            {{ editingCreature ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Creature } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import CreatureCard from '@/components/CreatureCard.vue'

const appStore = useAppStore()

const activeTab = ref('base')
const creatureDialog = ref(false)
const creatureFormValid = ref(false)
const editingCreature = ref<Creature | null>(null)

const baseCreatures = computed(() => appStore.creatures)
const customCreatures = computed(() => appStore.customCreatures)

const newCreature = ref<Partial<Creature>>({
  name: '',
  type: 'humanoid',
  size: 'medium',
  alignment: '',
  ac: 10,
  hp: 10,
  speed: '30 футов',
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  skills: '',
  senses: '',
  languages: '',
  challenge: 0.25,
  xp: 50,
  abilities: [],
  actions: [],
  description: '',
  isCustom: true
})

const creatureTypes = [
  { title: 'Зверь', value: 'beast' },
  { title: 'Гуманоид', value: 'humanoid' },
  { title: 'Дракон', value: 'dragon' },
  { title: 'Нежить', value: 'undead' },
  { title: 'Элементаль', value: 'elemental' },
  { title: 'Демон', value: 'fiend' },
  { title: 'Небожитель', value: 'celestial' },
  { title: 'Аберрация', value: 'aberration' }
]

const sizes = [
  { title: 'Крошечный', value: 'tiny' },
  { title: 'Маленький', value: 'small' },
  { title: 'Средний', value: 'medium' },
  { title: 'Большой', value: 'large' },
  { title: 'Огромный', value: 'huge' },
  { title: 'Гигантский', value: 'gargantuan' }
]

const getStatName = (stat: string) => {
  const statNames: { [key: string]: string } = {
    strength: 'Сила',
    dexterity: 'Ловкость',
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма'
  }
  return statNames[stat] || stat
}

const createNewCreature = () => {
  editingCreature.value = null
  newCreature.value = {
    name: '',
    type: 'humanoid',
    size: 'medium',
    alignment: '',
    ac: 10,
    hp: 10,
    speed: '30 футов',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: '',
    senses: '',
    languages: '',
    challenge: 0.25,
    xp: 50,
    abilities: [],
    actions: [],
    description: '',
    isCustom: true
  }
  creatureDialog.value = true
}

const saveCreature = () => {
  if (creatureFormValid.value) {
    const creature: Creature = {
      id: editingCreature.value?.id || uuidv4(),
      name: newCreature.value.name!,
      type: newCreature.value.type!,
      size: newCreature.value.size!,
      alignment: newCreature.value.alignment || '',
      ac: newCreature.value.ac!,
      hp: newCreature.value.hp!,
      speed: newCreature.value.speed!,
      stats: newCreature.value.stats!,
      skills: newCreature.value.skills ? newCreature.value.skills.split(',').map(s => s.trim()) : [],
      senses: newCreature.value.senses || '',
      languages: newCreature.value.languages || '',
      challenge: newCreature.value.challenge || 0.25,
      xp: newCreature.value.xp || 50,
      abilities: newCreature.value.abilities || [],
      actions: newCreature.value.actions || [],
      description: newCreature.value.description || '',
      isCustom: true,
      createdAt: editingCreature.value?.createdAt || new Date(),
      updatedAt: new Date()
    }
    
    if (editingCreature.value) {
      appStore.updateCustomCreature(creature.id, creature)
    } else {
      appStore.addCustomCreature(creature)
    }
    
    creatureDialog.value = false
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
</style>
