<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>Добавить условие</v-card-title>
      <v-card-text>
        <v-form v-model="formValid" ref="form">
          <v-select
            v-model="selectedCondition"
            label="Выберите условие"
            :items="conditionOptions"
            :rules="[v => !!v || 'Выберите условие']"
            required
          ></v-select>
          
          <v-text-field
            v-if="selectedCondition === 'custom'"
            v-model="customCondition"
            label="Пользовательское условие"
            :rules="[v => !!v || 'Введите условие']"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn
          color="primary"
          @click="addCondition"
          :disabled="!formValid"
        >
          Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  add: [condition: string]
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formValid = ref(false)
const selectedCondition = ref('')
const customCondition = ref('')

const conditionOptions = [
  'Ослеплен',
  'Очарован',
  'Оглушен',
  'Испуган',
  'Окаменен',
  'Отравлен',
  'Сбит с ног',
  'Связан',
  'Невидимый',
  'Парализован',
  'Ошеломлен',
  'Безумен',
  'custom'
]

const addCondition = () => {
  const condition = selectedCondition.value === 'custom' ? customCondition.value : selectedCondition.value
  
  if (condition) {
    emit('add', condition)
    
    // Сброс формы
    selectedCondition.value = ''
    customCondition.value = ''
  }
}
</script>
