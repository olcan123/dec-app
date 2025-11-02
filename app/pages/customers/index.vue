<template>
  <section class="space-y-6 p-6">
    <PagesHeader
      title="Müşteri Listesi"
      action-label="Yeni Müşteri Oluştur"
      @action="goToCreate"
    />

    <DataTable
      :columns="columns"
      :rows="customers"
      :loading="loading"
      :error-message="error"
      empty-state-message="Görüntülenecek şirket bulunamadı."
      search-placeholder="UID, unvan, yetkili veya vergi dairesi ara"
      :search-fields="searchFields"
      initial-sort-field="title"
      :show-refresh="true"
      @refresh="refresh"
    >
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

      <template #cell-notes="{ value }">
        <p class="max-w-xs truncate text-sm text-slate-500">
          {{ value || "-" }}
        </p>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-amber-200 px-3 py-1 text-xs font-medium text-amber-600 transition hover:border-amber-300 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
            @click="goToUpdate(row.id)"
          >
            Düzenle
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
            @click="removeCustomer(row.id)"
          >
            Sil
          </button>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useCustomerStore } from "~/stores/customer";
import PagesHeader from "~/components/pages/header/index.vue";
import DataTable from "~/components/table/index.vue";

const columns = [
  { key: "uidNumber", label: "UID Numarası" },
  { key: "title", label: "Şirket Unvanı" },
  { key: "authorizedPerson", label: "Yetkili Kişi" },
  { key: "taxOffice", label: "Vergi Dairesi" },
  { key: "isActive", label: "Durum" },
  { key: "notes", label: "Notlar" },
  { key: "actions", label: "İşlemler", sortable: false },
];

const searchFields = [
  "uidNumber",
  "title",
  "authorizedPerson",
  "taxOffice",
  "notes",
];

const { $successToast, $failToast } = useNuxtApp();
const customerStore = useCustomerStore();
const { customers, loading, error } = storeToRefs(customerStore);

const fetchCustomersSafely = async () => {
  try {
    await customerStore.fetchCustomers();
  } catch (err) {
    console.error("Müşteriler yüklenemedi", err);
  }
};

await fetchCustomersSafely();

const refresh = async () => {
  await fetchCustomersSafely();
};

const goToCreate = () => {
  navigateTo("/customers/create");
};

const removeCustomer = async (customerId) => {
  if (!customerId) {
    return;
  }

  const confirmed = window.confirm(
    "Müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
  );

  if (!confirmed) {
    return;
  }

  try {
    await customerStore.deleteCustomer(customerId);
    $successToast("Müşteri başarıyla silindi.");
  } catch (err) {
    console.error("Müşteri silinemedi", err);
    $failToast("Silinirken bir hata oluştu.");
  }
};

const goToUpdate = (customerId) => {
  if (!customerId) {
    return;
  }

  navigateTo(`/customers/update/${customerId}`);
};
</script>

<style></style>
