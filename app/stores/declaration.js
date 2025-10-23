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

    loading.value = true;
    error.value = null;

    try {
      await $fetch(`/api/declarations/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      declarations.value = declarations.value.filter(
        (item) => String(item.id) !== String(id)
      );
    } catch (err) {
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
    updateDeclaration,
    deleteDeclaration,
  };
  // ANCHOR_END: Expose store API
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeclarationStore, import.meta.hot));
}
