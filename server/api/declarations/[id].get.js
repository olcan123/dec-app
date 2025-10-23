import { getRouterParam } from "h3";
import { getDeclarationById } from "~~/server/service/declaration.service";

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
    const declaration = await getDeclarationById(id);

    if (!declaration) {
      return {
        data: null,
        message: "Declaration not found",
        success: false,
        error: "NOT_FOUND",
      };
    }

    return {
      data: declaration,
      message: "Declaration fetched successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch declaration",
      success: false,
      error,
    };
  }
});
