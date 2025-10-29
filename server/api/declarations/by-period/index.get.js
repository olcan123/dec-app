import { getQuery } from 'h3';
import { listDeclarationsByPeriodName } from '~~/server/service/declaration.service';

export default defineEventHandler(async (event) => {
  const q = getQuery(event) || {};
  const periodName = q.periodName || q.period || null;

  if (!periodName) {
    return {
      data: null,
      message: 'Period name is required (use ?periodName=MM/YYYY)',
      success: false,
      error: 'Missing periodName parameter',
    };
  }

  try {
    console.debug('[api:index] list by period requested for (query):', periodName);
    const declarations = await listDeclarationsByPeriodName(periodName);
    console.debug('[api:index] returned count:', Array.isArray(declarations) ? declarations.length : 0);

    return {
      data: declarations,
      message: 'Declarations fetched successfully',
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('[api:index] list by period error:', error);
    return {
      data: null,
      message: 'Failed to fetch declarations by period',
      success: false,
      error,
    };
  }
});
