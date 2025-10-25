import { listDeclarationNotes } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  try {
    const notes = await listDeclarationNotes();
    return { data: notes, message: "Notes fetched", success: true, error: null };
  } catch (error) {
    return { data: null, message: "Failed to fetch notes", success: false, error };
  }
});
