import { listDeclarationTypes } from "~~/server/service/declaration-type.service";

export default defineEventHandler(async () => {
  try {
    const declarationTypes = await listDeclarationTypes();
    return {
      data: declarationTypes,
      message: "Declaration types fetched successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch declaration types",
      success: false,
      error,
    };
  }
});
