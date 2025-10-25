<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          <header class="space-y-1 pb-4">
            <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
            <p class="text-sm text-slate-500">{{ effectiveDescription }}</p>
          </header>

          <div class="space-y-4 overflow-y-auto pb-4 max-h-[60vh]">
            <div class="mb-3">
              <label class="block mb-2 text-sm text-slate-600"
                >Oluşturulacak Dönem (ör. 03/2025)</label
              >
              <input
                type="text"
                v-model="newPeriodName"
                placeholder="MM/YYYY veya metin (ör. 03/2025)"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>

            <div class="mb-3 space-y-3">
              <div
                v-for="type in uniqueTypes"
                :key="type.typeId"
                class="flex items-center gap-3"
              >
                <span class="flex-1 text-sm text-slate-700">{{
                  type.typeName
                }}</span>
                <input
                  type="date"
                  v-model="perTypeDates[type.typeId]"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>
            </div>

            <div
              class="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500"
            >
              <p class="text-sm font-semibold text-slate-700">
                Oluşturulacak Dönem Özeti
              </p>
              {{ newPeriodName || "Yeni" }} dönemi için
              {{ selectedItemsCount }} beyan
              {{ normalizedItems.length }} tanesinden seçildi.
            </div>

            <div class="rounded-lg border border-slate-100 bg-white px-4 py-3">
              <div class="mb-2 flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-700">Müşteriler</p>
                <label class="text-sm text-slate-500">
                  <input
                    type="checkbox"
                    class="mr-2"
                    @change="toggleSelectAllCustomers"
                    :checked="allCustomersSelected"
                  />
                  Tümünü Seç
                </label>
              </div>
              <div class="max-h-40 space-y-2 overflow-auto">
                <div
                  v-for="cust in uniqueCustomers"
                  :key="cust.customerId"
                  class="flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    v-model="selectedCustomers[cust.customerId]"
                  />
                  <span class="text-sm">{{ cust.customerTitle }}</span>
                </div>
              </div>
              <p class="mt-2 text-xs text-slate-500">
                Seçilen müşteriler: {{ selectedCustomerCount }} — Etkilenecek
                beyan sayısı: {{ selectedItemsCount }}
              </p>
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
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isConfirmDisabled"
              @click="handleConfirm"
            >
              <span v-if="loading">Oluşturuluyor...</span>
              <span v-else>Oluştur</span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, watch, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCustomerStore } from "~/stores/customer";
import { useDeclarationStore } from "~/stores/declaration";
import { useNextPeriod } from "~/composables/nextPeriod";
import {
  normalizeDeclarationItems,
  extractUniqueCustomers,
  extractUniqueTypes,
} from "~/utils/declarationHelpers";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  nextPeriodName: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  title: { type: String, default: "Sonraki Dönem Oluştur" },
  description: {
    type: String,
    default: "Son dönem beyanlarını kopyalayın ve son tarihleri güncelleyin.",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

// --- Stores ---
const customerStore = useCustomerStore();
const declarationStore = useDeclarationStore();
const { customers: storeCustomers } = storeToRefs(customerStore);
const { declarationTypes, declarations: storeDeclarations } =
  storeToRefs(declarationStore);

// --- Composable ---
const {
  initializeTypeDates,
  initializeCustomerSelections,
  buildNextPeriodPayload,
} = useNextPeriod();

// --- State ---
const perTypeDates = reactive({});
const selectedCustomers = reactive({});
const newPeriodName = ref("");

// --- Computed Properties ---
const normalizedItems = computed(() =>
  normalizeDeclarationItems(props.items, newPeriodName.value)
);

const uniqueCustomers = computed(() =>
  extractUniqueCustomers(normalizedItems.value)
);

const uniqueTypes = computed(() => extractUniqueTypes(normalizedItems.value));

const selectedCustomerCount = computed(
  () => Object.values(selectedCustomers).filter(Boolean).length
);

const selectedItems = computed(() =>
  normalizedItems.value.filter((it) => selectedCustomers[it.customerId])
);

const selectedItemsCount = computed(() => selectedItems.value.length);

const allCustomersSelected = computed(
  () =>
    uniqueCustomers.value.length > 0 &&
    selectedCustomerCount.value === uniqueCustomers.value.length
);

const effectiveDescription = computed(
  () =>
    props.description ||
    `${
      newPeriodName.value || "Yeni"
    } dönemi için son beyanları kopyalayın ve son tarihleri güncelleyin.`
);

const isConfirmDisabled = computed(
  () =>
    props.loading ||
    !selectedItemsCount.value ||
    uniqueTypes.value.some((type) => !perTypeDates[type.typeId]) ||
    !newPeriodName.value
);

// --- Helper: Get declaration type by ID ---
const getDeclarationTypeById = (typeId) => {
  return (declarationTypes.value || []).find(
    (t) => String(t.id) === String(typeId)
  );
};

// --- Watchers ---
watch(
  () => [props.modelValue, props.items],
  ([isOpen]) => {
    if (!isOpen) return;

    // Set initial period name
    newPeriodName.value =
      props.nextPeriodName || normalizedItems.value[0]?.periodName || "";

    // Clear previous state
    Object.keys(perTypeDates).forEach((key) => delete perTypeDates[key]);
    Object.keys(selectedCustomers).forEach(
      (key) => delete selectedCustomers[key]
    );

    // Initialize type dates
    const initialDates = initializeTypeDates(
      uniqueTypes.value,
      normalizedItems.value,
      newPeriodName.value,
      getDeclarationTypeById
    );
    Object.assign(perTypeDates, initialDates);

    // Initialize customer selections
    const initialSelections = initializeCustomerSelections(
      uniqueCustomers.value,
      storeCustomers.value
    );
    Object.assign(selectedCustomers, initialSelections);
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (
      isOpen &&
      (!declarationTypes.value || declarationTypes.value.length === 0)
    ) {
      declarationStore
        .fetchDeclarationTypes()
        .catch((e) => console.error("Failed to fetch declaration types:", e));
    }
  }
);

// --- Methods ---
const handleClose = () => {
  if (props.loading) return;
  emit("update:modelValue", false);
};

const toggleSelectAllCustomers = (event) => {
  const isChecked = event.target.checked;
  uniqueCustomers.value.forEach((cust) => {
    selectedCustomers[cust.customerId] = isChecked;
  });
};

const handleConfirm = () => {
  if (isConfirmDisabled.value) return;

  const payload = buildNextPeriodPayload({
    selectedItems: selectedItems.value,
    targetPeriod: newPeriodName.value,
    perTypeDates,
    uniqueCustomers: uniqueCustomers.value,
    selectedCustomers,
    declarationTypes: declarationTypes.value || [],
    existingDeclarations: storeDeclarations.value || [],
  });

  console.debug("NextPeriodModal payload:", payload);
  emit("confirm", payload);
};

// --- Lifecycle ---
onMounted(() => {
  if (!storeCustomers.value || storeCustomers.value.length === 0) {
    customerStore
      .fetchCustomers()
      .catch((e) => console.error("Failed to fetch customers:", e));
  }
});
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
