<template>
  <div class="game-map-canvas">
    <v-card class="map-container" height="100vh">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ map?.name || 'Игровая карта' }}</span>
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
            class="game-canvas"
          ></canvas>
          
          <!-- Индикатор текущего хода -->
          <div
            v-if="currentTurnParticipant"
            class="turn-indicator"
            :style="getTurnIndicatorStyle(currentTurnParticipant)"
          >
            <v-icon color="white">mdi-crown</v-icon>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import type { GameMap, SessionPlayer, SessionCreature } from '@/types'

interface Props {
  map: GameMap | null
  participants: (SessionPlayer | SessionCreature)[]
  selectedParticipant: SessionPlayer | SessionCreature | null
  currentTurn: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  participantMove: [participant: SessionPlayer | SessionCreature, position: { x: number, y: number }]
  participantSelect: [participant: SessionPlayer | SessionCreature]
}>()

// Refs
const canvas = ref<HTMLCanvasElement>()
const canvasWrapper = ref<HTMLDivElement>()
const ctx = ref<CanvasRenderingContext2D>()

// Состояние
const zoom = ref(1)
const isDragging = ref(false)
const dragStart = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const selectedParticipant = ref<SessionPlayer | SessionCreature | null>(null)

// Размеры canvas
const canvasWidth = computed(() => (props.map?.width || 22) * (props.map?.cellSize || 50) * zoom.value)
const canvasHeight = computed(() => (props.map?.height || 28) * (props.map?.cellSize || 50) * zoom.value)

// Текущий участник хода
const currentTurnParticipant = computed(() => {
  const sortedParticipants = [...props.participants].sort((a, b) => b.initiative - a.initiative)
  return sortedParticipants[props.currentTurn] || null
})

// Инициализация
onMounted(async () => {
  await nextTick()
  initCanvas()
})

// Отслеживание изменений карты
watch(() => props.map, () => {
  drawMap()
}, { deep: true })

watch(() => props.participants, () => {
  drawMap()
}, { deep: true })

// Инициализация canvas
const initCanvas = () => {
  if (!canvas.value) return
  
  ctx.value = canvas.value.getContext('2d')
  if (!ctx.value) return

  drawMap()
}

// Отрисовка карты
const drawMap = () => {
  if (!ctx.value || !props.map) return

  const cellSize = props.map.cellSize * zoom.value
  
  // Очистка canvas
  ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Фон
  ctx.value.fillStyle = props.map.backgroundColor
  ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Сетка
  ctx.value.strokeStyle = props.map.gridColor
  ctx.value.lineWidth = 1
  
  if (props.map.cellType === 'square') {
    drawSquareGrid(cellSize)
  } else {
    drawHexGrid(cellSize)
  }
  
  // Отрисовка слоев карты
  props.map.layers.forEach(layer => {
    if (layer.visible) {
      drawLayer(layer, cellSize)
    }
  })
  
  // Отрисовка участников
  drawParticipants(cellSize)
}

// Отрисовка квадратной сетки
const drawSquareGrid = (cellSize: number) => {
  if (!ctx.value || !props.map) return

  for (let x = 0; x <= props.map.width; x++) {
    ctx.value.beginPath()
    ctx.value.moveTo(x * cellSize, 0)
    ctx.value.lineTo(x * cellSize, props.map.height * cellSize)
    ctx.value.stroke()
  }
  
  for (let y = 0; y <= props.map.height; y++) {
    ctx.value.beginPath()
    ctx.value.moveTo(0, y * cellSize)
    ctx.value.lineTo(props.map.width * cellSize, y * cellSize)
    ctx.value.stroke()
  }
}

