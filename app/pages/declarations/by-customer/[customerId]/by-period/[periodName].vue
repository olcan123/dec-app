<template>
  <section class="space-y-6 p-6">
    <PagesHeader
      :title="pageTitle"
      :description="pageDescription"
      action-label="Dönemlere Dön"
      @action="goBack"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:border-rose-300 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
          :disabled="!periodName || loading.value"
          @click="confirmAndDeletePeriod"
        >
          Dönemi Sil
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 ml-2"
          :disabled="loading.value"
          @click="() => navigateTo('/declarations/create')"
        >
          Yeni Beyanname Oluştur
        </button>
      </template>
    </PagesHeader>

    <DataTable
      :columns="columns"
      :rows="declarationRows"
      empty-state-message="Bu dönem için beyan bulunamadı."
      search-placeholder="Durum, öncelik veya ID ara"
      :search-fields="searchFields"
      initial-sort-field="dueDate"
      :show-refresh="true"
      :row-class="resolveRowHighlight"
      @refresh="refresh"
    >
      <template #cell-totalAmount="{ value }">
        {{ value }}
      </template>
      <template #cell-paidAmount="{ value }">
        {{ value }}
      </template>
      <template #cell-lateFee="{ value }">
        {{ value }}
      </template>
      <template #cell-status="{ value }">
        <span :class="statusBadgeClass(value)">
          {{ statusLabel(value) }}
        </span>
      </template>
      <template #cell-priority="{ value }">
        <span :class="priorityBadgeClass(value)">
          {{ priorityLabel(value) }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            @click="goToDeclarationDetail(row.id)"
          >
            Detay
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-amber-600 transition hover:border-amber-300 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
            @click="goToDeclarationUpdate(row.id)"
          >
            Düzenle
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
            @click="handleDeleteDeclaration(row.id)"
          >
            Sil
          </button>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import PagesHeader from "~/components/pages/header/index.vue";
import DataTable from "~/components/table/index.vue";
import { useCustomerStore } from "~/stores/customer";
import { useDeclarationStore } from "~/stores/declaration";
import { statusOptions, priorityOptions } from "~/utils/declarations/form";

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const toast = useToast();

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

const customerId = computed(() => route.params.customerId ?? null);
const periodParam = computed(() => route.params.periodName ?? "");
const periodName = computed(() =>
  periodParam.value ? decodeURIComponent(String(periodParam.value)) : "",
);

const customerName = computed(() => {
  const customer = customers.value.find(
    (item) => String(item.id) === String(customerId.value ?? ""),
  );
  return customer?.title ?? `Müşteri #${customerId.value}`;
});

const typeMap = computed(() => {
  const map = new Map();
  declarationTypes.value.forEach((type) => {
    map.set(Number(type.id), type.typeName);
  });
  return map;
});

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("tr-TR");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(numeric);
};

const declarationsForPeriod = computed(() =>
  declarations.value.filter((declaration) => {
    const sameCustomer =
      String(declaration.customerId ?? "") === String(customerId.value ?? "");
    const samePeriod = String(declaration.periodName ?? "") === periodName.value;
    return sameCustomer && samePeriod;
  }),
);

const declarationRows = computed(() =>
  declarationsForPeriod.value.map((item) => ({
    id: item.id,
    typeName: typeMap.value.get(Number(item.typeId)) ?? `Tür #${item.typeId ?? "-"}`,
    dueDate: formatDate(item.dueDate),
    completionDate: formatDate(item.completionDate),
    status: item.status ?? "",
    priority: item.priority ?? "",
    totalAmount: formatCurrency(item.totalAmount),
    paidAmount: formatCurrency(item.paidAmount),
    lateFee: formatCurrency(item.lateFee),
    // reminderDays: item.reminderDays ?? "-",
  })),
);

