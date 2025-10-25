import prisma from "~~/server/utils/prisma";

const toNumericId = (value) => {
  if (value === null || value === undefined || value === "") {
    throw new Error("Id is required");
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    throw new Error("Id must be a number");
  }

  return numeric;
};

export const listDeclarationNotes = async () => {
  try {
    return await prisma.declarationNote.findMany({});
  } catch (error) {
    console.error("Error listing declaration notes:", error);
    throw new Error("Could not list declaration notes");
  }
};

export const listNotesByDeclarationId = async (declarationId) => {
  try {
    return await prisma.declarationNote.findMany({
      where: { declarationId: toNumericId(declarationId) },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error listing notes by declaration id:", error);
    throw new Error("Could not list declaration notes");
  }
};

export const getDeclarationNoteById = async (id) => {
  try {
    const note = await prisma.declarationNote.findUnique({ where: { id: toNumericId(id) } });
    return note || null;
  } catch (error) {
    console.error("Error getting declaration note:", error);
    throw new Error("Could not get declaration note");
  }
};

export const createDeclarationNote = async (data) => {
  try {
    if (!data || !data.declarationId) throw new Error('declarationId is required');
    if (!data.content) throw new Error('content is required');

    const payload = {
      declarationId: toNumericId(data.declarationId),
      title: data.title ?? null,
      content: data.content,
      createdBy: data.createdBy ?? null,
      tags: data.tags ?? null,
    };

    return await prisma.declarationNote.create({ data: payload });
  } catch (error) {
    console.error('Error creating declaration note:', error);
    throw new Error('Could not create declaration note');
  }
};

export const updateDeclarationNote = async (id, data) => {
  try {
    const numericId = toNumericId(id);
    const payload = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.createdBy !== undefined) payload.createdBy = data.createdBy;
    if (data.tags !== undefined) payload.tags = data.tags;

    // Prepare create payload: declarationId is required when creating a new note
    const createPayload = { id: numericId, ...payload };
    if (data.declarationId !== undefined && data.declarationId !== null) {
      createPayload.declarationId = toNumericId(data.declarationId);
    } else {
      throw new Error('declarationId is required to create a new declaration note via upsert');
    }

    // Use upsert: update if exists, otherwise create with the provided id and payload
    return await prisma.declarationNote.upsert({
      where: { id: numericId },
      update: payload,
      create: createPayload,
    });
  } catch (error) {
    console.error('Error updating declaration note:', error);
    throw new Error('Could not update declaration note');
  }
};

export const deleteDeclarationNote = async (id) => {
  try {
    return await prisma.declarationNote.delete({ where: { id: toNumericId(id) } });
  } catch (error) {
    console.error('Error deleting declaration note:', error);
    throw new Error('Could not delete declaration note');
  }
};

export const deleteNotesByDeclarationId = async (declarationId) => {
  try {
    return await prisma.declarationNote.deleteMany({
      where: { declarationId: toNumericId(declarationId) },
    });
  } catch (error) {
    console.error('Error deleting notes by declaration id:', error);
    throw new Error('Could not delete declaration notes');
  }
};
