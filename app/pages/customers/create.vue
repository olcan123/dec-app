<template>
  <form>
    <PagesHeader
      title="Yeni Müşteri Oluştur"
      action-label="Müşteri Oluştur"
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

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(customerFormSchema),
  initialValues: customerFormInitialValues,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await customerStore.createCustomer(values);
    // Optionally, you can add a success message or redirect here
    toast.success({
      title: "Müşteri",
      message: "Başarıyla oluşturuldu.",
    });
  } catch (error) {
    console.error("Şirket oluşturulamadı", error);
    toast.error({
      title: "Müşteri",
      message: "Oluşturulurken bir hata oluştu.",
    });
  }
});
</script>

<style></style>
