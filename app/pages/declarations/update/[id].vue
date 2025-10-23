<template>
  <form>
    <PagesHeader
      title="Beyannameyi Düzenle"
      action-label="Beyannameyi Güncelle"
      @action="onSubmit"
    />

    <div class="max-w-5xl space-y-6 p-6">
      <div class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <SelectInput
            field-label="Müşteri"
            input-id="customerId"
            placeholder-text="Müşteri seçiniz"
            :options="customerOptions"
          />

          <SelectInput
            field-label="Beyanname Türü"
            input-id="typeId"
            placeholder-text="Beyanname türü seçiniz"
            :options="declarationTypeOptions"
          />
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <TextInput
            field-label="Dönem"
            placeholder-text="MM/YYYY formatında dönem"
            input-id="periodName"
          />

          <DateInput field-label="Son Tarih" input-id="dueDate" />
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <NumberInput
            field-label="Toplam Tutar"
            placeholder-text="Toplam tutar"
            input-id="totalAmount"
            :step="0.01"
          />
          <NumberInput
            field-label="Ödenen Tutar"
            placeholder-text="Ödenen tutar"
            input-id="paidAmount"
            :step="0.01"
          />
          <NumberInput
            field-label="Gecikme Cezası"
            placeholder-text="Gecikme cezası"
            input-id="lateFee"
            :step="0.01"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <SelectInput
            field-label="Durum"
            input-id="status"
            placeholder-text="Durum seçiniz"
            :options="statusOptions"
          />

          <SelectInput
            field-label="Öncelik"
            input-id="priority"
            placeholder-text="Öncelik seçiniz"
            :options="priorityOptions"
          />
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import PagesHeader from "~/components/pages/header/index.vue";
import SelectInput from "~/components/forms/SelectInput.vue";
import TextInput from "~/components/forms/TextInput.vue";
import NumberInput from "~/components/forms/NumberInput.vue";
import DateInput from "~/components/forms/DateInput.vue";
import { useDeclarationStore } from "~/stores/declaration";
import { useDeclarationFormOptions } from "~/composables/useDeclarationFormOptions";
import {
  declarationFormInitialValues,
  declarationFormSchema,
  statusOptions,
  priorityOptions,
} from "~/utils/declarations/form";
import { mapFormValuesToDeclarationPayload } from "~/utils/declarations/payload";

const toast = useToast();
const route = useRoute();

const declarationStore = useDeclarationStore();

const { declaration } = storeToRefs(declarationStore);
const { customerOptions, declarationTypeOptions, loadFormDependencies } =
  useDeclarationFormOptions();

const rawDeclarationId = computed(() => route.params.id);
const declarationId = computed(() => {
  const value = rawDeclarationId.value;
  return Array.isArray(value) ? value[0] : value;
});

const loadFormData = async () => {
  if (!declarationId.value) {
    toast.error({
      title: "Beyanname",
      message: "Geçersiz beyan ID'si.",
    });
    navigateTo("/declarations");
    return;
  }

  try {
    await Promise.all([
      loadFormDependencies(),
      declarationStore.fetchDeclarationById(declarationId.value),
    ]);
  } catch (err) {
    console.error("Form verileri yüklenemedi", err);
  }
};

await loadFormData();

if (!declaration.value) {
  toast.error({
    title: "Beyanname",
    message: "Beyan bulunamadı.",
  });
  navigateTo("/declarations");
}

const { handleSubmit, setValues } = useForm({
  validationSchema: toTypedSchema(declarationFormSchema),
  initialValues: declarationFormInitialValues,
});

watchEffect(() => {
  if (!declaration.value) {
    return;
  }

  setValues(declaration.value);
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = mapFormValuesToDeclarationPayload(values);
    const updated = await declarationStore.updateDeclaration(
      declarationId.value,
      payload
    );

    toast.success({
      title: "Beyanname",
      message: "Başarıyla güncellendi.",
    });

    const customerId = updated?.customerId ?? payload.customerId;
    const periodName = updated?.periodName ?? payload.periodName;

    if (customerId && periodName) {
      const encodedPeriod = encodeURIComponent(String(periodName));
      navigateTo(
        `/declarations/by-customer/${customerId}/by-period/${encodedPeriod}`
      );
    }
  } catch (error) {
    console.error("Beyanname güncellenemedi", error);
    toast.error({
      title: "Beyanname",
      message: "Güncellenirken bir hata oluştu.",
    });
  }
});
</script>

<style></style>
