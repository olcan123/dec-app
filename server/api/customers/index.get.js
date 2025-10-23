import { listCustomers } from "~~/server/service/customer.service";

export default defineEventHandler(async (event) => {
  try {
    const customers = await listCustomers();
    return {
      data: customers,
      message: "Customers fetched successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch customers",
      success: false,
      error,
    };
  }
});
