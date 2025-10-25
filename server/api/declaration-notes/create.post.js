import { readBody } from "h3";
import { createDeclarationNote } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const note = await createDeclarationNote(body);
    return { data: note, message: "Note created", success: true, error: null };
  } catch (error) {
    return { data: null, message: "Failed to create note", success: false, error };
  }
});
