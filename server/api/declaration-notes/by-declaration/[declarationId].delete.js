import { getRouterParam } from "h3";
import { deleteDeclarationNote } from "~~/server/service/declaration-note.service";

export default defineEventHandler(async (event) => {
  const declarationId = getRouterParam(event, 'declarationId');
  if (!declarationId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing declarationId' });
  }

  await deleteNotesByDeclarationId(declarationId);
  return { success: true };
})
