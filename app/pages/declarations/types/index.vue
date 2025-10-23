<template>
  <section class="space-y-6 p-6">
    <PagesHeader
      badge-label="Deklarasyon"
      title="Beyanname Türleri"
      description="Tanımlı beyanname türlerini görüntüleyin ve detaylarını inceleyin."
    />

    <DataTable
      :columns="columns"
      :rows="declarationTypes"
      :loading="loading"
      :error-message="error"
      empty-state-message="Görüntülenecek beyanname türü bulunamadı."
      search-placeholder="Tür adı, dönem veya öncelik ara"
      :search-fields="searchFields"
      initial-sort-field="typeName"
      :show-refresh="true"
      @refresh="refresh"
    >
      <template #cell-description="{ value }">
        <p class="max-w-lg truncate text-sm text-slate-500">
          {{ value || "-" }}
        </p>
      </template>

      <template #cell-isActive="{ value }">
        <span
          :class="[
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            value
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-slate-100 text-slate-500',
          ]"
        >
          {{ value ? "Aktif" : "Pasif" }}
        </span>
      </template>
    </DataTable>
  </section>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useDeclarationStore } from "~/stores/declaration";
import PagesHeader from "~/components/pages/header/index.vue";
import DataTable from "~/components/table/index.vue";

const declarationStore = useDeclarationStore();
const { declarationTypes, loading, error } = storeToRefs(declarationStore);

fetchDeclarationTypesSafely = async () => {
  try {
    await declarationStore.fetchDeclarationTypes();
  } catch (err) {
    console.error("Beyanname türleri yüklenemedi", err);
  }
};

await fetchDeclarationTypesSafely();

const columns = [
  { key: "typeName", label: "Tür Adı" },
  { key: "period", label: "Periyot" },
  { key: "defaultDay", label: "Varsayılan Gün" },
  { key: "priorityLevel", label: "Öncelik Seviyesi" },
  { key: "isActive", label: "Durum" },
  { key: "description", label: "Açıklama" },
];

const searchFields = ["typeName", "period", "priorityLevel", "description"];

const refresh = async () => {
  await fetchDeclarationTypesSafely();
};
</script>

<style></style>
