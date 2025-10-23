import { getRouterParam } from 'h3';
import { deleteDeclarationsByPeriodName } from '~~/server/service/declaration.service';

export default defineEventHandler(async (event) => {
  const periodName = getRouterParam(event, 'periodName');

  if (!periodName) {
    return {
      data: null,
      message: 'Period name is required',
      success: false,
      error: 'MISSING_PERIOD_NAME',
    };
  }

  try {
    // route param may be encoded (eg. 11%2F2025) — decode it to match stored values
    const decoded = typeof periodName === 'string' ? decodeURIComponent(periodName) : periodName;
    console.debug('[delete-by-period] received periodName=', periodName, 'decoded=', decoded);

    const result = await deleteDeclarationsByPeriodName(decoded);

    return {
      data: { count: result.count },
      message: `${result.count} declarations deleted for period ${periodName}`,
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('delete-by-period error', error);
    return {
      data: null,
      message: 'Failed to delete declarations for period',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
