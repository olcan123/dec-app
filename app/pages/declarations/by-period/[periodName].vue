<template>
  <section class="space-y-6 p-6">
    <PagesHeader :title="`Beyannameler — Dönem: ${periodNameDisplay}`">
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          :disabled="isLoading"
          @click="refresh"
        >
          Yenile
        </button>
      </template>
    </PagesHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      :row-class="rowClass"
      :loading="isLoading"
      :error-message="errorMessage"
      empty-state-message="Bu dönem için beyanname bulunamadı."
      search-placeholder="Müşteri veya tür ara"
      :search-fields="searchFields"
      initial-sort-field="customerTitle"
      :show-refresh="true"
      @refresh="refresh"
    >
      <template #cell-dueDate="{ value }">
        <span>{{ value || '-' }}</span>
      </template>

      <!-- Customer title: highlight when all types completed -->
      <template v-slot:cell-customerTitle="{ row }">
        <span :class="{ 'text-emerald-700 font-semibold': declarationTypes && declarationTypes.length && declarationTypes.every(t => {
            const v = row['type_' + String(t.id)];
            return v === 'Completed' || v === 'MISSING';
          }) }">
          {{ row.customerTitle }}
        </span>
      </template>

      <!-- Dynamic per-type cell templates -> render badges (green for completed, red for missing) -->
      <template
        v-for="t in declarationTypes"
        :key="t.id"
        v-slot:[`cell-type_${t.id}`]
        ="{ value, row }"
      >
        <!-- Treat MISSING and Completed as green per request -->
        <span v-if="value === 'MISSING' || value === 'Completed'" class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {{ value === 'MISSING' ? 'Eksik' : 'Tamamlandı' }}
        </span>

        <span v-else-if="value === 'Pending'" class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Beklemede
        </span>

        <span v-else-if="value === 'InProgress'" class="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          Devam Ediyor
        </span>

        <span v-else-if="value === 'Overdue'" class="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
          Gecikmiş
        </span>

        <span v-else class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {{ value ?? '-' }}
        </span>
      </template>

      <template #cell-actions="{ row }">
        <button
          type="button"
          class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          @click="goToCustomerByPeriod(row.raw?.id ?? row.id)"
        >
          Detay
        </button>
      </template>
    </DataTable>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import PagesHeader from '~/components/pages/header/index.vue';
import DataTable from '~/components/table/index.vue';
import { useDeclarationStore } from '~/stores/declaration';
import { useCustomerStore } from '~/stores/customer';

const route = useRoute();
const periodNameParam = route.params.periodName || '';
const periodName = typeof periodNameParam === 'string' ? periodNameParam : String(periodNameParam);
const periodNameDisplay = decodeURIComponent(periodName);

const declarationStore = useDeclarationStore();
const customerStore = useCustomerStore();

const { declarations, declarationTypes, loading: declarationsLoading, error: declarationError } = storeToRefs(declarationStore);
const { customers, loading: customersLoading, error: customerError } = storeToRefs(customerStore);

// load data for this page
const load = async () => {
  try {
    // ensure we have customers and types
    await Promise.all([
      customerStore.fetchCustomers(),
      declarationStore.fetchDeclarationTypes(),
      declarationStore.fetchDeclarationsByPeriodName(periodNameDisplay),
    ]);
  } catch (err) {
    // individual stores already set error state; just log here
    console.error('Failed to load period declarations', err);
  }
};

await load();

const isLoading = computed(() => declarationsLoading.value || customersLoading.value);
const errorMessage = computed(() => customerError.value || declarationError.value || '');

const customerMap = computed(() => {
  const map = new Map();
  (customers.value || []).forEach((c) => map.set(Number(c.id), c));
  return map;
});

// dynamic columns based on declaration types: first column is customer, then one column per declaration type
const columns = computed(() => {
  const base = [{ key: 'customerTitle', label: 'Müşteri' }];
  const typeCols = (declarationTypes.value || []).map((t) => ({ key: `type_${t.id}`, label: t.typeName }));
  // optional actions column
  const actions = [{ key: 'actions', label: 'İşlemler', sortable: false }];
  return [...base, ...typeCols, ...actions];
});

const searchFields = ['customerTitle'];

// helper to extract/normalize status from a declaration row
const derefStatus = (d) => {
  if (!d) return null;
  if (typeof d.status === 'string' && d.status) return d.status;
  // fallback: if completionDate present, consider it completed
  if (d.completionDate) return 'Completed';
  return null;
};

// rows: one row per customer, each type_{id} cell shows 'Tamamlandı' if a declaration exists for that customer/type in this period
const rows = computed(() => {
  const types = declarationTypes.value || [];
  return (customers.value || []).map((c) => {
    const row = {
      id: `customer-${c.id}`,
      customerTitle: c.title || `Müşteri #${c.id}`,
    };

    types.forEach((t) => {
      const found = (declarations.value || []).find(
        (d) => String(d.customerId) === String(c.id) && String(d.typeId) === String(t.id)
      );
      // If found, store the declaration status (Pending, InProgress, Completed, Overdue, etc.)
      // If not found, mark as MISSING so we can style it the same as Completed per UI request
      row[`type_${t.id}`] = found ? (derefStatus(found) || 'Unknown') : 'MISSING';
    });

    // keep raw customer for actions
    row.raw = c;
    return row;
  });
});

const refresh = async () => {
  await load();
};

const goToDeclarationEdit = (id) => {
  if (!id) return;
  navigateTo(`/declarations/${encodeURIComponent(id)}`);
};

const goToCustomerByPeriod = (customerId) => {
  if (!customerId) return;
  const encodedCustomer = encodeURIComponent(String(customerId));
  const encodedPeriod = encodeURIComponent(periodName);
  navigateTo(`/declarations/by-customer/${encodedCustomer}/by-period/${encodedPeriod}`);
};

// rowClass function: if all type cells for the row are Completed or MISSING, mark the whole row green
const rowClass = (row) => {
  try {
    const types = declarationTypes?.value || [];
    if (!types.length) return '';
    const allDoneOrMissing = types.every((t) => {
      const v = row['type_' + String(t.id)];
      return v === 'Completed' || v === 'MISSING';
    });
    return allDoneOrMissing ? 'bg-emerald-50' : '';
  } catch (e) {
    return '';
  }
};
</script>

<style>

</style>