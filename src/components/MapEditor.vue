<template>
  <v-container fluid class="map-editor">
    <v-row>
      <!-- Панель инструментов -->
      <v-col cols="12" md="3">
        <v-card class="toolbar-card">
          <v-card-title>
            <v-icon class="mr-2">mdi-tools</v-icon>
            Инструменты
          </v-card-title>
          <v-card-text>
            <!-- Выбор инструмента -->
            <v-select
              v-model="selectedTool"
              label="Инструмент"
              :items="tools"
              item-title="name"
              item-value="value"
            ></v-select>

            <!-- Настройки кисти -->
            <div v-if="selectedTool === 'brush'" class="mt-4">
              <h4>Кисть</h4>
              <v-select
                v-model="brushType"
                label="Тип кисти"
                :items="brushTypes"
                item-title="name"
                item-value="value"
              ></v-select>
              <v-slider
                v-model="brushSize"
                label="Размер кисти"
                min="1"
                max="5"
                step="1"
                thumb-label
              ></v-slider>
            </div>

            <!-- Настройки объектов -->
            <div v-if="selectedTool === 'object'" class="mt-4">
              <h4>Объекты</h4>
              <v-select
                v-model="selectedObjectType"
                label="Тип объекта"
                :items="objectTypes"
                item-title="name"
                item-value="value"
              ></v-select>
            </div>

            <!-- Настройки существ -->
            <div v-if="selectedTool === 'creature'" class="mt-4">
              <h4>Существа</h4>
              <v-select
                v-model="selectedCreature"
                label="Выберите существо"
                :items="creatureOptions"
                item-title="name"
                item-value="id"
                clearable
              ></v-select>
            </div>

            <!-- Настройки игроков -->
            <div v-if="selectedTool === 'player'" class="mt-4">
              <h4>Игроки</h4>
              <v-select
                v-model="selectedPlayer"
                label="Выберите персонажа"
                :items="playerOptions"
                item-title="name"
                item-value="id"
                clearable
              ></v-select>
            </div>
          </v-card-text>
        </v-card>

        <!-- Панель слоев -->
        <v-card class="mt-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-layers</v-icon>
            Слои
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="layer in map?.layers || []"
                :key="layer.id"
                :class="{ 'active-layer': activeLayer?.id === layer.id }"
                @click="setActiveLayer(layer)"
              >
                <template v-slot:prepend>
                  <v-icon>{{ getLayerIcon(layer.type) }}</v-icon>
                </template>
                <v-list-item-title>{{ layer.name }}</v-list-item-title>
                <template v-slot:append>
                  <v-switch
                    v-model="layer.visible"
                    density="compact"
                    @click.stop
                  ></v-switch>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Область редактирования -->
      <v-col cols="12" md="9">
        <v-card class="canvas-container">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ map?.name || 'Редактор карт' }}</span>
            <div>
              <v-btn
                icon="mdi-zoom-out"
                size="small"
                @click="zoomOut"
              ></v-btn>
              <span class="mx-2">{{ Math.round(zoom * 100) }}%</span>
              <v-btn
                icon="mdi-zoom-in"
                size="small"
                @click="zoomIn"
              ></v-btn>
            </div>
          </v-card-title>
          <v-card-text class="pa-0">
            <div class="canvas-wrapper" ref="canvasWrapper">
              <canvas
                ref="canvas"
                :width="canvasWidth"
                :height="canvasHeight"
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="onMouseUp"
                @click="onCanvasClick"
                class="map-canvas"
              ></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог сохранения -->
    <v-dialog v-model="saveDialog" max-width="500">
      <v-card>
        <v-card-title>Сохранить карту</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="mapName"
            label="Название карты"
            :rules="[v => !!v || 'Название обязательно']"
          ></v-text-field>
          <v-textarea
            v-model="mapDescription"
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import type { GameMap, MapLayer, MapItem, Position } from '@/types'

const appStore = useAppStore()

// Props
const props = defineProps<{
  mapId?: string
}>()

// Refs
const canvas = ref<HTMLCanvasElement>()
const canvasWrapper = ref<HTMLDivElement>()
const ctx = ref<CanvasRenderingContext2D>()

