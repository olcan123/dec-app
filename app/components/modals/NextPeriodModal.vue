<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          @click="handleClose"
        ></div>

        <div
          class="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          <header class="space-y-1 pb-4">
            <h2 class="text-lg font-semibold text-slate-900">
              {{ title }}
            </h2>
            <p class="text-sm text-slate-500">
              {{ effectiveDescription }}
            </p>
          </header>

          <div class="space-y-4 overflow-y-auto pb-4 max-h-[60vh]">
            <div class="mb-3">
              <label class="text-sm text-slate-600 block mb-2">Oluşturulacak Dönem (ör. 03/2025)</label>
              <input
                type="text"
                v-model="newPeriodName"
                placeholder="MM/YYYY veya metin (ör. 03/2025)"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>

            <div class="space-y-3 mb-3">
              <div v-for="type in uniqueTypes" :key="String(type.typeId)" class="flex items-center gap-3">
                <div class="flex-1 text-sm text-slate-700">{{ type.typeName }}</div>
                <input
                  type="date"
                  v-model="perTypeDates[String(type.typeId)]"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>
            </div>

            <div class="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-sm font-semibold text-slate-700">Oluşturulacak Dönem</p>
              <p class="text-xs text-slate-500">{{ newPeriodName || nextPeriodLabel }} dönemi için {{ normalizedItems.length }} beyan kopyalanacak.</p>
            </div>

            <div class="rounded-lg border border-slate-100 bg-white px-4 py-3">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-semibold text-slate-700">Müşteriler</p>
                <label class="text-sm text-slate-500">
                  <input type="checkbox" class="mr-2" @change="(e) => { const v = e.target.checked; uniqueCustomers.forEach(c => selectedCustomers[String(c.customerId)] = v); }" />
                  Tümünü Seç
                </label>
              </div>
              <div class="space-y-2 max-h-40 overflow-auto">
                <div v-for="cust in uniqueCustomers" :key="String(cust.customerId)" class="flex items-center gap-3">
                  <input type="checkbox" v-model="selectedCustomers[String(cust.customerId)]" />
                  <div class="text-sm">{{ cust.customerTitle }}</div>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-2">Seçilen müşteriler: {{ selectedCustomerCount }} — Etkilenecek beyan sayısı: {{ selectedItemsCount }}</p>
            </div>

            <p v-if="!normalizedItems.length" class="text-sm text-slate-500">
              Kopyalanacak beyan bulunamadı.
            </p>
          </div>

          <footer class="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              @click="handleClose"
              :disabled="loading"
            >
              İptal
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1"
              :disabled="isConfirmDisabled"
              :class="{ 'cursor-not-allowed opacity-60': isConfirmDisabled }"
              @click="handleConfirm"
            >
              {{ loading ? "Oluşturuluyor..." : "Oluştur" }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, watch, ref, toRefs } from "vue";
import { storeToRefs } from "pinia";
import { useCustomerStore } from "~/stores/customer";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
  nextPeriodName: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Sonraki Dönem Oluştur",
  },
  description: {
    type: String,
    default: "Son dönem beyanlarını kopyalayın ve son tarihleri güncelleyin.",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const dueDates = reactive({});
const perTypeDates = reactive({});
const selectedCustomers = reactive({});

// expose props as refs using toRefs for easier reactive access
const { modelValue, items, nextPeriodName, loading, title, description } = toRefs(props);

const uniqueCustomers = computed(() => {
  const map = new Map();
  normalizedItems.value.forEach((item) => {
    const cid = String(item.customerId ?? "");
    if (!map.has(cid)) {
      map.set(cid, { customerId: item.customerId, customerTitle: item.customerTitle ?? `Müşteri #${cid}` });
    }
  });
  return Array.from(map.values()).sort((a, b) => String(a.customerTitle || "").localeCompare(String(b.customerTitle || "")));
});

const selectedCustomerCount = computed(() => Object.keys(selectedCustomers).filter((k) => selectedCustomers[k]).length);
const selectedItemsCount = computed(() => normalizedItems.value.filter((it) => selectedCustomers[String(it.customerId ?? "")] ).length);
const newPeriodName = ref(nextPeriodName.value || "");

// helper: if user enters MM/YYYY (e.g. 03/2025) compute default due date as 15th of next month
const computeDefaultDueForPeriod = (period) => {
  // accept MM/YYYY or M/YYYY
  const m = String(period || "").trim();
  const match = m.match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2]);

  // target: next month after the period -> if period is 03/2025, next month is April 2025
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  // construct yyyy-mm-dd for 15th
  const mm = String(nextMonth).padStart(2, "0");
  const dd = "15";
  return `${nextYear}-${mm}-${dd}`;
};

