import prisma from "~~/server/utils/prisma";

// ANCHOR: listDeclarationTypes
export const listDeclarationTypes = async () => {
  try {
    return await prisma.declarationType.findMany({
      orderBy: { typeName: "asc" },
    });
  } catch (error) {
    throw new Error("Failed to fetch declaration types: " + error);
  }
};
// ANCHOR_END: listDeclarationTypes
