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
      <select
        :id="inputId"
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-inner transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:border-dashed disabled:text-slate-400"
        :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-200': !!errorMessage }"
        v-model="localValue"
      >
        <option value="" disabled hidden>
          {{ placeholderText || 'Seçiniz' }}
        </option>
        <option
          v-for="option in normalizedOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
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
import { computed, toRefs } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
  fieldLabel: {
    type: String,
    default: "",
  },
  inputId: {
    type: String,
    default: "",
  },
  placeholderText: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const { inputId, options } = toRefs(props);

const { value, errorMessage } = useField(inputId.value);

const normalizedOptions = computed(() =>
  options.value.map((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return { label: String(option), value: String(option) };
    }

    return {
      label: option.label ?? String(option.value ?? ""),
      value: option.value !== undefined ? String(option.value) : "",
    };
  })
);

const localValue = computed({
  get: () => (value.value ?? "")?.toString(),
  set: (newValue) => {
    value.value = newValue;
  },
});
</script>
