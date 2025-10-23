<template>
  <section class="space-y-6">
    <header
      class="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur"
    >
      <div class="space-y-2">
        <slot name="badge">
          <span
            v-if="badgeLabel"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
            {{ badgeLabel }}
          </span>
        </slot>

        <div v-if="title || description">
          <h1 v-if="title" class="text-3xl font-semibold text-slate-900">
            {{ title }}
          </h1>
          <p v-if="description" class="mt-1 max-w-xl text-sm text-slate-500">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <slot name="actions">
          <button
            v-if="actionLabel"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
            @click.prevent="onActionClick"
          >
            <slot name="action-icon">
              <svg
                v-if="actionIcon"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </slot>
            {{ actionLabel }}
          </button>
        </slot>
      </div>
    </header>
  </section>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  badgeLabel: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
  actionIcon: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['action'])

const onActionClick = () => {
  emit('action')
}

const { title, description, badgeLabel, actionLabel, actionIcon } = toRefs(props)
</script>
