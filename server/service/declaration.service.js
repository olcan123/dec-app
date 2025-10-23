import prisma from "~~/server/utils/prisma";
import { normalizeDeclarationPayload } from "~~/server/utils/normalization";
import {
  formatDeclarationForForm,
  declarationFormDefaults,
} from "~~/server/utils/declaration-format";

const toNumericId = (value) => {
  if (value === null || value === undefined || value === "") {
    throw new Error("Declaration id is required");
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    throw new Error("Declaration id must be a number");
  }

  return numeric;
};

// ANCHOR: listDeclarations
export const listDeclarations = async () => {
  try {
    return await prisma.declaration.findMany({});
  } catch (error) {
    console.error("Error listing declarations:", error);
    throw new Error("Could not list declarations");
  }
};
// ANCHOR_END: listDeclarations

// ANCHOR: listDeclarationByCustomerId
export const listDeclarationByCustomerId = async (customerId) => {
  try {
    return await prisma.declaration.findMany({
      where: {
        customerId: toNumericId(customerId),
      },
    });
  } catch (error) {
    console.error("Error listing declarations by customer ID:", error);
    throw new Error("Could not list declarations");
  }
};
// ANCHOR_END: listDeclarationByCustomerId

// ANCHOR: getDeclarationById
export const getDeclarationById = async (declarationId) => {
  try {
    const declaration = await prisma.declaration.findUnique({
      where: { id: toNumericId(declarationId) },
    });

    if (!declaration) {
      return null;
    }

    return formatDeclarationForForm(declaration);
  } catch (error) {
    console.error("Error getting declaration by ID:", error);
    throw new Error("Could not get declaration");
  }
};
// ANCHOR_END: getDeclarationById

// ANCHOR: createDeclaration
export const createDeclaration = async (declarationData) => {
  try {
    const normalizedData = normalizeDeclarationPayload(declarationData);

    return await prisma.declaration.create({
      data: normalizedData,
    });
  } catch (error) {
    console.error("Error creating declaration:", error);
    throw new Error("Could not create declaration");
  }
};
// ANCHOR_END: createDeclaration

// ANCHOR: updateDeclaration
export const updateDeclaration = async (declarationId, declarationData) => {
  try {
    const normalizedData = normalizeDeclarationPayload(declarationData);

    return await prisma.declaration.update({
      where: { id: toNumericId(declarationId) },
      data: normalizedData,
    });
  } catch (error) {
    console.error("Error updating declaration:", error);
    throw new Error("Could not update declaration");
  }
};
// ANCHOR_END: updateDeclaration

// ANCHOR: deleteDeclaration
export const deleteDeclaration = async (declarationId) => {
  try {
    return await prisma.declaration.delete({
      where: { id: toNumericId(declarationId) },
    });
  } catch (error) {
    console.error("Error deleting declaration:", error);
    throw new Error("Could not delete declaration");
  }
};
// ANCHOR_END: deleteDeclaration

// ANCHOR: createNextPeriodDeclarations
export const createNextPeriodDeclarations = async ({
  customerId,
  periodName,
  items,
}) => {
  const declarationItems = Array.isArray(items) ? items : [];

  if (!declarationItems.length) {
    throw new Error("At least one declaration item is required");
  }

  try {
    const normalizedItems = declarationItems.map((item) => {
      const targetCustomerId = item?.customerId ?? customerId;
      const targetPeriodName = item?.periodName ?? periodName;

      if (!targetCustomerId) {
        throw new Error("Customer id is required for each declaration");
      }

      if (!targetPeriodName) {
        throw new Error("Target period is required for each declaration");
      }

      if (!item?.typeId) {
        throw new Error("Declaration type id is required");
      }

      if (!item?.dueDate) {
        throw new Error("Due date is required for each declaration");
      }

      const payload = {
        customerId: toNumericId(targetCustomerId),
        typeId: Number(item.typeId),
        periodName: targetPeriodName,
        dueDate: item.dueDate,
        reminderDays: declarationFormDefaults.reminderDays,
        totalAmount: declarationFormDefaults.totalAmount,
        paidAmount: declarationFormDefaults.paidAmount,
        lateFee: declarationFormDefaults.lateFee,
        status: declarationFormDefaults.status,
        priority: declarationFormDefaults.priority,
        completionDate: null,
        completedBy: declarationFormDefaults.completedBy ?? null,
      };

      return normalizeDeclarationPayload(payload);
    });

    const created = await prisma.$transaction(
      normalizedItems.map((data) =>
        prisma.declaration.create({
          data,
        })
      )
    );

    return created;
  } catch (error) {
    console.error("Error creating next period declarations:", error);
    throw new Error("Could not create next period declarations");
  }
};
// ANCHOR_END: createNextPeriodDeclarations
