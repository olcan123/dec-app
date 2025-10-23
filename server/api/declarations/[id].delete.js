import { getRouterParam } from "h3";
import { deleteDeclaration } from "~~/server/service/declaration.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    return {
      data: null,
      message: "Declaration id is required",
      success: false,
      error: "MISSING_ID",
    };
  }

  try {
    await deleteDeclaration(id);

    return {
      data: null,
      message: "Declaration deleted successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to delete declaration",
      success: false,
      error,
    };
  }
});
