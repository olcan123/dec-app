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
      <input
        :id="inputId"
        type="text"
        class="peer w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 pb-2 pt-4 text-base font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:border-dashed disabled:text-slate-400"
        :class="{ 'border-red-400 focus:border-red-500': !!errorMessage }"
        placeholder=" "
        v-model="value"
      />

      <span
        class="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 transition-transform duration-300 peer-focus:scale-x-100"
        :class="{ '!bg-red-500 peer-focus:!scale-x-100': !!errorMessage }"
      />

      <span
        class="pointer-events-none absolute left-0 top-1 text-xs font-semibold uppercase tracking-widest text-slate-400 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-focus:top-1 peer-focus:text-xs peer-focus:tracking-[0.35em]"
        :class="{ 'text-red-500 peer-focus:text-red-500': !!errorMessage }"
      >
        {{ placeholderText }}
      </span>
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
import { toRefs } from "vue";
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
});

const { inputId } = toRefs(props);

const { value, errorMessage } = useField(inputId.value);
</script>