const normalizedItems = computed(() =>
  (Array.isArray(items.value) ? items.value : []).map((item, index) => ({
    key: String(item?.key ?? index),
    typeId: item?.typeId,
    typeName: item?.typeName ?? "Tanımsız Beyan Türü",
    dueDate: item?.dueDate ?? "",
    customerId: item?.customerId ?? null,
    customerTitle: item?.customerTitle ?? "",
    periodName: item?.periodName ?? nextPeriodName.value,
  }))
);

// use customer store to get isActive flags
const customerStore = useCustomerStore();
const { customers: storeCustomers } = storeToRefs(customerStore);

const uniqueTypes = computed(() => {
  const map = new Map();
  normalizedItems.value.forEach((item) => {
    const tid = String(item.typeId ?? "");
    if (!map.has(tid)) {
      map.set(tid, { typeId: item.typeId, typeName: item.typeName });
    }
  });
  return Array.from(map.values()).sort((a, b) => String(a.typeName || "").localeCompare(String(b.typeName || "")));
});

watch(
  normalizedItems,
  (items) => {
    const keys = new Set();

    items.forEach((item, index) => {
      const key = String(item.key ?? index);
      keys.add(key);
      dueDates[key] = item.dueDate ?? "";
    });

    Object.keys(dueDates).forEach((key) => {
      if (!keys.has(key)) {
        delete dueDates[key];
      }
    });
    // Initialize perTypeDates with first seen date for each type
    uniqueTypes.value.forEach((type) => {
      const tid = String(type.typeId ?? "");
      if (!(tid in perTypeDates)) {
        const found = items.find((it) => String(it.typeId ?? "") === tid && it.dueDate);
        perTypeDates[tid] = found ? found.dueDate : "";
      }
    });
  },
  { immediate: true }
);

// when user enables per-type mode, initialize perTypeDates from existing dueDates
// initialize perTypeDates when modal opens or when newPeriodName changes
watch(
  [() => modelValue.value, newPeriodName],
  ([open]) => {
    if (!open) return;

    // If modal opened, initialize newPeriodName.
    // Prefer the explicit prop `nextPeriodName` (caller-provided target). If not present,
    // fall back to the first normalized item's periodName without incrementing it (items
    // passed from caller may already contain the intended next period).
    if (!newPeriodName.value) {
      if (nextPeriodName.value) {
        newPeriodName.value = nextPeriodName.value;
      } else {
        const firstPeriod = normalizedItems.value?.[0]?.periodName;
        newPeriodName.value = firstPeriod ?? "";
      }
    }

    // compute default due for entered period
    const defaultDue = computeDefaultDueForPeriod(newPeriodName.value);

    uniqueTypes.value.forEach((type) => {
      const tid = String(type.typeId ?? "");
      // overwrite to the computed default (or blank) so period input controls defaults
      perTypeDates[tid] = defaultDue ?? "";
    });

    // initialize customer selection - prefer store customer's isActive when available
    uniqueCustomers.value.forEach((c) => {
      const match = (storeCustomers.value || []).find((pc) => String(pc.id) === String(c.customerId));
      if (match && typeof match.isActive === "boolean") {
        selectedCustomers[String(c.customerId)] = !!match.isActive;
      } else {
        selectedCustomers[String(c.customerId)] = true;
      }
    });
  },
  { immediate: true }
);

const nextPeriodLabel = computed(() => nextPeriodName.value || "Yeni");
const effectiveDescription = computed(
  () =>
    description.value ||
    `${nextPeriodLabel.value} dönemi için son beyanları kopyalayın ve son tarihleri güncelleyin.`
);

const isConfirmDisabled = computed(() => {
  if (loading.value) {
    return true;
  }

  if (!normalizedItems.value.length) {
    return true;
  }
  // require at least one selected customer and item
  if (!selectedCustomerCount.value || !selectedItemsCount.value) {
    return true;
  }

  // require a date for each unique type (per-type mode always on)
  return uniqueTypes.value.some((type) => {
    const tid = String(type.typeId ?? "");
    return !perTypeDates[tid];
  });
});

const handleClose = () => {
  if (loading.value) {
    return;
  }

  emit("update:modelValue", false);
};

const handleConfirm = () => {
  if (isConfirmDisabled.value) {
    return;
  }

  const payload = normalizedItems.value
    .filter((item) => selectedCustomers[String(item.customerId)])
    .map((item, index) => {
    const key = String(item.key ?? index);
    const tid = String(item.typeId ?? "");
    const due = perTypeDates[tid];

    return {
      typeId: item.typeId,
      dueDate: due,
      customerId: item.customerId,
      periodName: item.periodName,
      customerTitle: item.customerTitle,
    };
  });

  emit("confirm", payload);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
