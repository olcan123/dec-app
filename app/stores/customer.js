import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";

export const useCustomerStore = defineStore("Customers", () => {
  // ANCHOR: State
  const customers = ref([]);
  const customer = ref(null);
  const loading = ref(false);
  const error = ref(null);
  // ANCHOR_END: State

  // ANCHOR: fetchCustomers
  const fetchCustomers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/customers");
      customers.value = Array.isArray(response?.data) ? response.data : [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: fetchCustomers

  // ANCHOR: fetchCustomer
  const fetchCustomer = async (customerId) => {
    if (!customerId) {
      customer.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/customers/${customerId}`);
      customer.value = response?.data ?? null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: fetchCustomer

  // ANCHOR: resetCustomer
  const resetCustomer = () => {
    customer.value = null;
    error.value = null;
  };
  // ANCHOR_END: resetCustomer

  // ANCHOR: createCustomer
  const createCustomer = async (payload) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/customers/create", {
        method: "POST",
        body: payload,
      });

      const created = response?.data ?? null;

      if (created) {
        customers.value = [...customers.value, created];
      }

      navigateTo("/customers");

    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: createCustomer

  // ANCHOR: updateCustomer
  const updateCustomer = async (customerId, payload) => {
    if (!customerId) {
      throw new Error("Customer id is required to update");
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        body: payload,
      });

      const updated = response?.data ?? null;

      if (updated) {
        customers.value = customers.value.map((item) =>
          item.id === updated.id ? updated : item
        );

        if (customer.value?.id === updated.id) {
          customer.value = updated;
        }
      }

      navigateTo("/customers");

    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: updateCustomer

  // ANCHOR: deleteCustomer
  const deleteCustomer = async (customerId) => {
    if (!customerId) {
      throw new Error("Customer id is required to delete");
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (response?.success !== false) {
        customers.value = customers.value.filter(
          (item) => Number(item.id) !== Number(customerId)
        );

        if (
          customer.value &&
          Number(customer.value.id) === Number(customerId)
        ) {
          customer.value = null;
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: deleteCustomer

  // ANCHOR: Expose store API
  return {
    customers,
    customer,
    loading,
    error,
    fetchCustomers,
    fetchCustomer,
    resetCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
  // ANCHOR_END: Expose store API
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomerStore, import.meta.hot));
}
