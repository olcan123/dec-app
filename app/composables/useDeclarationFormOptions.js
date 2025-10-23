import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCustomerStore } from "~/stores/customer";
import { useDeclarationStore } from "~/stores/declaration";

// Shared helper to prepare customer and declaration type dropdown data for declaration forms.
export const useDeclarationFormOptions = () => {
  const customerStore = useCustomerStore();
  const declarationStore = useDeclarationStore();

  const { customers } = storeToRefs(customerStore);
  const { declarationTypes } = storeToRefs(declarationStore);

  const loadFormDependencies = async () => {
    await Promise.all([
      customerStore.fetchCustomers(),
      declarationStore.fetchDeclarationTypes(),
    ]);
  };

  const customerOptions = computed(() =>
    customers.value.map((item) => ({
      label: item.title ? `${item.title} (${item.uidNumber})` : item.uidNumber,
      value: String(item.id ?? ""),
    }))
  );

  const declarationTypeOptions = computed(() =>
    declarationTypes.value.map((item) => ({
      label: item.typeName,
      value: String(item.id ?? ""),
    }))
  );

  return {
    customerOptions,
    declarationTypeOptions,
    loadFormDependencies,
  };
};
