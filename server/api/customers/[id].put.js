import { getRouterParam, readBody } from "h3";
import { updateCustomer } from "~~/server/service/customer.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    return {
      data: null,
      message: "Customer id is required",
      success: false,
      error: "MISSING_ID",
    };
  }

  try {
    const payload = await readBody(event);
    const updatedCustomer = await updateCustomer(id, payload);

    return {
      data: updatedCustomer,
      message: "Customer updated successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to update customer",
      success: false,
      error,
    };
  }
});
