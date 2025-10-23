import { getRouterParam } from "h3";
import { getCustomerById } from "~~/server/service/customer.service";

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
    const customer = await getCustomerById(id);

    console.log("Retrieved customer:", customer);


    if (!customer) {
      return {
        data: null,
        message: "Customer not found",
        success: false,
        error: "NOT_FOUND",
      };
    }

    return {
      data: customer,
      message: "Customer fetched successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch customer",
      success: false,
      error,
    };
  }
});
