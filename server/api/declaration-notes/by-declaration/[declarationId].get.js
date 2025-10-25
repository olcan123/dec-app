import { getRouterParam } from "h3";
import { listNotesByDeclarationId } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  const declarationId = getRouterParam(event, "declarationId");
  if (!declarationId) {
    return { data: null, message: "Declaration id required", success: false, error: "MISSING_ID" };
  }

  try {
    const notes = await listNotesByDeclarationId(declarationId);
    return { data: notes, message: "Notes fetched", success: true, error: null };
  } catch (error) {
    return { data: null, message: "Failed to fetch notes", success: false, error };
  }
});
