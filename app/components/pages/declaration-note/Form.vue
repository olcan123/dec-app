<template>
  <div class="w-full">
    
    <div class="mb-4 flex justify-end">
      <button
        type="button"
        @click="addEmptyNote"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span>Yeni Not Ekle</span>
      </button>
    </div>

    <div class="rounded-lg bg-slate-50 p-4 md:p-6">
      <div class="space-y-4">
        
        <div
          v-for="(field, idx) in noteFields"
          :key="field.key"
          class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 ease-in-out"
        >
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Not {{ idx + 1 }}
            </h3>
            
            <button
              type="button"
              @click="remove(idx)"
              class="rounded-full px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
              aria-label="Remove note"
            >
              Sil
            </button>
          </div>

          <div class="flex flex-col gap-5 p-4 md:p-5">
            <TextInput
              :inputId="`notes[${idx}].title`"
              fieldLabel="Başlık"
              placeholderText="Not Başlığı"
            />

            <TextAreaInput
              :inputId="`notes[${idx}].content`"
              fieldLabel="İçerik"
              placeholderText="Notunuzu buraya yazın..."
              :rows="4"
            />

            <TextInput
              :inputId="`notes[${idx}].tags`"
              fieldLabel="Etiketler"
              placeholderText="Etiketler (virgülle ayrılmış)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFieldArray } from "vee-validate";
import { useDeclarationNoteStore } from "~/stores/declarationNote"; //
import TextAreaInput from "~/components/forms/TextAreaInput.vue"; //
import TextInput from "~/components/forms/TextInput.vue"; //

const declarationNoteStore = useDeclarationNoteStore(); //

// "notes" adıyla bir field array (alan dizisi) oluşturuluyor
const {
  fields: noteFields,
  push: pushNote,
  remove: removeNote,
} = useFieldArray("notes");



// Yeni boş not ekleme fonksiyonu
function addEmptyNote() {
  pushNote({ title: "", content: "", tags: "" });
}

// İlgili index'teki notu silme fonksiyonu
async function remove(idx) {
  // try to find an id on the field (supports both plain object and { value: { ... } } shape)
  const field = noteFields.value?.[idx];
  const id = field?.id ?? field?.value?.id ?? null;

  if (id) {
    try {
      // delete on server/store first
      await declarationNoteStore.deleteNote(id);
    } catch (err) {
      // if delete fails, log and still remove locally to avoid blocking UX
      console.error('Failed to delete note from server:', err);
    }
  }

  // remove the field from the form field array
  removeNote(idx);
}
</script>

<style scoped>
/* Scoped stiller buraya eklenebilir */
</style>