const columns = [
  { key: "id", label: "ID" },
  { key: "typeName", label: "Beyan Türü" },
  { key: "dueDate", label: "Son Tarih" },
  { key: "completionDate", label: "Tamamlanma Tarihi" },
  { key: "status", label: "Durum" },
  { key: "priority", label: "Öncelik" },
  { key: "totalAmount", label: "Toplam Tutar" },
  { key: "paidAmount", label: "Ödenen Tutar" },
  { key: "lateFee", label: "Gecikme Cezası" },
  // { key: "reminderDays", label: "Hatırlatma (Gün)" },
  { key: "actions", label: "İşlemler", sortable: false },
];

const searchFields = ["id", "status", "priority", "typeName"];

const pageTitle = computed(
  () => `${customerName.value} • ${periodName.value || "-"}`,
);

const pageDescription = computed(
  () => `Bu sayfada ${periodName.value || "belirtilmemiş"} dönemine ait beyanlar listelenir`,
);

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
  navigateTo(`/declarations/by-customer/${customerId.value}`);
};

const goToDeclarationDetail = (declarationId) => {
  if (!declarationId) {
    return;
  }

  navigateTo(`/declarations/${declarationId}`);
};

const goToDeclarationUpdate = (declarationId) => {
  if (!declarationId) {
    return;
  }

  navigateTo(`/declarations/update/${declarationId}`);
};

const handleDeleteDeclaration = async (declarationId) => {
  if (!declarationId) {
    return;
  }

  const confirmed = window.confirm("Bu beyanı silmek istediğinize emin misiniz?");
  if (!confirmed) {
    return;
  }

  try {
    await declarationStore.deleteDeclaration(declarationId);
    toast.success({
      title: "Beyanname",
      message: "Başarıyla silindi.",
    });
  } catch (error) {
    console.error("Beyan silinemedi", error);
    toast.error({
      title: "Beyanname",
      message: "Silinirken bir hata oluştu.",
    });
  }
};

const statusLabelMap = new Map(
  statusOptions.map((option) => [option.value, option.label])
);
const priorityLabelMap = new Map(
  priorityOptions.map((option) => [option.value, option.label])
);

const statusLabel = (value) => {
  if (!value) {
    return "-";
  }

  return statusLabelMap.get(value) ?? value;
};

const priorityLabel = (value) => {
  if (!value) {
    return "-";
  }

  return priorityLabelMap.get(value) ?? value;
};

const statusBadgeClass = (value) => {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  const palette = {
    Pending: "border-slate-200 bg-slate-50 text-slate-600",
    InProgress: "border-sky-200 bg-sky-50 text-sky-700",
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Overdue: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return `${base} ${palette[value] ?? "border-slate-200 bg-slate-50 text-slate-600"}`;
};

const priorityBadgeClass = (value) => {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  const palette = {
    Low: "border-slate-200 bg-slate-50 text-slate-600",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    High: "border-orange-200 bg-orange-50 text-orange-700",
    Urgent: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return `${base} ${palette[value] ?? "border-slate-200 bg-slate-50 text-slate-600"}`;
};

const resolveRowHighlight = (row) => {
  if (row?.status === "Completed") {
    return "bg-emerald-50/80 hover:bg-emerald-100";
  }

  return "";
};

const confirmAndDeletePeriod = async () => {
  if (!periodName.value) return;

  const confirmed = window.confirm(
    `"${periodName.value}" dönemine ait tüm beyanlar kalıcı olarak silinecek. Devam etmek istediğinize emin misiniz?`
  );

  if (!confirmed) return;

  try {
    await declarationStore.deleteDeclarationsByPeriodName(periodName.value);

    toast.success({
      title: 'Dönem Silindi',
      message: `${periodName.value} dönemine ait tüm beyanlar silindi.`,
    });

    // go back to customer period list
    goBack();
  } catch (err) {
    console.error('Dönem silinemedi', err);
    toast.error({
      title: 'Hata',
      message: 'Dönem silinirken bir hata oluştu. Lütfen tekrar deneyin.',
    });
  }
};
</script>
