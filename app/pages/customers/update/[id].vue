<template>
  <form>
    <PagesHeader
      title="Yeni Müşteri Düzenle"
      action-label="Müşteri Düzenle"
      @action="onSubmit"
    />

    <div class="max-w-2xl space-y-6 p-6">
      <TextInput
        field-label="Şirket Unvanı"
        placeholder-text="Örn: ABC Teknoloji A.Ş."
        input-id="title"
      />

      <TextInput
        field-label="UID Numarası"
        placeholder-text="Örn: 123456789"
        input-id="uidNumber"
      />

      <TextInput
        field-label="Yetkili Kişi"
        placeholder-text="Örn: Ahmet Yılmaz"
        input-id="authorizedPerson"
      />
      <TextInput
        field-label="Vergi Dairesi"
        placeholder-text="Örn: İstanbul Vergi Dairesi"
        input-id="taxOffice"
      />

      <TextAreaInput
        input-id="notes"
        field-label="Notlar"
        placeholder-text="İç referans veya ek açıklamalar"
      />

      <CheckboxInput
        input-id="isActive"
        field-label="Aktif Mükellef"
        description="Şirketi varsayılan olarak aktif listeye ekleyin."
      />
    </div>
  </form>
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useCustomerStore } from "~/stores/customer";
import PagesHeader from "~/components/pages/header/index.vue";
import TextInput from "~/components/forms/TextInput.vue";
import CheckboxInput from "~/components/forms/CheckboxInput.vue";
import TextAreaInput from "~/components/forms/TextAreaInput.vue";
import {
  customerFormInitialValues,
  customerFormSchema,
} from "~/utils/customers/form";

const toast = useToast();
const customerStore = useCustomerStore();
const { customer } = storeToRefs(customerStore);

const route = useRoute();
const customerId = computed(() => {
  const raw = route.params.id;
  return Array.isArray(raw) ? raw[0] : raw;
});

try {
  await customerStore.fetchCustomer(customerId.value);
} catch (loadError) {
  console.error("Müşteri yüklenemedi", loadError);
}

const { handleSubmit, setValues } = useForm({
  validationSchema: toTypedSchema(customerFormSchema),
  initialValues: customerFormInitialValues,
});

watchEffect(() => {
  if (!customer.value) {
    return;
  }

  setValues(customer.value);
});

const onSubmit = handleSubmit(async (values) => {
  delete values.id;
  if (!customerId.value) {
    return;
  }

  try {
    await customerStore.updateCustomer(customerId.value, values);
    toast.success({
      title: "Müşteri",
      message: "Başarıyla güncellendi.",
    });
  } catch (submitError) {
    console.error("Şirket güncellenemedi", submitError);
    toast.error({
      title: "Müşteri",
      message: "Güncellenirken bir hata oluştu.",
    });
  }
});
</script>

<style></style>
