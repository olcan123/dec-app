import { readBody, createError } from "h3";
import { createNextPeriodDeclarations } from "~~/server/service/declaration.service";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { customerId, periodName, items } = body ?? {};

    if (!Array.isArray(items) || !items.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing declaration items.",
      });
    }

    const hasInvalidItem = items.some((item) => {
      const targetCustomerId = item?.customerId ?? customerId;
      const targetPeriodName = item?.periodName ?? periodName;

      return (
        !targetCustomerId ||
        !targetPeriodName ||
        !item?.typeId ||
        !item?.dueDate
      );
    });

    if (hasInvalidItem) {
      throw createError({
        statusCode: 400,
        statusMessage: "Each declaration item requires customer, period, type, and due date.",
      });
    }

    const created = await createNextPeriodDeclarations({
      customerId,
      periodName,
      items,
    });

    return {
      data: created,
      success: true,
      message: "Next period declarations created successfully",
      error: null,
    };
  } catch (error) {
    console.error("clone-next-period error", error);
    return {
      data: null,
      success: false,
      message: "Failed to create next period declarations",
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
