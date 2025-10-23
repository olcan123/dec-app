import { readBody } from "h3";
import { createDeclaration } from "~~/server/service/declaration.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const newDeclaration = await createDeclaration(body);
    return {
      data: newDeclaration,
      message: "Declaration created successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to create declaration",
      success: false,
      error,
    };
  }
})
