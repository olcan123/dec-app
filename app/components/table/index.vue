<template>
  <div
    class="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div v-if="enableSearch" class="relative w-full max-w-sm">
        <input
          v-model="searchTerm"
          type="search"
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-inner transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          :placeholder="searchPlaceholder"
          aria-label="Kayıtlarda ara"
        />
        <svg
          class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="m15.5 15.5-3.5-3.5m1-2.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="flex items-center gap-3">
        <slot name="actions" />
        <button
          v-if="showRefresh"
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          @click="onRefreshClick"
        >
          {{ refreshLabel }}
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
    >
      {{ loadingMessage }}
    </div>

    <div
      v-else-if="hasError"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600"
    >
      {{ errorMessage }}
    </div>

    <div v-else>
      <div
        class="flex items-center justify-between pb-2 text-xs font-medium uppercase tracking-wide text-slate-400"
      >
        <span>{{ totalCount }} kayıt bulundu</span>
        <div class="text-slate-500">
          <slot name="summary" :count="totalCount" :search="searchTerm">
            <span v-if="searchTerm">“{{ searchTerm }}” için sonuçlar</span>
          </slot>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table
          class="min-w-full divide-y divide-slate-200 text-sm text-slate-700"
        >
          <thead
            class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            <tr>
              <th
                v-for="column in displayColumns"
                :key="column.key"
                scope="col"
                class="whitespace-nowrap px-4 py-3 font-semibold"
              >
                <button
                  v-if="column.sortable !== false && column.key"
                  type="button"
                  class="flex items-center gap-1 text-left transition hover:text-indigo-600"
                  @click="toggleSort(column.key)"
                >
                  <span>{{ column.label }}</span>
                  <span
                    v-if="sortField === column.key"
                    class="text-xs text-indigo-500"
                    aria-hidden="true"
                  >
                    {{ sortDirection === "asc" ? "▲" : "▼" }}
                  </span>
                </button>
                <span v-else class="block">{{ column.label }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(row, rowIndex) in sortedRows"
              :key="rowKey(row, rowIndex)"
              :class="['hover:bg-slate-50', resolveRowClass(row, rowIndex)]"
            >
              <td
                v-for="column in displayColumns"
                :key="column.key || `action-${rowIndex}`"
                class="whitespace-nowrap px-4 py-3"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :column="column"
                >
                  {{ formatCellValue(row[column.key]) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!sortedRows.length"
        class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
      >
        <slot name="empty">
          {{ emptyStateMessage }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  searchPlaceholder: {
    type: String,
    default: "Kayıt ara",
  },
  searchFields: {
    type: Array,
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMessage: {
    type: String,
    default: "Kayıtlar yükleniyor...",
  },
  errorMessage: {
    type: String,
    default: "",
  },
  emptyStateMessage: {
    type: String,
    default: "Kayıt bulunamadı.",
  },
  initialSortField: {
    type: String,
    default: "",
  },
  initialSortDirection: {
    type: String,
    default: "asc",
    validator: (value) => ["asc", "desc"].includes(value),
  },
  rowClass: {
    type: [Function, String],
    default: null,
  },
  locale: {
    type: String,
    default: "tr-TR",
  },
  showRefresh: {
    type: Boolean,
    default: false,
  },
  refreshLabel: {
    type: String,
    default: "Yenile",
  },
});

const emit = defineEmits(["refresh"]);

const searchTerm = ref("");
const sortField = ref("");
const sortDirection = ref(props.initialSortDirection);

const displayColumns = computed(() =>
  Array.isArray(props.columns) ? props.columns : []
);

const hasError = computed(() => Boolean(props.errorMessage));
const enableSearch = computed(() => searchKeys.value.length > 0);

const searchKeys = computed(() => {
  if (Array.isArray(props.searchFields) && props.searchFields.length > 0) {
    return props.searchFields;
  }
  return displayColumns.value.map((column) => column.key).filter(Boolean);
});

watch(
  () => props.initialSortField,
  (value) => {
    if (value && displayColumns.value.some((column) => column.key === value)) {
      sortField.value = value;
    }
  },
  { immediate: true }
);

watch(
  displayColumns,
  (columns) => {
    if (!columns.some((column) => column.key === sortField.value)) {
      const fallback = props.initialSortField || columns[0]?.key || "";
      sortField.value = fallback;
    }
  },
  { immediate: true }
);

const sourceRows = computed(() =>
  Array.isArray(props.rows) ? props.rows : []
);

const normalizedSearch = computed(() => searchTerm.value.trim().toLowerCase());

const filteredRows = computed(() => {
  if (!normalizedSearch.value) {
    return sourceRows.value;
  }

  return sourceRows.value.filter((row) => {
    return searchKeys.value
      .map((key) => row?.[key])
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase())
      .some((value) => value.includes(normalizedSearch.value));
  });
});

const sortedRows = computed(() => {
  const items = [...filteredRows.value];
  if (!sortField.value) {
    return items;
  }

  const direction = sortDirection.value === "asc" ? 1 : -1;

  return items.sort((a, b) => {
    const aValue = a?.[sortField.value];
    const bValue = b?.[sortField.value];

    if (aValue == null && bValue == null) {
      return 0;
    }
    if (aValue == null) {
      return 1 * direction;
    }
    if (bValue == null) {
      return -1 * direction;
    }

    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return (Number(aValue) - Number(bValue)) * direction;
    }

    const aString = String(aValue).toLocaleLowerCase(props.locale);
    const bString = String(bValue).toLocaleLowerCase(props.locale);

    return aString.localeCompare(bString, props.locale) * direction;
  });
});

const totalCount = computed(() => sortedRows.value.length);

const toggleSort = (field) => {
  if (!field) {
    return;
  }

  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    return;
  }

  sortField.value = field;
  sortDirection.value = "asc";
};

const rowKey = (row, index) => {
  if (row?.id !== undefined && row?.id !== null) {
    return row.id;
  }

  const primaryKey = displayColumns.value[0]?.key;
  if (
    primaryKey &&
    row?.[primaryKey] !== undefined &&
    row?.[primaryKey] !== null
  ) {
    return `${row[primaryKey]}-${index}`;
  }

  return index;
};

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Evet" : "Hayır";
  }

  return value;
};

const resolveRowClass = (row, index) => {
  if (typeof props.rowClass === "function") {
    return props.rowClass(row, index) || "";
  }

  if (typeof props.rowClass === "string") {
    return props.rowClass;
  }

  return "";
};

const onRefreshClick = () => {
  emit("refresh");
};

defineExpose({
  searchTerm,
  sortField,
  sortDirection,
  sortedRows,
});
</script>
