<template>
  <section class="space-y-6 p-6">
    <PagesHeader title="Beyannameler">
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          :disabled="bulkActionDisabled"
          :class="{ 'cursor-not-allowed opacity-60': bulkActionDisabled }"
          @click="openBulkNextPeriodModal"
        >
          Toplu Sonraki Dönem
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
          :disabled="isLoading"
          :class="{ 'cursor-not-allowed opacity-60': isLoading }"
          @click="goToCreate"
        >
          Yeni Beyanname Oluştur
        </button>
      </template>
    </PagesHeader>

    <DataTable
      :columns="columns"
      :rows="customerSummaryRows"
      :loading="isLoading"
      :error-message="errorMessage"
      empty-state-message="Görüntülenecek beyanname özeti bulunamadı."
      search-placeholder="Müşteri ara"
      :search-fields="searchFields"
      initial-sort-field="customerTitle"
      :show-refresh="true"
      @refresh="refresh"
    >
      <template #cell-completionSummary="{ row }">
        <span :class="completionBadgeClass(row)">
          {{ row.completedPeriodCount }} / {{ row.periodCount }}
        </span>
      </template>
      <template #cell-periodCount="{ value }">
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
          @click="goToCustomerDetail(row.customerId)"
        >
          Detay
        </button>
      </template>
    </DataTable>
    <NextPeriodModal
      v-model="showBulkNextPeriodModal"
      :items="bulkModalItems"
      :next-period-name="bulkNextPeriodLabel"
      :loading="declarationsLoading"
      title="Toplu Sonraki Dönem Oluştur"
      :description="bulkModalDescription"
      @confirm="handleBulkNextPeriodConfirm"
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
import { buildCustomerSummaries } from "~/utils/declarations/summary";
import {
  findLatestPeriodName,
  formatNextPeriodName,
} from "~/utils/declarations/period";

const customerStore = useCustomerStore();
const declarationStore = useDeclarationStore();

const {
  customers,
  loading: customersLoading,
  error: customerError,
} = storeToRefs(customerStore);
const {
  declarations,
  declarationTypes,
  loading: declarationsLoading,
  error: declarationError,
} = storeToRefs(declarationStore);

const columns = [
  { key: "customerTitle", label: "Müşteri" },
  { key: "completionSummary", label: "Tamamlanan / Toplam Dönem" },
  { key: "periodCount", label: "Farklı Dönem Sayısı" },
  { key: "actions", label: "İşlemler", sortable: false },
];

const searchFields = ["customerTitle"];

const loadInitialData = async () => {
  try {
    await Promise.all([
      customerStore.fetchCustomers(),
      declarationStore.fetchDeclarations(),
      declarationStore.fetchDeclarationTypes(),
    ]);
  } catch (err) {
    console.error("Veri yüklenemedi", err);
  }
};

await loadInitialData();

const toast = useToast();

const showBulkNextPeriodModal = ref(false);
const bulkModalItems = ref([]);

const isLoading = computed(
  () => customersLoading.value || declarationsLoading.value
);

const errorMessage = computed(
  () => customerError.value || declarationError.value || ""
);

const customerSummaries = computed(() =>
  buildCustomerSummaries(customers.value, declarations.value)
);

const customerMap = computed(() => {
  const map = new Map();
  customers.value.forEach((customer) => {
    map.set(Number(customer.id), customer);
  });
  return map;
});

const typeNameMap = computed(() => {
  const map = new Map();
  declarationTypes.value.forEach((type) => {
    map.set(Number(type.id), type.typeName);
  });
  return map;
});

const customerSummaryRows = computed(() =>
  customerSummaries.value.map((item) => {
    const completedPeriodCount = item.periodCounts.filter((period) => {
      const total = Number(period?.count ?? 0);
      const completed = Number(period?.completedCount ?? 0);
      return total > 0 && completed >= total;
    }).length;

    return {
      customerId: item.customerId,
      customerTitle: item.customerTitle,
      periodCount: item.periodCount,
      completedPeriodCount,
      completionSummary: `${completedPeriodCount}/${item.periodCount}`,
    };
  })
);

