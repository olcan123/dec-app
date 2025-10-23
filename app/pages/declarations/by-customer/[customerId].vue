<template>
  <section class="space-y-6 p-6">
    <PagesHeader
      :title="pageTitle"
      description="Dönem bazında beyan sayıları"
      action-label="Müşteri Listesine Dön"
      @action="goBack"
    />

    <DataTable
      v-if="customerSummary && !hasNestedRoute"
      :columns="columns"
      :rows="periodRows"
      empty-state-message="Bu müşteri için dönem bilgisi bulunamadı."
      search-placeholder="Dönem ara"
      :search-fields="['periodName']"
      initial-sort-field="periodName"
      :show-refresh="true"
      :row-class="resolveRowHighlight"
      @refresh="refresh"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          :disabled="!canGenerateNextPeriod || loading.value"
          :class="{ 'cursor-not-allowed opacity-60': !canGenerateNextPeriod || loading.value }"
          @click="openNextPeriodModal"
        >
          Sonraki Dönemi Oluştur
        </button>
      </template>
      <template #cell-completionSummary="{ row }">
        <span :class="completionBadgeClass(row)">
          {{ row.completedCount }} / {{ row.declarationCount }}
        </span>
      </template>
      <template #cell-declarationCount="{ value }">
        <span
          class="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
        >
          {{ value }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <button
          type="button"
          class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          @click="handleSelectPeriod(row.periodName)"
        >
          Detay
        </button>
      </template>
    </DataTable>

    <NuxtPage v-else-if="hasNestedRoute" />

    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500"
    >
      Seçili müşteri için beyan bulunamadı.
    </div>

    <NextPeriodModal
      v-model="showNextPeriodModal"
      :items="modalItems"
      :next-period-name="nextPeriodName"
      :loading="loading"
      :title="modalTitle"
      :description="modalDescription"
      @confirm="handleNextPeriodConfirm"
    />
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import PagesHeader from "~/components/pages/header/index.vue";
import DataTable from "~/components/table/index.vue";
import NextPeriodModal from "~/components/modals/NextPeriodModal.vue";
import { useCustomerStore } from "~/stores/customer";
import { useDeclarationStore } from "~/stores/declaration";
import {
  buildCustomerSummaries,
  getCustomerSummaryById,
} from "~/utils/declarations/summary";
import {
  comparePeriods,
  findLatestPeriodName,
  formatNextPeriodName,
} from "~/utils/declarations/period";

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();

const customerStore = useCustomerStore();
const declarationStore = useDeclarationStore();

const { customers } = storeToRefs(customerStore);
const { declarations, declarationTypes, loading } = storeToRefs(declarationStore);

const ensureData = async () => {
  const tasks = [];

  if (!customers.value.length) {
    tasks.push(customerStore.fetchCustomers());
  }

  if (!declarations.value.length) {
    tasks.push(declarationStore.fetchDeclarations());
  }

  if (!declarationTypes.value.length) {
    tasks.push(declarationStore.fetchDeclarationTypes());
  }

  if (!tasks.length) {
    return;
  }

  try {
    await Promise.all(tasks);
  } catch (err) {
    console.error("Veri yüklenemedi", err);
  }
};

await ensureData();

const toast = useToast();
const showNextPeriodModal = ref(false);

const declarationsForCustomer = computed(() =>
  declarations.value.filter(
    (item) =>
      String(item?.customerId ?? "") === String(customerId.value ?? ""),
  ),
);

const latestPeriod = computed(() => {
  if (!customerSummary.value?.periodCounts?.length) {
    return null;
  }

  const periods = [...customerSummary.value.periodCounts].sort((a, b) =>
    comparePeriods(a.periodName, b.periodName)
  );

  return periods[periods.length - 1] ?? null;
});

const latestPeriodName = computed(() => latestPeriod.value?.periodName ?? "");

const nextPeriodName = computed(() =>
  latestPeriodName.value ? formatNextPeriodName(latestPeriodName.value) : ""
);

const typeNameMap = computed(() => {
  const map = new Map();

  declarationTypes.value.forEach((type) => {
    map.set(Number(type.id), type.typeName);
  });

  return map;
});

const latestPeriodDeclarations = computed(() => {
  if (!latestPeriodName.value) {
    return [];
  }

  return declarationsForCustomer.value.filter(
    (item) => String(item?.periodName ?? "") === latestPeriodName.value,
  );
});

const modalItems = computed(() =>
  latestPeriodDeclarations.value.map((item, index) => {
    let dueDate = "";

    if (item.dueDate) {
      const parsed = new Date(item.dueDate);

      if (!Number.isNaN(parsed.getTime())) {
        dueDate = parsed.toISOString().slice(0, 10);
      }
    }

    const typeLabel = typeNameMap.value.get(Number(item.typeId));

    return {
      key: String(item.id ?? index),
      typeId: Number(item.typeId) || item.typeId,
      typeName: typeLabel ?? `Tür #${item.typeId ?? "-"}`,
      dueDate,
      customerId: customerId.value,
      customerTitle: pageTitle.value,
      periodName: nextPeriodName.value,
    };
  }),
);

const modalTitle = computed(() =>
  `${pageTitle.value} • ${nextPeriodName.value || "Sonraki Dönem"}`
);

const modalDescription = computed(() =>
  nextPeriodName.value
    ? `${nextPeriodName.value} dönemi için son beyannameleri kopyalayın ve son tarihleri güncelleyin.`
    : `Sonraki dönem için son beyannameleri kopyalayın ve son tarihleri güncelleyin.`
);

const canGenerateNextPeriod = computed(
  () => Boolean(nextPeriodName.value) && modalItems.value.length > 0,
);

const customerId = computed(() => route.params.customerId ?? null);
const hasNestedRoute = computed(() => Boolean(route.params.periodName));

const customerSummaries = computed(() =>
  buildCustomerSummaries(customers.value, declarations.value),
);

const customerSummary = computed(() =>
  getCustomerSummaryById(customerSummaries.value, customerId.value),
);

const periodRows = computed(() => {
  if (!customerSummary.value) {
    return [];
  }

  return customerSummary.value.periodCounts.map((period) => ({
    periodName: period.periodName,
    declarationCount: period.count,
    completedCount: period.completedCount ?? 0,
    completionSummary: `${period.completedCount ?? 0}/${period.count ?? 0}`,
  }));
});

const fallbackCustomer = computed(() =>
  customers.value.find(
    (customer) => String(customer.id) === String(customerId.value ?? ""),
  ) ?? null,
);

const pageTitle = computed(
  () => customerSummary.value?.customerTitle ?? fallbackCustomer.value?.title ?? "Müşteri bulunamadı",
);

const columns = [
  { key: "periodName", label: "Dönem" },
  { key: "completionSummary", label: "Tamamlanan / Toplam" },
  { key: "declarationCount", label: "Beyan Sayısı" },
  { key: "actions", label: "İşlemler", sortable: false },
];

const refresh = async () => {
  try {
    await Promise.all([
      customerStore.fetchCustomers(),
      declarationStore.fetchDeclarations(),
      declarationStore.fetchDeclarationTypes(),
    ]);
  } catch (err) {
    console.error("Veri yenilenemedi", err);
  }
};

const goBack = () => {
  navigateTo("/declarations");
};

const handleSelectPeriod = (periodName) => {
  if (!periodName || !customerId.value) {
    return;
  }

  navigateTo(
    `/declarations/by-customer/${customerId.value}/by-period/${encodeURIComponent(periodName)}`,
  );
};

const openNextPeriodModal = () => {
  if (!canGenerateNextPeriod.value) {
    toast.error({
      title: "Beyanname",
      message: "Kopyalanacak dönem bulunamadı.",
    });
    return;
  }

  showNextPeriodModal.value = true;
};

const handleNextPeriodConfirm = async (items) => {
  if (!customerId.value || !nextPeriodName.value) {
    return;
  }

  try {
    const payloadItems = items.map((item) => ({
      customerId: item.customerId ?? customerId.value,
      periodName: item.periodName ?? nextPeriodName.value,
      typeId: item.typeId,
      dueDate: item.dueDate,
    }));

    await declarationStore.createNextPeriodDeclarations({
      items: payloadItems,
    });

    toast.success({
      title: "Beyanname",
      message: "Sonraki dönem başarıyla oluşturuldu.",
    });

    showNextPeriodModal.value = false;
    await refresh();
  } catch (error) {
    console.error("Sonraki dönem oluşturulamadı", error);
    toast.error({
      title: "Beyanname",
      message: "Sonraki dönem oluşturulamadı.",
    });
  }
};

const completionBadgeClass = (row) => {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  const total = Number(row?.declarationCount ?? 0);
  const completed = Number(row?.completedCount ?? 0);

  if (!total) {
    return `${base} border-slate-200 bg-slate-50 text-slate-500`;
  }

  if (completed >= total) {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }

  if (completed > 0) {
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  }

  return `${base} border-slate-200 bg-slate-50 text-slate-500`;
};

const resolveRowHighlight = (row) => {
  const total = Number(row?.declarationCount ?? 0);
  const completed = Number(row?.completedCount ?? 0);

  if (total > 0 && completed >= total) {
    return "bg-emerald-50/80 hover:bg-emerald-100";
  }

  return "";
};
</script>