// Состояние редактора
const selectedTool = ref('brush')
const brushType = ref('terrain')
const brushSize = ref(1)
const selectedObjectType = ref('building')
const selectedCreature = ref('')
const selectedPlayer = ref('')
const activeLayer = ref<MapLayer>()
const zoom = ref(1)
const isDrawing = ref(false)
const lastMousePos = ref<Position>({ x: 0, y: 0 })

// Диалоги
const saveDialog = ref(false)
const mapName = ref('')
const mapDescription = ref('')

// Данные карты
const map = ref<GameMap>()

// Размеры canvas
const canvasWidth = computed(() => (map.value?.width || 22) * (map.value?.cellSize || 50) * zoom.value)
const canvasHeight = computed(() => (map.value?.height || 28) * (map.value?.cellSize || 50) * zoom.value)

// Инструменты
const tools = [
  { name: 'Кисть', value: 'brush' },
  { name: 'Объекты', value: 'object' },
  { name: 'Существа', value: 'creature' },
  { name: 'Игроки', value: 'player' },
  { name: 'Ластик', value: 'eraser' }
]

const brushTypes = [
  { name: 'Террейн', value: 'terrain' },
  { name: 'Вода', value: 'water' },
  { name: 'Лес', value: 'forest' },
  { name: 'Горы', value: 'mountain' }
]

const objectTypes = [
  { name: 'Здание', value: 'building' },
  { name: 'Лагерь', value: 'camp' },
  { name: 'Подземелье', value: 'dungeon' },
  { name: 'Руины', value: 'ruins' }
]

// Опции для существ и игроков
const creatureOptions = computed(() => 
  appStore.allCreatures.map(creature => ({
    name: creature.name,
    id: creature.id
  }))
)

const playerOptions = computed(() => 
  appStore.characters.map(character => ({
    name: character.name,
    id: character.id
  }))
)

