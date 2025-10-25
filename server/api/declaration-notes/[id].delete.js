import { getRouterParam } from "h3";
import { deleteDeclarationNote } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return { data: null, message: "Note id required", success: false, error: "MISSING_ID" };
  }

  try {
    const deleted = await deleteDeclarationNote(id);
    return { data: deleted, message: "Note deleted", success: true, error: null };
  } catch (error) {
    return { data: null, message: "Failed to delete note", success: false, error };
  }
});
