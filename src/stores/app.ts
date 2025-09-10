import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppData, GameMap, Character, Creature, GameSession, AppSettings } from '@/types'

export const useAppStore = defineStore('app', () => {
  // Основные данные
  const data = ref<AppData>({
    maps: [],
    characters: [],
    creatures: [],
    customCreatures: [],
    gameSessions: [],
    settings: {
      theme: 'dark',
      language: 'ru',
      defaultMapSize: { width: 22, height: 28 },
      defaultCellSize: 50,
      autoSave: true
    }
  })

  // Настройки
  const settings = computed(() => data.value.settings)

  // Карты
  const maps = computed(() => data.value.maps)
  const getMapById = (id: string) => maps.value.find(map => map.id === id)

  // Персонажи
  const characters = computed(() => data.value.characters)
  const getCharacterById = (id: string) => characters.value.find(char => char.id === id)

  // Существа
  const creatures = computed(() => data.value.creatures)
  const customCreatures = computed(() => data.value.customCreatures)
  const allCreatures = computed(() => [...creatures.value, ...customCreatures.value])
  const getCreatureById = (id: string) => allCreatures.value.find(creature => creature.id === id)

  // Игровые сессии
  const gameSessions = computed(() => data.value.gameSessions)
  const getGameSessionById = (id: string) => gameSessions.value.find(session => session.id === session.id)

  // Действия для карт
  const addMap = (map: GameMap) => {
    data.value.maps.push(map)
    saveToLocalStorage()
  }

  const updateMap = (id: string, updates: Partial<GameMap>) => {
    const index = data.value.maps.findIndex(map => map.id === id)
    if (index !== -1) {
      data.value.maps[index] = { ...data.value.maps[index], ...updates, updatedAt: new Date() } as GameMap
      saveToLocalStorage()
    }
  }

  const deleteMap = (id: string) => {
    data.value.maps = data.value.maps.filter(map => map.id !== id)
    saveToLocalStorage()
  }

  // Действия для персонажей
  const addCharacter = (character: Character) => {
    data.value.characters.push(character)
    saveToLocalStorage()
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const index = data.value.characters.findIndex(char => char.id === id)
    if (index !== -1) {
      data.value.characters[index] = { ...data.value.characters[index], ...updates, updatedAt: new Date() } as Character
      saveToLocalStorage()
    }
  }

  const deleteCharacter = (id: string) => {
    data.value.characters = data.value.characters.filter(char => char.id !== id)
    saveToLocalStorage()
  }

  // Действия для существ
  const addCustomCreature = (creature: Creature) => {
    data.value.customCreatures.push(creature)
    saveToLocalStorage()
  }

  const updateCustomCreature = (id: string, updates: Partial<Creature>) => {
    const index = data.value.customCreatures.findIndex(creature => creature.id === id)
    if (index !== -1) {
      data.value.customCreatures[index] = { ...data.value.customCreatures[index], ...updates, updatedAt: new Date() } as Creature
      saveToLocalStorage()
    }
  }

  const deleteCustomCreature = (id: string) => {
    data.value.customCreatures = data.value.customCreatures.filter(creature => creature.id !== id)
    saveToLocalStorage()
  }

  // Действия для игровых сессий
  const addGameSession = (session: GameSession) => {
    data.value.gameSessions.push(session)
    saveToLocalStorage()
  }

  const updateGameSession = (id: string, updates: Partial<GameSession>) => {
    const index = data.value.gameSessions.findIndex(session => session.id === id)
    if (index !== -1) {
      data.value.gameSessions[index] = { ...data.value.gameSessions[index], ...updates, updatedAt: new Date() } as GameSession
      saveToLocalStorage()
    }
  }

  const deleteGameSession = (id: string) => {
    data.value.gameSessions = data.value.gameSessions.filter(session => session.id !== id)
    saveToLocalStorage()
  }

  // Настройки
  const updateSettings = (updates: Partial<AppSettings>) => {
    data.value.settings = { ...data.value.settings, ...updates }
    saveToLocalStorage()
  }

  // Сохранение и загрузка
  const saveToLocalStorage = () => {
    if (settings.value.autoSave) {
      localStorage.setItem('dnd-master-data', JSON.stringify(data.value))
    }
  }

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('dnd-master-data')
    if (saved) {
      try {
        data.value = JSON.parse(saved)
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      }
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(data.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dnd-master-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          data.value = importedData
          saveToLocalStorage()
          resolve()
        } catch (error) {
          reject(new Error('Неверный формат файла'))
        }
      }
      reader.onerror = () => reject(new Error('Ошибка чтения файла'))
      reader.readAsText(file)
    })
  }

  // Инициализация базовых данных
  const initializeBaseData = () => {
    if (data.value.creatures.length === 0) {
      data.value.creatures = getBaseCreatures()
    }
  }

  return {
    data,
    settings,
    maps,
    characters,
    creatures,
    customCreatures,
    allCreatures,
    gameSessions,
    getMapById,
    getCharacterById,
    getCreatureById,
    getGameSessionById,
    addMap,
    updateMap,
    deleteMap,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addCustomCreature,
    updateCustomCreature,
    deleteCustomCreature,
    addGameSession,
    updateGameSession,
    deleteGameSession,
    updateSettings,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportData,
    importData,
    initializeBaseData
  }
})

