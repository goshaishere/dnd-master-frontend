<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              <v-icon class="mr-2">mdi-account-group</v-icon>
              Персонажи
            </span>
            <v-btn color="primary" @click="createNewCharacter">
              <v-icon start>mdi-plus</v-icon>
              Создать персонажа
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row v-if="characters.length === 0">
              <v-col cols="12" class="text-center py-8">
                <v-icon size="64" color="grey">mdi-account-outline</v-icon>
                <h3 class="mt-4">Персонажи не найдены</h3>
                <p class="text-grey">Создайте своего первого персонажа</p>
                <v-btn color="primary" @click="createNewCharacter" class="mt-4">
                  <v-icon start>mdi-plus</v-icon>
                  Создать персонажа
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col
                v-for="character in characters"
                :key="character.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card class="character-card" hover>
                  <v-card-title>{{ character.name }}</v-card-title>
                  <v-card-subtitle>
                    {{ character.race }} {{ character.class }} {{ character.level }} уровня
                  </v-card-subtitle>
                  <v-card-text>
                    <v-chip size="small" class="mr-2 mb-2">
                      {{ character.gender === 'male' ? 'Мужской' : character.gender === 'female' ? 'Женский' : 'Другой' }}
                    </v-chip>
                    <v-chip size="small" class="mr-2 mb-2">
                      {{ character.alignment }}
                    </v-chip>
                    <div class="mt-2">
                      <strong>Характеристики:</strong>
                      <div class="stats-grid">
                        <div v-for="(value, stat) in character.stats" :key="stat" class="stat-item">
                          <span class="stat-name">{{ getStatName(stat) }}</span>
                          <span class="stat-value">{{ value }}</span>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="text"
                      @click="editCharacter(character)"
                    >
                      Редактировать
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      @click="deleteCharacter(character.id)"
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

    <!-- Диалог создания/редактирования персонажа -->
    <v-dialog v-model="characterDialog" max-width="800">
      <v-card>
        <v-card-title>{{ editingCharacter ? 'Редактировать персонажа' : 'Создать нового персонажа' }}</v-card-title>
        <v-card-text>
          <v-form v-model="characterFormValid" ref="characterForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newCharacter.name"
                  label="Имя персонажа"
                  :rules="[v => !!v || 'Имя обязательно']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newCharacter.level"
                  label="Уровень"
                  type="number"
                  :rules="[v => v > 0 || 'Уровень должен быть больше 0']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newCharacter.race"
                  label="Раса"
                  :items="races"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newCharacter.class"
                  label="Класс"
                  :items="classes"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newCharacter.gender"
                  label="Пол"
                  :items="genders"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newCharacter.alignment"
                  label="Мировоззрение"
                  :items="alignments"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newCharacter.background"
                  label="Предыстория"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <h3>Характеристики</h3>
            <v-row>
              <v-col cols="12" sm="6" md="4" v-for="(value, stat) in newCharacter.stats" :key="stat">
                <v-text-field
                  v-model.number="newCharacter.stats[stat]"
                  :label="getStatName(stat)"
                  type="number"
                  :rules="[v => v >= 1 && v <= 30 || 'Значение должно быть от 1 до 30']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="characterDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveCharacter"
            :disabled="!characterFormValid"
          >
            {{ editingCharacter ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Character } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const appStore = useAppStore()

const characters = computed(() => appStore.characters)
const characterDialog = ref(false)
const characterFormValid = ref(false)
const editingCharacter = ref<Character | null>(null)

const newCharacter = ref<Partial<Character>>({
  name: '',
  race: '',
  class: '',
  level: 1,
  gender: 'male',
  alignment: '',
  background: '',
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  skills: {},
  equipment: {
    armor: null,
    weapon: null,
    shield: null,
    accessories: []
  },
  inventory: [],
  spells: [],
  features: []
})

const races = [
  'Человек', 'Эльф', 'Дварф', 'Халфлинг', 'Драконорожденный', 'Гном',
  'Тифлинг', 'Полуэльф', 'Полуорк', 'Дроу'
]

const classes = [
  'Воин', 'Волшебник', 'Клерк', 'Плут', 'Рейнджер', 'Паладин',
  'Варвар', 'Бард', 'Друид', 'Монах', 'Следопыт', 'Чародей'
]

const genders = [
  { title: 'Мужской', value: 'male' },
  { title: 'Женский', value: 'female' },
  { title: 'Другой', value: 'other' }
]

const alignments = [
  'Законно-добрый', 'Нейтрально-добрый', 'Хаотично-добрый',
  'Законно-нейтральный', 'Нейтральный', 'Хаотично-нейтральный',
  'Законно-злой', 'Нейтрально-злой', 'Хаотично-злой'
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

const createNewCharacter = () => {
  editingCharacter.value = null
  newCharacter.value = {
    name: '',
    race: '',
    class: '',
    level: 1,
    gender: 'male',
    alignment: '',
    background: '',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: {},
    equipment: {
      armor: null,
      weapon: null,
      shield: null,
      accessories: []
    },
    inventory: [],
    spells: [],
    features: []
  }
  characterDialog.value = true
}

const editCharacter = (character: Character) => {
  editingCharacter.value = character
  newCharacter.value = { ...character }
  characterDialog.value = true
}

const saveCharacter = () => {
  if (characterFormValid.value) {
    const character: Character = {
      id: editingCharacter.value?.id || uuidv4(),
      name: newCharacter.value.name!,
      race: newCharacter.value.race!,
      class: newCharacter.value.class!,
      level: newCharacter.value.level!,
      gender: newCharacter.value.gender!,
      alignment: newCharacter.value.alignment!,
      background: newCharacter.value.background || '',
      stats: newCharacter.value.stats!,
      skills: newCharacter.value.skills || {},
      equipment: newCharacter.value.equipment || {
        armor: null,
        weapon: null,
        shield: null,
        accessories: []
      },
      inventory: newCharacter.value.inventory || [],
      spells: newCharacter.value.spells || [],
      features: newCharacter.value.features || [],
      createdAt: editingCharacter.value?.createdAt || new Date(),
      updatedAt: new Date()
    }
    
    if (editingCharacter.value) {
      appStore.updateCharacter(character.id, character)
    } else {
      appStore.addCharacter(character)
    }
    
    characterDialog.value = false
  }
}

const deleteCharacter = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить этого персонажа?')) {
    appStore.deleteCharacter(id)
  }
}
</script>

<style scoped>
.character-card {
  transition: transform 0.2s ease-in-out;
}

.character-card:hover {
  transform: translateY(-4px);
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

.stat-value {
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}
</style>
