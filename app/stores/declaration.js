import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";

export const useDeclarationStore = defineStore("Declaration", () => {
  // ANCHOR: State
  const declarations = ref([]);
  const declarationTypes = ref([]);
  const declaration = ref(null);
  const loading = ref(false);
  const error = ref(null);
  // ANCHOR_END: State

  // ANCHOR: fetchDeclarationTypes
  const fetchDeclarationTypes = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/declaration-types");
      declarationTypes.value = Array.isArray(response?.data)
        ? response.data
        : [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: fetchDeclarationTypes

  // ANCHOR: fetchDeclarations
  const fetchDeclarations = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/declarations");
      declarations.value = Array.isArray(response?.data) ? response.data : [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: fetchDeclarations

  // ANCHOR: fetchDeclarationById
  const fetchDeclarationById = async (id) => {
    if (!id) {
      throw new Error("Declaration id is required");
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(
        `/api/declarations/${encodeURIComponent(id)}`
      );
      const declarationData = response?.data ?? null;
      declaration.value = declarationData;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: fetchDeclarationById

  // ANCHOR: createDeclaration
  const createDeclaration = async (declarationData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/declarations/create", {
        method: "POST",
        body: declarationData,
      });
      const created = response?.data ?? null;
      if (created) {
        declarations.value = [...declarations.value, created];
      }

      return created;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: createDeclaration

  // ANCHOR: createNextPeriodDeclarations
  const createNextPeriodDeclarations = async (payload) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/declarations/clone-next-period", {
        method: "POST",
        body: payload,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Sonraki dönem beyanları oluşturulamadı."
        );
      }

      const createdItems = Array.isArray(response?.data) ? response.data : [];

      if (createdItems.length) {
        declarations.value = [...declarations.value, ...createdItems];
      }

      return createdItems;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: createNextPeriodDeclarations

  // ANCHOR: updateDeclarationsDueDateByTypeAndPeriod
  const updateDeclarationsDueDateByTypeAndPeriod = async ({ periodName, typeId, dueDate }) => {
    if (!periodName) throw new Error("periodName is required");
    if (!typeId) throw new Error("typeId is required");
    if (!dueDate) throw new Error("dueDate is required");

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/declarations/update-due-date', {
        method: 'POST',
        body: { periodName, typeId, dueDate },
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Beyanların son tarihleri güncellenemedi.');
      }

      // return count updated if provided
      return response?.data ?? null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: updateDeclarationsDueDateByTypeAndPeriod

  // ANCHOR: deleteDeclarationsByCustomerId
  const deleteDeclarationsByCustomerId = async (customerId) => {
    if (!customerId) throw new Error('customerId is required');
    // optimistic update: remove matching declarations locally first
    loading.value = true;
    error.value = null;

    const previous = [...declarations.value];
    try {
      // apply optimistic mutation
      declarations.value = declarations.value.filter(
        (item) => String(item.customerId ?? '') !== String(customerId)
      );

      const response = await $fetch(`/api/declarations/by-customer/${encodeURIComponent(customerId)}`, {
        method: 'DELETE',
      });

      if (!response?.success) {
        // rollback
        declarations.value = previous;
        throw new Error(response?.message || 'Beyanlar silinemedi.');
      }

      return response?.data ?? null;
    } catch (err) {
      // rollback on error
      declarations.value = previous;
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: deleteDeclarationsByCustomerId

  // ANCHOR: deleteDeclarationsByPeriodName
  const deleteDeclarationsByPeriodName = async (periodName) => {
    if (!periodName) throw new Error('periodName is required');
    // optimistic update: remove matching declarations locally first
    loading.value = true;
    error.value = null;

    const previous = [...declarations.value];
    try {
      declarations.value = declarations.value.filter(
        (item) => String(item.periodName ?? '') !== String(periodName)
      );

      const response = await $fetch(`/api/declarations/by-period/${encodeURIComponent(periodName)}`, {
        method: 'DELETE',
      });

      if (!response?.success) {
        // rollback
        declarations.value = previous;
        throw new Error(response?.message || 'Beyanlar silinemedi.');
      }

      return response?.data ?? null;
    } catch (err) {
      // rollback on error
      declarations.value = previous;
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: deleteDeclarationsByPeriodName

  // ANCHOR: updateDeclaration
  const updateDeclaration = async (id, declarationData) => {
    if (!id) {
      throw new Error("Declaration id is required");
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(
        `/api/declarations/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: declarationData,
        }
      );
      const updated = response?.data ?? null;

      if (updated) {
        declarations.value = [
          ...declarations.value.filter(
            (item) => String(item.id) !== String(updated.id)
          ),
          updated,
        ];
      }

      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: updateDeclaration

  // ANCHOR: deleteDeclaration
  const deleteDeclaration = async (id) => {
    if (!id) {
      throw new Error("Declaration id is required");
    }
    // optimistic: remove locally then call API; rollback if fails
    loading.value = true;
    error.value = null;

    const previous = [...declarations.value];
    try {
      declarations.value = declarations.value.filter(
        (item) => String(item.id) !== String(id)
      );

      const response = await $fetch(`/api/declarations/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      // Some delete endpoints return no success flag; treat non-error response as ok
      if (response && response.success === false) {
        // rollback
        declarations.value = previous;
        throw new Error(response?.message || 'Beyan silinemedi.');
      }
    } catch (err) {
      declarations.value = previous;
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // ANCHOR_END: deleteDeclaration

  // ANCHOR: Expose store API
  return {
    declarationTypes,
    declarations,
    declaration,
    loading,
    error,
    fetchDeclarationTypes,
    fetchDeclarations,
    fetchDeclarationById,
    createDeclaration,
    createNextPeriodDeclarations,
    updateDeclarationsDueDateByTypeAndPeriod,
    deleteDeclarationsByCustomerId,
    deleteDeclarationsByPeriodName,
    updateDeclaration,
    deleteDeclaration,
  };
  // ANCHOR_END: Expose store API
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeclarationStore, import.meta.hot));
}
