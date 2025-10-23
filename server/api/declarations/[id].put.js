import { getRouterParam, readBody } from "h3";
import { updateDeclaration } from "~~/server/service/declaration.service";

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
    const payload = await readBody(event);
    const updatedDeclaration = await updateDeclaration(id, payload);

    return {
      data: updatedDeclaration,
      message: "Declaration updated successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to update declaration",
      success: false,
      error,
    };
  }
});
