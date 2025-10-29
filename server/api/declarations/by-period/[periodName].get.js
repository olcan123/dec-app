import { getRouterParam, getQuery } from "h3";
import { listDeclarationsByPeriodName } from "~~/server/service/declaration.service";

export default defineEventHandler(async (event) => {
  // Try several ways to obtain the period name because it may contain '/' which
  // can break path-segment routing. Prefer query param when possible.
  let periodName = getRouterParam(event, "periodName");
  const q = getQuery(event);
  if (!periodName && q) {
    periodName = q.periodName || q.period || null;
  }

  // Fallback: try to parse raw request URL (covers cases where the path was
  // encoded/decoded unexpectedly). We extract everything after the by-period path.
  if (!periodName) {
    try {
      const reqUrl = event.node?.req?.url || "";
      const m = reqUrl.match(/\/api\/declarations\/by-period\/(.+)$/);
      if (m && m[1]) {
        periodName = decodeURIComponent(m[1]);
      }
    } catch (e) {
      // ignore
    }
  }

  try {
    if (!periodName) {
      return {
        data: null,
        message: "Period name is required",
        success: false,
        error: "Missing periodName parameter",
      };
    }

    console.debug("[api] list by period requested for:", periodName);

    const declarations = await listDeclarationsByPeriodName(periodName);

    console.debug("[api] listDeclarationsByPeriodName returned count:", Array.isArray(declarations) ? declarations.length : 0);

    return {
      data: declarations,
      message: "Declarations fetched successfully",
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("[api] list by period error:", error);
    return {
      data: null,
      message: "Failed to fetch declarations by period",
      success: false,
      error,
    };
  }
});
