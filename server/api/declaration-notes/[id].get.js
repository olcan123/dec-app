import { getRouterParam } from "h3";
import { getDeclarationNoteById } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return { data: null, message: "Note id required", success: false, error: "MISSING_ID" };
  }

  try {
    const note = await getDeclarationNoteById(id);
    if (!note) return { data: null, message: "Note not found", success: false, error: "NOT_FOUND" };
    return { data: note, message: "Note fetched", success: true, error: null };
  } catch (error) {
    return { data: null, message: "Failed to fetch note", success: false, error };
  }
});
