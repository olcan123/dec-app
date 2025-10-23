import { listDeclarations } from "~~/server/service/declaration.service"

export default defineEventHandler(async (event) => {
  try {
    const declarations = await listDeclarations()
    return {
      data: declarations,
      message: "Declarations fetched successfully",
      success: true,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch declarations",
      success: false,
      error,
    }
  }
})
