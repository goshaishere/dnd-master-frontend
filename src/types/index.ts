// Основные типы данных для D&D приложения

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface GameMap {
  id: string
  name: string
  description: string
  width: number // в клетках
  height: number // в клетках
  cellSize: number // размер клетки в пикселях
  cellType: 'square' | 'hexagon'
  backgroundColor: string
  gridColor: string
  layers: MapLayer[]
  createdAt: Date
  updatedAt: Date
}

export interface MapLayer {
  id: string
  name: string
  type: 'terrain' | 'objects' | 'creatures' | 'players'
  visible: boolean
  locked: boolean
  items: MapItem[]
}

export interface MapItem {
  id: string
  type: 'terrain' | 'building' | 'creature' | 'player' | 'loot'
  position: Position
  size: Size
  rotation: number
  data: any // специфичные данные для каждого типа
}

export interface TerrainItem extends MapItem {
  type: 'terrain'
  data: {
    terrainType: 'grass' | 'stone' | 'water' | 'sand' | 'forest' | 'mountain'
    texture?: string
  }
}

export interface BuildingItem extends MapItem {
  type: 'building'
  data: {
    buildingType: 'house' | 'castle' | 'dungeon' | 'camp' | 'ruins'
    name: string
    description: string
    rooms?: Room[]
  }
}

export interface Room {
  id: string
  name: string
  position: Position
  size: Size
  description: string
  connections: string[] // ID других комнат
}

export interface CreatureItem extends MapItem {
  type: 'creature'
  data: {
    creatureId: string
    name: string
    hp: number
    maxHp: number
    ac: number
    speed: number
    initiative?: number
    conditions: string[]
  }
}

export interface PlayerItem extends MapItem {
  type: 'player'
  data: {
    characterId: string
    name: string
    hp: number
    maxHp: number
    ac: number
    speed: number
    initiative?: number
    conditions: string[]
    inventory: InventoryItem[]
  }
}

export interface LootItem extends MapItem {
  type: 'loot'
  data: {
    name: string
    description: string
    value: number
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'gem' | 'coin' | 'other'
  }
}

export interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  gender: 'male' | 'female' | 'other'
  alignment: string
  background: string
  stats: CharacterStats
  skills: CharacterSkills
  equipment: Equipment
  inventory: InventoryItem[]
  spells: Spell[]
  features: CharacterFeature[]
  createdAt: Date
  updatedAt: Date
}

export interface CharacterStats {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface CharacterSkills {
  [key: string]: {
    proficient: boolean
    bonus: number
  }
}

export interface Equipment {
  armor: InventoryItem | null
  weapon: InventoryItem | null
  shield: InventoryItem | null
  accessories: InventoryItem[]
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'gem' | 'coin' | 'other'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  value: number
  weight: number
  quantity: number
  properties?: string[]
}

export interface Spell {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  description: string
  prepared: boolean
}

export interface CharacterFeature {
  id: string
  name: string
  description: string
  type: 'racial' | 'class' | 'feat'
  uses?: number
  maxUses?: number
}

export interface Creature {
  id: string
  name: string
  type: 'beast' | 'humanoid' | 'dragon' | 'undead' | 'elemental' | 'fiend' | 'celestial' | 'aberration'
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'
  alignment: string
  ac: number
  hp: number
  speed: string
  stats: CharacterStats
  skills: string[]
  senses: string[]
  languages: string[]
  challenge: number
  xp: number
  abilities: CreatureAbility[]
  actions: CreatureAction[]
  legendaryActions?: LegendaryAction[]
  description: string
  isCustom: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatureAbility {
  name: string
  description: string
  type: 'innate' | 'spell' | 'feature'
}

export interface CreatureAction {
  name: string
  description: string
  type: 'action' | 'bonus' | 'reaction'
  attackBonus?: number
  damage?: string
}

export interface LegendaryAction {
  name: string
  description: string
  cost: number
}

export interface GameSession {
  id: string
  name: string
  description: string
  mapId: string
  players: SessionPlayer[]
  creatures: SessionCreature[]
  currentTurn: number
  round: number
  status: 'preparation' | 'active' | 'paused' | 'finished'
  createdAt: Date
  updatedAt: Date
}

export interface SessionPlayer {
  characterId: string
  position: Position
  hp: number
  conditions: string[]
  initiative: number
  turnOrder: number
  type: 'player'
  name: string
  maxHp: number
  ac: number
  speed: string
}

export interface SessionCreature {
  creatureId: string
  position: Position
  hp: number
  conditions: string[]
  initiative: number
  turnOrder: number
  type: 'creature'
  name: string
  maxHp: number
  ac: number
  speed: string
}

export interface AppData {
  maps: GameMap[]
  characters: Character[]
  creatures: Creature[]
  customCreatures: Creature[]
  gameSessions: GameSession[]
  settings: AppSettings
}

export interface AppSettings {
  theme: 'light' | 'dark'
  language: 'ru' | 'en'
  defaultMapSize: {
    width: number
    height: number
  }
  defaultCellSize: number
  autoSave: boolean
}