// Базовые существа D&D
function getBaseCreatures(): Creature[] {
  return [
    {
      id: 'goblin',
      name: 'Гоблин',
      type: 'humanoid',
      size: 'small',
      alignment: 'нейтрально-злой',
      ac: 15,
      hp: 7,
      speed: '30 футов',
      stats: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8
      },
      skills: ['Скрытность +6'],
      senses: ['Темное зрение 60 футов'],
      languages: ['Общий', 'Гоблинский'],
      challenge: 0.25,
      xp: 50,
      abilities: [
        {
          name: 'Нимость',
          description: 'Гоблин может совершить действие Отступление или Уклонение бонусным действием.',
          type: 'feature'
        }
      ],
      actions: [
        {
          name: 'Короткий меч',
          description: 'Ближняя атака оружием: +4 к попаданию, досягаемость 5 футов, одна цель. Попадание: 5 (1d6 + 2) колющего урона.',
          type: 'action',
          attackBonus: 4,
          damage: '1d6 + 2'
        },
        {
          name: 'Короткий лук',
          description: 'Дальняя атака оружием: +4 к попаданию, дальность 80/320 футов, одна цель. Попадание: 5 (1d6 + 2) колющего урона.',
          type: 'action',
          attackBonus: 4,
          damage: '1d6 + 2'
        }
      ],
      description: 'Маленькие, хитрые гуманоиды, известные своей изобретательностью и жестокостью.',
      isCustom: false
    },
    {
      id: 'orc',
      name: 'Орк',
      type: 'humanoid',
      size: 'medium',
      alignment: 'хаотично-злой',
      ac: 13,
      hp: 15,
      speed: '30 футов',
      stats: {
        strength: 16,
        dexterity: 12,
        constitution: 16,
        intelligence: 7,
        wisdom: 11,
        charisma: 10
      },
      skills: ['Запугивание +2'],
      senses: ['Темное зрение 60 футов'],
      languages: ['Общий', 'Оркский'],
      challenge: 0.5,
      xp: 100,
      abilities: [
        {
          name: 'Агрессивность',
          description: 'В качестве бонусного действия орк может переместиться на расстояние, равное его скорости, к враждебному существу, которое он может видеть.',
          type: 'feature'
        }
      ],
      actions: [
        {
          name: 'Грейтакс',
          description: 'Ближняя атака оружием: +5 к попаданию, досягаемость 5 футов, одна цель. Попадание: 9 (1d12 + 3) рубящего урона.',
          type: 'action',
          attackBonus: 5,
          damage: '1d12 + 3'
        }
      ],
      description: 'Сильные и свирепые гуманоиды, известные своей воинственностью и жестокостью.',
      isCustom: false
    },
    {
      id: 'dragon-red-young',
      name: 'Молодой красный дракон',
      type: 'dragon',
      size: 'large',
      alignment: 'хаотично-злой',
      ac: 18,
      hp: 178,
      speed: '40 футов, полет 80 футов',
      stats: {
        strength: 23,
        dexterity: 10,
        constitution: 21,
        intelligence: 14,
        wisdom: 13,
        charisma: 17
      },
      skills: ['Восприятие +6', 'Скрытность +4'],
      senses: ['Слепое зрение 30 футов', 'темное зрение 120 футов'],
      languages: ['Общий', 'Драконий'],
      challenge: 10,
      xp: 5900,
      abilities: [
        {
          name: 'Иммунитет к огню',
          description: 'Дракон иммунен к огненному урону.',
          type: 'innate'
        },
        {
          name: 'Легендарное сопротивление',
          description: 'Если дракон проваливает спасбросок, он может вместо этого выбрать успех.',
          type: 'feature'
        }
      ],
      actions: [
        {
          name: 'Укус',
          description: 'Ближняя атака оружием: +11 к попаданию, досягаемость 10 футов, одна цель. Попадание: 17 (2d10 + 6) колющего урона плюс 3 (1d6) огненного урона.',
          type: 'action',
          attackBonus: 11,
          damage: '2d10 + 6 + 1d6 огня'
        },
        {
          name: 'Дыхание огня',
          description: 'Дракон выдыхает огонь в 30-футовом конусе. Каждое существо в этой области должно совершить спасбросок Ловкости со Сл 18, получая 56 (16d6) огненного урона при провале или половину этого урона при успехе.',
          type: 'action'
        }
      ],
      legendaryActions: [
        {
          name: 'Обнаружение',
          description: 'Дракон совершает проверку Мудрости (Восприятие).',
          cost: 1
        },
        {
          name: 'Атака хвостом',
          description: 'Дракон совершает атаку хвостом.',
          cost: 2
        },
        {
          name: 'Атака крылом',
          description: 'Дракон бьет крылом.',
          cost: 2
        }
      ],
      description: 'Могущественный дракон, известный своей жадностью и жестокостью.',
      isCustom: false
    }
  ]
}
