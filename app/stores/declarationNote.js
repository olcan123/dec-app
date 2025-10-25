import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";

export const useDeclarationNoteStore = defineStore("DeclarationNote", () => {
  const notes = ref([]);
  const note = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchNotes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch("/api/declaration-notes");
      notes.value = Array.isArray(res?.data) ? res.data : [];
      return notes.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchNotesByDeclarationId = async (declarationId) => {
    if (!declarationId) throw new Error("declarationId is required");
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch(`/api/declaration-notes/by-declaration/${encodeURIComponent(declarationId)}`);
      // replace notes with the returned list for that declaration
      notes.value = Array.isArray(res?.data) ? res.data : [];
      return notes.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchNoteById = async (id) => {
    if (!id) throw new Error("note id is required");
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch(`/api/declaration-notes/${encodeURIComponent(id)}`);
      note.value = res?.data ?? null;
      return note.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createNote = async (payload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch(`/api/declaration-notes/create`, {
        method: "POST",
        body: payload,
      });
      const created = res?.data ?? null;
      if (created) {
        notes.value = [...notes.value, created];
      }
      return created;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateNote = async (id, payload) => {
    if (!id) throw new Error("note id is required");
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch(`/api/declaration-notes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: payload,
      });
      const updated = res?.data ?? null;
      if (updated) {
        notes.value = [
          ...notes.value.filter((n) => String(n.id) !== String(updated.id)),
          updated,
        ];
        if (note.value && String(note.value.id) === String(updated.id)) note.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteNote = async (id) => {
    if (!id) throw new Error("note id is required");
    loading.value = true;
    error.value = null;
    const previous = [...notes.value];
    try {
      notes.value = notes.value.filter((n) => String(n.id) !== String(id));
      const res = await $fetch(`/api/declaration-notes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res && res.success === false) {
        notes.value = previous;
        throw new Error(res.message || "Failed to delete note");
      }
      return res?.data ?? null;
    } catch (err) {
      notes.value = previous;
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteNotesByDeclarationId = async (declarationId) => {
    if (!declarationId) throw new Error("declarationId is required");
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch(`/api/declaration-notes/by-declaration/${encodeURIComponent(declarationId)}`, {
        method: "DELETE",
      });
      return res?.data ?? null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    notes,
    note,
    loading,
    error,
    fetchNotes,
    fetchNotesByDeclarationId,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    deleteNotesByDeclarationId,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeclarationNoteStore, import.meta.hot));
}