// Инициализация
onMounted(async () => {
  if (props.mapId) {
    map.value = appStore.getMapById(props.mapId)
  } else {
    // Создаем новую карту
    map.value = {
      id: '',
      name: 'Новая карта',
      description: '',
      width: 22,
      height: 28,
      cellSize: 50,
      cellType: 'square',
      backgroundColor: '#4a5d23',
      gridColor: '#8b4513',
      layers: [
        {
          id: 'terrain',
          name: 'Террейн',
          type: 'terrain',
          visible: true,
          locked: false,
          items: []
        },
        {
          id: 'objects',
          name: 'Объекты',
          type: 'objects',
          visible: true,
          locked: false,
          items: []
        },
        {
          id: 'creatures',
          name: 'Существа',
          type: 'creatures',
          visible: true,
          locked: false,
          items: []
        },
        {
          id: 'players',
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
  }

  if (map.value?.layers.length) {
    activeLayer.value = map.value.layers[0]
  }

  await nextTick()
  initCanvas()
})

// Инициализация canvas
const initCanvas = () => {
  if (!canvas.value) return
  
  ctx.value = canvas.value.getContext('2d')
  if (!ctx.value) return

  drawMap()
}

// Отрисовка карты
const drawMap = () => {
  if (!ctx.value || !map.value) return

  const cellSize = map.value.cellSize * zoom.value
  
  // Очистка canvas
  ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Фон
  ctx.value.fillStyle = map.value.backgroundColor
  ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Сетка
  ctx.value.strokeStyle = map.value.gridColor
  ctx.value.lineWidth = 1
  
  if (map.value.cellType === 'square') {
    drawSquareGrid(cellSize)
  } else {
    drawHexGrid(cellSize)
  }
  
  // Отрисовка слоев
  map.value.layers.forEach(layer => {
    if (layer.visible) {
      drawLayer(layer, cellSize)
    }
  })
}

// Отрисовка квадратной сетки
const drawSquareGrid = (cellSize: number) => {
  if (!ctx.value || !map.value) return

  for (let x = 0; x <= map.value.width; x++) {
    ctx.value.beginPath()
    ctx.value.moveTo(x * cellSize, 0)
    ctx.value.lineTo(x * cellSize, map.value.height * cellSize)
    ctx.value.stroke()
  }
  
  for (let y = 0; y <= map.value.height; y++) {
    ctx.value.beginPath()
    ctx.value.moveTo(0, y * cellSize)
    ctx.value.lineTo(map.value.width * cellSize, y * cellSize)
    ctx.value.stroke()
  }
}

// Отрисовка шестиугольной сетки
const drawHexGrid = (cellSize: number) => {
  if (!ctx.value || !map.value) return

  const hexWidth = cellSize * Math.sqrt(3) / 2
  const hexHeight = cellSize
  
  for (let row = 0; row < map.value.height; row++) {
    for (let col = 0; col < map.value.width; col++) {
      const x = col * hexWidth + (row % 2) * hexWidth / 2
      const y = row * hexHeight * 0.75
      
      drawHex(x, y, cellSize / 2)
    }
  }
}

// Отрисовка одного шестиугольника
const drawHex = (x: number, y: number, radius: number) => {
  if (!ctx.value) return

  ctx.value.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const hexX = x + radius * Math.cos(angle)
    const hexY = y + radius * Math.sin(angle)
    
    if (i === 0) {
      ctx.value.moveTo(hexX, hexY)
    } else {
      ctx.value.lineTo(hexX, hexY)
    }
  }
  ctx.value.closePath()
  ctx.value.stroke()
}

// Отрисовка слоя
const drawLayer = (layer: MapLayer, cellSize: number) => {
  if (!ctx.value) return

  layer.items.forEach(item => {
    drawMapItem(item, cellSize)
  })
}

// Отрисовка элемента карты
const drawMapItem = (item: MapItem, cellSize: number) => {
  if (!ctx.value) return

  const x = item.position.x * cellSize
  const y = item.position.y * cellSize
  const width = item.size.width * cellSize
  const height = item.size.height * cellSize

  ctx.value.save()
  ctx.value.translate(x + width / 2, y + height / 2)
  ctx.value.rotate(item.rotation)

  // Цвет в зависимости от типа
  switch (item.type) {
    case 'terrain':
      ctx.value.fillStyle = getTerrainColor(item.data.terrainType)
      ctx.value.fillRect(-width / 2, -height / 2, width, height)
      break
    case 'building':
      ctx.value.fillStyle = '#8B4513'
      ctx.value.fillRect(-width / 2, -height / 2, width, height)
      ctx.value.strokeStyle = '#654321'
      ctx.value.strokeRect(-width / 2, -height / 2, width, height)
      break
    case 'creature':
      ctx.value.fillStyle = '#FF6B6B'
      ctx.value.beginPath()
      ctx.value.arc(0, 0, Math.min(width, height) / 2, 0, 2 * Math.PI)
      ctx.value.fill()
      break
    case 'player':
      ctx.value.fillStyle = '#4ECDC4'
      ctx.value.beginPath()
      ctx.value.arc(0, 0, Math.min(width, height) / 2, 0, 2 * Math.PI)
      ctx.value.fill()
      break
  }

  ctx.value.restore()
}

// Получение цвета террейна
const getTerrainColor = (terrainType: string) => {
  const colors: { [key: string]: string } = {
    grass: '#4a5d23',
    stone: '#808080',
    water: '#4682B4',
    sand: '#F4A460',
    forest: '#228B22',
    mountain: '#696969'
  }
  return colors[terrainType] || '#4a5d23'
}

// События мыши
const onMouseDown = (event: MouseEvent) => {
  isDrawing.value = true
  lastMousePos.value = getMousePos(event)
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value) return
  
  const currentPos = getMousePos(event)
  
  if (selectedTool.value === 'brush') {
    drawBrush(currentPos)
  }
  
  lastMousePos.value = currentPos
}

const onMouseUp = () => {
  isDrawing.value = false
}

const onCanvasClick = (event: MouseEvent) => {
  const pos = getMousePos(event)
  
  if (selectedTool.value === 'object') {
    addObject(pos)
  } else if (selectedTool.value === 'creature') {
    addCreature(pos)
  } else if (selectedTool.value === 'player') {
    addPlayer(pos)
  }
}

// Получение позиции мыши в координатах карты
const getMousePos = (event: MouseEvent): Position => {
  if (!canvas.value) return { x: 0, y: 0 }
  
  const rect = canvas.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / zoom.value
  const y = (event.clientY - rect.top) / zoom.value
  
  const cellSize = map.value?.cellSize || 50
  return {
    x: Math.floor(x / cellSize),
    y: Math.floor(y / cellSize)
  }
}

// Рисование кистью
const drawBrush = (pos: Position) => {
  if (!activeLayer.value || !map.value) return

  const cellSize = map.value.cellSize
  
  for (let dx = -brushSize.value; dx <= brushSize.value; dx++) {
    for (let dy = -brushSize.value; dy <= brushSize.value; dy++) {
      const x = pos.x + dx
      const y = pos.y + dy
      
      if (x >= 0 && x < map.value.width && y >= 0 && y < map.value.height) {
        // Создаем или обновляем элемент террейна
        const existingItem = activeLayer.value.items.find(
          item => item.position.x === x && item.position.y === y
        )
        
        if (existingItem) {
          existingItem.data.terrainType = brushType.value
        } else {
          const newItem: MapItem = {
            id: `${x}-${y}`,
            type: 'terrain',
            position: { x, y },
            size: { width: 1, height: 1 },
            rotation: 0,
            data: { terrainType: brushType.value }
          }
          activeLayer.value.items.push(newItem)
        }
      }
    }
  }
  
  drawMap()
}

// Добавление объекта
const addObject = (pos: Position) => {
  if (!activeLayer.value || !map.value) return

  const objectLayer = map.value.layers.find(layer => layer.type === 'objects')
  if (!objectLayer) return

  const newItem: MapItem = {
    id: `obj-${Date.now()}`,
    type: 'building',
    position: pos,
    size: { width: 2, height: 2 },
    rotation: 0,
    data: {
      buildingType: selectedObjectType.value,
      name: `Объект ${objectLayer.items.length + 1}`,
      description: ''
    }
  }
  
  objectLayer.items.push(newItem)
  drawMap()
}

// Добавление существа
const addCreature = (pos: Position) => {
  if (!selectedCreature.value || !map.value) return

  const creatureLayer = map.value.layers.find(layer => layer.type === 'creatures')
  if (!creatureLayer) return

  const creature = appStore.getCreatureById(selectedCreature.value)
  if (!creature) return

  const newItem: MapItem = {
    id: `creature-${Date.now()}`,
    type: 'creature',
    position: pos,
    size: { width: 1, height: 1 },
    rotation: 0,
    data: {
      creatureId: creature.id,
      name: creature.name,
      hp: creature.hp,
      maxHp: creature.hp,
      ac: creature.ac,
      speed: creature.speed,
      conditions: []
    }
  }
  
  creatureLayer.items.push(newItem)
  drawMap()
}

// Добавление игрока
const addPlayer = (pos: Position) => {
  if (!selectedPlayer.value || !map.value) return

  const playerLayer = map.value.layers.find(layer => layer.type === 'players')
  if (!playerLayer) return

  const character = appStore.getCharacterById(selectedPlayer.value)
  if (!character) return

  const newItem: MapItem = {
    id: `player-${Date.now()}`,
    type: 'player',
    position: pos,
    size: { width: 1, height: 1 },
    rotation: 0,
    data: {
      characterId: character.id,
      name: character.name,
      hp: 100, // Базовые хиты
      maxHp: 100,
      ac: 10,
      speed: '30 футов',
      conditions: [],
      inventory: []
    }
  }
  
  playerLayer.items.push(newItem)
  drawMap()
}

// Управление слоями
const setActiveLayer = (layer: MapLayer) => {
  activeLayer.value = layer
}

const getLayerIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    terrain: 'mdi-terrain',
    objects: 'mdi-home',
    creatures: 'mdi-dragon',
    players: 'mdi-account'
  }
  return icons[type] || 'mdi-layers'
}

// Зум
const zoomIn = () => {
  zoom.value = Math.min(zoom.value * 1.2, 3)
  drawMap()
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value / 1.2, 0.5)
  drawMap()
}

// Сохранение карты
const saveMap = () => {
  if (!map.value || !mapName.value) return

  map.value.name = mapName.value
  map.value.description = mapDescription.value
  map.value.updatedAt = new Date()

  if (props.mapId) {
    appStore.updateMap(map.value.id, map.value)
  } else {
    appStore.addMap(map.value)
  }

  saveDialog.value = false
}
</script>

<style scoped>
.map-editor {
  height: 100vh;
  overflow: hidden;
}

.toolbar-card {
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.canvas-container {
  height: calc(100vh - 120px);
}

.canvas-wrapper {
  position: relative;
  overflow: auto;
  height: 100%;
}

.map-canvas {
  border: 1px solid #ccc;
  cursor: crosshair;
}

.active-layer {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.map-canvas:hover {
  cursor: crosshair;
}
</style>
