import { readBody, getRouterParam } from "h3";
import { updateDeclarationNote } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    return { data: null, message: "Note id required", success: false, error: "MISSING_ID" };
  }

  try {
    const updated = await updateDeclarationNote(id, body);
    return { data: updated, message: "Note updated", success: true, error: null };
  } catch (error) {
    return { data: null, message: "Failed to update note", success: false, error };
  }
});
