import { deleteCustomer } from "~~/server/service/customer.service"
import { getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, "id");
  if (!customerId) {
    return;
  }

  try {
    await deleteCustomer(customerId);
  } catch (error) {
    console.error("Müşteri silinemedi", error);
  }
})
