<template>
  <div class="flex flex-col gap-3">
    <label
      v-if="fieldLabel"
      :for="inputId"
      :class="[
        'inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm transition-colors',
        errorMessage ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600',
      ]"
    >
      <span
        :class="[
          'h-2 w-2 rounded-full transition-colors',
          errorMessage ? 'bg-red-500' : 'bg-indigo-400',
        ]"
        aria-hidden="true"
      />
      <span>{{ fieldLabel }}</span>
      <span
        v-if="errorMessage"
        class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-red-700"
      >
        Hata
      </span>
    </label>

    <div class="relative">
      <textarea
        :id="inputId"
        :rows="rows"
        class="peer w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-100': !!errorMessage }"
        :placeholder="placeholderText"
        v-model="value"
      />

      <span
        class="pointer-events-none absolute inset-x-3 bottom-2 h-px bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 opacity-0 transition-opacity duration-300 peer-focus:opacity-100"
        :class="{ '!from-red-500 !via-rose-500 !to-red-500': !!errorMessage }"
      />
    </div>

    <p
      v-if="errorMessage"
      class="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
    >
      <span class="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
      <span>{{ errorMessage }}</span>
    </p>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'
import { useField } from 'vee-validate'

const props = defineProps({
  fieldLabel: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    default: '',
  },
  placeholderText: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 4,
  },
})

const { inputId } = toRefs(props)

const { value, errorMessage } = useField(inputId.value)
</script>
