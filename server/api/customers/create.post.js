import { createCustomer } from "~~/server/service/customer.service"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    const newCustomer = await createCustomer(body)
    return {
      data: newCustomer,
      message: "Customer created successfully",
      success: true,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      message: "Failed to create customer",
      success: false,
      error,
    }
  }
})
