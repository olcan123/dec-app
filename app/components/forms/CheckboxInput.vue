<template>
  <div class="flex items-start gap-3">
    <input
      :id="inputId"
      type="checkbox"
      class="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      v-model="value"
    />
    <label
      :for="inputId"
      class="flex flex-col gap-1 text-sm text-slate-700"
    >
      <span class="font-semibold">{{ labelText }}</span>
      <span v-if="description" class="text-xs font-normal text-slate-500">{{ description }}</span>
    </label>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { useField } from 'vee-validate'

const props = defineProps({
  fieldLabel: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})

const { inputId, fieldLabel, description } = toRefs(props)

const labelText = computed(() => fieldLabel.value || 'Onay')

const { value } = useField(inputId.value)
</script>