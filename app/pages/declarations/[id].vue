<template>
  <section class="space-y-6 p-6">
    <PagesHeader
      :title="pageTitle"
      :description="declaration ? 'Beyan detaylarını görüntüleyin' : 'Beyan yükleniyor...'"
      action-label="Geri"
      @action="() => navigateTo('/declarations')"
    />

    <div v-if="loadingValue" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
      Yükleniyor...
    </div>
    <div v-else-if="errorValue" class="rounded-2xl border border-rose-200 bg-white/80 p-6 text-sm text-rose-600">
      Hata: {{ errorValue }}
    </div>
    <div v-else-if="!declaration" class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
      Beyan bulunamadı.
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-base font-semibold leading-6 text-slate-800 mb-4">Genel Bilgiler</h3>
          <div class="space-y-2 border-t border-slate-200 pt-4">
            <div class="flex justify-between items-center py-2 border-b border-slate-100">
              <dt class="text-sm font-medium text-slate-500">ID</dt>
              <dd class="text-sm text-slate-900 font-medium">{{ declaration.id }}</dd>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Müşteri</dt>
              <dd class="text-sm text-slate-900 font-medium">{{ customerTitle || declaration.customerId }}</dd>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Tür</dt>
              <dd class="text-sm text-slate-900 font-medium">{{ typeName || declaration.typeId }}</dd>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Dönem</dt>
              <dd class="text-sm text-slate-900 font-medium">{{ declaration.periodName }}</dd>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Durum</dt>
              <dd class="text-sm text-slate-900 font-medium">{{ declaration.status }}</dd>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Öncelik</dt>
              <dd class="text-sm text-slate-900 font-medium">{{ declaration.priority }}</dd>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           <h3 class="text-base font-semibold leading-6 text-slate-800 mb-4">Finans & Tarihler</h3>
           <div class="space-y-2 border-t border-slate-200 pt-4">
             <div class="flex justify-between items-center py-2 border-b border-slate-100">
               <dt class="text-sm font-medium text-slate-500">Vade Tarihi</dt>
               <dd class="text-sm text-slate-900 font-medium">{{ formattedDueDate || '-' }}</dd>
             </div>
             <div class="flex justify-between items-center py-2 border-b border-slate-100">
               <dt class="text-sm font-medium text-slate-500">Tamamlanma Tarihi</dt>
               <dd class="text-sm text-slate-900 font-medium">{{ formattedCompletionDate || '-' }}</dd>
             </div>
             <div class="flex justify-between items-center py-2 border-b border-slate-100">
               <dt class="text-sm font-medium text-slate-500">Toplam Tutar</dt>
               <dd class="text-sm text-slate-900 font-medium">{{ formatCurrency(declaration.totalAmount) }}</dd>
             </div>
             <div class="flex justify-between items-center py-2 border-b border-slate-100">
               <dt class="text-sm font-medium text-slate-500">Ödenen Tutar</dt>
               <dd class="text-sm text-slate-900 font-medium">{{ formatCurrency(declaration.paidAmount) }}</dd>
             </div>
             <div class="flex justify-between items-center py-2 border-b border-slate-100">
               <dt class="text-sm font-medium text-slate-500">Gecikme Ücreti</dt>
               <dd class="text-sm text-slate-900 font-medium">{{ formatCurrency(declaration.lateFee) }}</dd>
             </div>
             <div class="flex justify-between items-center py-2 border-b border-slate-100">
               <dt class="text-sm font-medium text-slate-500">Tamamlayan</dt>
               <dd class="text-sm text-slate-900 font-medium">{{ declaration.completedBy || '-' }}</dd>
             </div>
           </div>
        </div>
      </div>

      <div class="mt-6">
         <h3 class="text-base font-semibold leading-6 text-slate-800 mb-4">Notlar</h3>
         <div v-if="notesLoading" class="rounded-lg border border-slate-200 bg-white/80 p-4 text-sm text-slate-500">Notlar yükleniyor...</div>
         <div v-else-if="notesError" class="rounded-lg border border-rose-200 bg-white/80 p-4 text-sm text-rose-600">Notlar yüklenemedi: {{ notesError }}</div>
         <div v-else>
           <div v-if="!notes.length" class="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Bu beyana ait not bulunamadı.</div>
           <ul v-else class="space-y-4">
             <li v-for="note in notes" :key="note.id" class="flex gap-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
               <div class="flex-shrink-0">
                 <div class="h-10 w-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold text-lg">
                   {{ note.createdBy ? String(note.createdBy).charAt(0).toUpperCase() : (note.title ? String(note.title).charAt(0).toUpperCase() : 'N') }}
                 </div>
               </div>
               <div class="flex-1 min-w-0">
                 <div class="flex items-start justify-between gap-3">
                   <div>
                     <div class="text-sm font-semibold text-slate-800 truncate">{{ note.title || `Not #${note.id}` }}</div>
                     <div v-if="note.createdBy" class="text-xs text-slate-500 mt-0.5">Oluşturan: {{ note.createdBy }}</div>
                   </div>
                   <div class="text-xs text-slate-400 whitespace-nowrap">{{ formatDate(note.createdAt) }}</div>
                 </div>
                 <div class="mt-2 text-sm text-slate-700 whitespace-pre-wrap break-words">{{ note.content }}</div>
                 <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                   <div class="flex flex-wrap gap-1.5">
                     <template v-if="note.tags">
                       <span v-for="tag in String(note.tags).split(',').filter(t => t.trim())" :key="tag.trim()" class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{{ tag.trim() }}</span>
                     </template>
                   </div>
                 </div>
               </div>
             </li>
           </ul>
         </div>
      </div>

    </div>
  </section>