const computeBulkNextPeriodItems = () => {
  const groupedByCustomer = new Map();

  declarations.value.forEach((declaration) => {
    const customerId = Number(declaration?.customerId ?? 0);
    if (!customerId) {
      return;
    }

    if (!groupedByCustomer.has(customerId)) {
      groupedByCustomer.set(customerId, []);
    }

    groupedByCustomer.get(customerId).push(declaration);
  });

  const allItems = [];

  groupedByCustomer.forEach((items, customerId) => {
    const periodSet = new Set(
      items
        .map((item) => item?.periodName)
        .filter((name) => typeof name === "string" && name.trim().length)
    );

    if (!periodSet.size) {
      return;
    }

    const latestPeriodName = findLatestPeriodName(Array.from(periodSet));
    if (!latestPeriodName) {
      return;
    }

    const nextPeriodName = formatNextPeriodName(latestPeriodName);
    if (!nextPeriodName) {
      return;
    }

    const hasNextPeriodDeclarations = items.some(
      (item) => String(item?.periodName ?? "") === nextPeriodName
    );

    if (hasNextPeriodDeclarations) {
      return;
    }

    const latestPeriodDeclarations = items.filter(
      (item) => String(item?.periodName ?? "") === latestPeriodName
    );

    if (!latestPeriodDeclarations.length) {
      return;
    }

    latestPeriodDeclarations.forEach((declaration, index) => {
      let dueDate = "";

      if (declaration?.dueDate) {
        const parsed = new Date(declaration.dueDate);
        if (!Number.isNaN(parsed.getTime())) {
          dueDate = parsed.toISOString().slice(0, 10);
        }
      }

      const typeId = Number(declaration?.typeId ?? 0) || declaration?.typeId;
      const typeName = typeNameMap.value.get(Number(typeId)) ?? `Tür #${typeId ?? "-"}`;
      const customerTitle = customerMap.value.get(customerId)?.title ?? `Müşteri #${customerId}`;

      allItems.push({
        key: `${customerId}-${declaration?.id ?? index}`,
        customerId,
        customerTitle,
        typeId,
        typeName,
        dueDate,
        periodName: nextPeriodName,
      });
    });
  });

  return allItems.sort((a, b) => {
    const titleCompare = String(a.customerTitle).localeCompare(
      String(b.customerTitle)
    );

    if (titleCompare !== 0) {
      return titleCompare;
    }

    return String(a.typeName).localeCompare(String(b.typeName));
  });
};

const bulkCandidateItems = computed(() => computeBulkNextPeriodItems());

const bulkActionDisabled = computed(
  () => isLoading.value || !bulkCandidateItems.value.length
);

const bulkModalDescription = computed(() => {
  if (!bulkModalItems.value.length) {
    return "Kopyalanacak beyan bulunamadı.";
  }

  const uniqueCustomers = new Set(
    bulkModalItems.value.map((item) => item.customerId)
  ).size;

  return `${uniqueCustomers} müşteri için ${bulkModalItems.value.length} beyanı kopyalayın ve son tarihleri güncelleyin.`;
});

const bulkNextPeriodLabel = computed(() => "");

const refresh = async () => {
  await loadInitialData();
};

const goToCreate = () => {
  navigateTo("/declarations/create");
};

const openBulkNextPeriodModal = () => {
  const items = bulkCandidateItems.value;

  if (!items.length) {
    toast.error({
      title: "Beyanname",
      message: "Kopyalanacak uygun dönem bulunamadı.",
    });
    return;
  }

  bulkModalItems.value = items.map((item) => ({ ...item }));
  showBulkNextPeriodModal.value = true;
};

const handleBulkNextPeriodConfirm = async (items) => {
  if (!items?.length) {
    return;
  }

  try {
    await declarationStore.createNextPeriodDeclarations({
      items: items.map((item) => ({
        customerId: item.customerId,
        periodName: item.periodName,
        typeId: item.typeId,
        dueDate: item.dueDate,
      })),
    });

    toast.success({
      title: "Beyanname",
      message: "Tüm müşteriler için sonraki dönemler oluşturuldu.",
    });

    showBulkNextPeriodModal.value = false;
    bulkModalItems.value = [];
    await refresh();
  } catch (error) {
    console.error("Toplu sonraki dönem oluşturulamadı", error);
    toast.error({
      title: "Beyanname",
      message: "Toplu sonraki dönem oluşturulamadı.",
    });
  }
};

const goToCustomerDetail = (customerId) => {
  if (!customerId) {
    return;
  }

  navigateTo(`/declarations/by-customer/${customerId}`);
};

const completionBadgeClass = (row) => {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  const totalPeriods = Number(row?.periodCount ?? 0);
  const completedPeriods = Number(row?.completedPeriodCount ?? 0);

  if (!totalPeriods) {
    return `${base} border-slate-200 bg-slate-50 text-slate-500`;
  }

  if (completedPeriods >= totalPeriods) {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }

  if (completedPeriods > 0) {
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  }

  return `${base} border-slate-200 bg-slate-50 text-slate-500`;
};
</script>