// Отрисовка шестиугольной сетки
const drawHexGrid = (cellSize: number) => {
  if (!ctx.value || !props.map) return

  const hexWidth = cellSize * Math.sqrt(3) / 2
  const hexHeight = cellSize
  
  for (let row = 0; row < props.map.height; row++) {
    for (let col = 0; col < props.map.width; col++) {
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

// Отрисовка слоя карты
const drawLayer = (layer: any, cellSize: number) => {
  if (!ctx.value) return

  layer.items.forEach((item: any) => {
    drawMapItem(item, cellSize)
  })
}

// Отрисовка элемента карты
const drawMapItem = (item: any, cellSize: number) => {
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
  }

  ctx.value.restore()
}

// Отрисовка участников
const drawParticipants = (cellSize: number) => {
  if (!ctx.value) return

  props.participants.forEach(participant => {
    drawParticipant(participant, cellSize)
  })
}

// Отрисовка одного участника
const drawParticipant = (participant: SessionPlayer | SessionCreature, cellSize: number) => {
  if (!ctx.value) return

  const x = participant.position.x * cellSize + cellSize / 2
  const y = participant.position.y * cellSize + cellSize / 2
  const radius = cellSize * 0.4

  ctx.value.save()
  
  // Цвет в зависимости от типа
  if (participant.type === 'player') {
    ctx.value.fillStyle = '#4ECDC4' // Голубой для игроков
  } else {
    ctx.value.fillStyle = '#FF6B6B' // Красный для существ
  }
  
  // Обводка для выбранного участника
  if (participant === props.selectedParticipant) {
    ctx.value.strokeStyle = '#FFD700'
    ctx.value.lineWidth = 3
  } else {
    ctx.value.strokeStyle = '#000'
    ctx.value.lineWidth = 2
  }
  
  // Отрисовка круга
  ctx.value.beginPath()
  ctx.value.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.value.fill()
  ctx.value.stroke()
  
  // Инициатива в центре
  ctx.value.fillStyle = '#FFF'
  ctx.value.font = `${cellSize * 0.3}px Arial`
  ctx.value.textAlign = 'center'
  ctx.value.textBaseline = 'middle'
  ctx.value.fillText(participant.initiative.toString(), x, y)
  
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
  isDragging.value = true
  dragStart.value = getMousePos(event)
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const currentPos = getMousePos(event)
  const dx = currentPos.x - dragStart.value.x
  const dy = currentPos.y - dragStart.value.y
  
  // Перемещение выбранного участника
  if (selectedParticipant.value && Math.abs(dx) + Math.abs(dy) > 0.5) {
    const newPosition = {
      x: Math.max(0, Math.min(props.map?.width || 22, selectedParticipant.value.position.x + dx)),
      y: Math.max(0, Math.min(props.map?.height || 28, selectedParticipant.value.position.y + dy))
    }
    
    emit('participantMove', selectedParticipant.value, newPosition)
    dragStart.value = currentPos
  }
}

const onMouseUp = () => {
  isDragging.value = false
}

const onCanvasClick = (event: MouseEvent) => {
  const pos = getMousePos(event)
  const clickedParticipant = getParticipantAtPosition(pos)
  
  if (clickedParticipant) {
    selectedParticipant.value = clickedParticipant
    emit('participantSelect', clickedParticipant)
  } else {
    selectedParticipant.value = null
  }
}

// Получение позиции мыши в координатах карты
const getMousePos = (event: MouseEvent): { x: number, y: number } => {
  if (!canvas.value) return { x: 0, y: 0 }
  
  const rect = canvas.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / zoom.value
  const y = (event.clientY - rect.top) / zoom.value
  
  const cellSize = props.map?.cellSize || 50
  return {
    x: Math.floor(x / cellSize),
    y: Math.floor(y / cellSize)
  }
}

// Получение участника в позиции
const getParticipantAtPosition = (pos: { x: number, y: number }): SessionPlayer | SessionCreature | null => {
  return props.participants.find(participant => 
    participant.position.x === pos.x && participant.position.y === pos.y
  ) || null
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

// Стиль индикатора хода
const getTurnIndicatorStyle = (participant: SessionPlayer | SessionCreature) => {
  const cellSize = props.map?.cellSize || 50
  const x = participant.position.x * cellSize * zoom.value + cellSize * zoom.value / 2
  const y = participant.position.y * cellSize * zoom.value - 20
  
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translateX(-50%)',
    zIndex: 10
  }
}
</script>

<style scoped>
.game-map-canvas {
  height: 100vh;
}

.map-container {
  height: 100%;
}

.canvas-wrapper {
  position: relative;
  overflow: auto;
  height: calc(100vh - 120px);
}

.game-canvas {
  border: 1px solid #ccc;
  cursor: crosshair;
}

.turn-indicator {
  pointer-events: none;
}

.game-canvas:hover {
  cursor: crosshair;
}
</style>