</template>

<script setup>
// Script setup kısmı değişmedi, aynı kalabilir
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PagesHeader from '~/components/pages/header/index.vue';
import { useRoute, navigateTo, useFetch } from '#imports';
import { useDeclarationStore } from '~/stores/declaration';
import { useCustomerStore } from '~/stores/customer';
import { useDeclarationNoteStore } from '~/stores/declarationNote';

const route = useRoute();
const id = route.params.id ?? route.params.declarationId ?? null;

const declarationStore = useDeclarationStore();
const customerStore = useCustomerStore();
const noteStore = useDeclarationNoteStore();

const { declaration, loading, error } = storeToRefs(declarationStore);
const { customers } = storeToRefs(customerStore);
const { notes, loading: notesLoading, error: notesError } = storeToRefs(noteStore);

const pageLoading = ref(true);

onMounted(async () => {
  if (!id) {
    error.value = 'Geçersiz Beyan IDsi.';
    pageLoading.value = false;
    return;
  }
  pageLoading.value = true;
  try {
    await Promise.all([
      declarationStore.fetchDeclarationById(id),
      customerStore.fetchCustomers(),
      declarationStore.fetchDeclarationTypes(),
      noteStore.fetchNotesByDeclarationId(id)
    ]);
  } catch (e) {
    console.error("Data loading failed:", e);
  } finally {
    pageLoading.value = false;
  }
});

const loadingValue = computed(() => loading.value || pageLoading.value);
const errorValue = computed(() => error.value);
const declarationRef = declaration;

const customerTitle = computed(() => {
  if (!declarationRef.value?.customerId) return `ID: ${declarationRef.value?.customerId ?? '?'}`;
  const c = (customers.value || []).find((cu) => String(cu.id) === String(declarationRef.value.customerId));
  return c ? c.title : `ID: ${declarationRef.value.customerId}`;
});

const typeName = computed(() => {
  if (!declarationRef.value?.typeId) return `ID: ${declarationRef.value?.typeId ?? '?'}`;
  const types = declarationStore.declarationTypes || [];
  const t = (types || []).find((tt) => String(tt.id) === String(declarationRef.value.typeId));
  return t ? t.typeName : `ID: ${declarationRef.value.typeId}`;
});

const formatDateInternal = (dateString) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

const formattedDueDate = computed(() => formatDateInternal(declarationRef.value?.dueDate));
const formattedCompletionDate = computed(() => formatDateInternal(declarationRef.value?.completionDate));

const pageTitle = computed(() => {
  if (loadingValue.value) return 'Beyan Yükleniyor...';
  if (errorValue.value) return 'Hata';
  if (!declarationRef.value) return 'Beyan Bulunamadı';
  return `Beyan #${declarationRef.value.id} Detayı`;
});

const formatCurrency = (v) => {
  if (v === null || v === undefined || v === "") return '-';
  try {
    const numberValue = Number(v);
    if (isNaN(numberValue)) return String(v);
    return numberValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  } catch (e) {
    return String(v);
  }
};

const formatDate = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {
    return String(d);
  }
};
</script>

<style scoped>
/* Scoped stilleri buraya ekleyebilirsiniz */
dt {
  color: #475569; /* slate-600 */
}
dd {
 color: #1e293b; /* slate-800 */
}
</style>