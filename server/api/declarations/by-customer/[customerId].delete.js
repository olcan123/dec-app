import { getRouterParam } from "h3";
import { deleteDeclarationsByCustomerId } from "~~/server/service/declaration.service";

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, "customerId");

  if (!customerId) {
    return {
      data: null,
      message: "Customer id is required",
      success: false,
      error: "MISSING_CUSTOMER_ID",
    };
  }

  try {
    const result = await deleteDeclarationsByCustomerId(customerId);

    return {
      data: { count: result.count },
      message: `${result.count} declarations deleted for customer ${customerId}`,
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("delete-by-customer error", error);
    return {
      data: null,
      message: "Failed to delete declarations for customer",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
