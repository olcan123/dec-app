/**
 * Declaration type and period validation utilities
 */

/**
 * Check if declaration type is quarterly based on name
 * @param {string} typeName - Declaration type name
 * @returns {boolean} True if quarterly type
 */
export const isQuarterlyTypeName = (typeName) => {
  if (!typeName) return false;
  const upperName = String(typeName).toUpperCase();
  const tokens = upperName.split(/[^A-Z0-9]+/).filter(Boolean);
  return tokens.some(
    (tok) =>
      ["QL", "IL", "IS", "QS", "QUARTER"].includes(tok) || /^Q[1-4]$/.test(tok)
  );
};

/**
 * Check if declaration type is annual (CD/PD)
 * @param {string} typeName - Declaration type name
 * @returns {boolean} True if annual type
 */
export const isAnnualTypeName = (typeName) => {
  if (!typeName) return false;
  const upperName = String(typeName).toUpperCase();
  return upperName.includes("CD") || upperName.includes("PD");
};

/**
 * Find declaration types by keywords
 * @param {Array<Object>} declarationTypes - Array of declaration types
 * @param {Array<string>} tokens - Keywords to search for
 * @returns {Array<Object>} Matching declaration types
 */
export const findTypesByTokens = (declarationTypes = [], tokens = []) => {
  const upperTokens = tokens.map((t) => String(t).toUpperCase());
  return declarationTypes.filter((t) => {
    const name = String(t.typeName || "").toUpperCase();
    return upperTokens.some((tok) => name.includes(tok));
  });
};

/**
 * Normalize declaration items to unique entries
 * @param {Array<Object>} items - Raw declaration items
 * @param {string} fallbackPeriod - Fallback period name
 * @returns {Array<Object>} Normalized unique items
 */
export const normalizeDeclarationItems = (items = [], fallbackPeriod = "") => {
  const map = new Map();
  
  items.forEach((item, index) => {
    const key = String(item?.key ?? index);
    const customerId = String(item?.customerId ?? "");
    const typeId = String(item?.typeId ?? "");
    const periodName = item?.periodName ?? fallbackPeriod;

    if (!customerId || !typeId || !periodName) return;

    const mapKey = `${customerId}-${typeId}-${periodName}`;
    if (!map.has(mapKey)) {
      map.set(mapKey, {
        key,
        customerId,
        customerTitle: item?.customerTitle ?? `Müşteri #${customerId}`,
        typeId,
        typeName: item?.typeName ?? `Tür #${typeId}`,
        dueDate: item?.dueDate ?? "",
        periodName,
      });
    }
  });
  
  return Array.from(map.values());
};

/**
 * Extract unique customers from normalized items
 * @param {Array<Object>} items - Normalized declaration items
 * @returns {Array<Object>} Unique customers sorted by title
 */
export const extractUniqueCustomers = (items = []) => {
  const customersMap = new Map();
  
  items.forEach((item) => {
    if (!customersMap.has(item.customerId)) {
      customersMap.set(item.customerId, {
        customerId: item.customerId,
        customerTitle: item.customerTitle,
      });
    }
  });
  
  return Array.from(customersMap.values()).sort((a, b) =>
    a.customerTitle.localeCompare(b.customerTitle)
  );
};

/**
 * Extract unique declaration types from normalized items
 * @param {Array<Object>} items - Normalized declaration items
 * @returns {Array<Object>} Unique types sorted by name
 */
export const extractUniqueTypes = (items = []) => {
  const typesMap = new Map();
  
  items.forEach((item) => {
    if (!typesMap.has(item.typeId)) {
      typesMap.set(item.typeId, {
        typeId: item.typeId,
        typeName: item.typeName,
      });
    }
  });
  
  return Array.from(typesMap.values()).sort((a, b) =>
    a.typeName.localeCompare(b.typeName)
  );
};

/**
 * Check if declaration already exists
 * @param {Array<Object>} declarations - Existing declarations
 * @param {string} customerId - Customer ID
 * @param {string} typeId - Type ID
 * @param {string} periodName - Period name
 * @returns {boolean} True if exists
 */
export const declarationExists = (declarations, customerId, typeId, periodName) => {
  return declarations.some(
    (d) =>
      String(d.customerId) === String(customerId) &&
      String(d.typeId) === String(typeId) &&
      String(d.periodName) === String(periodName)
  );
};

/**
 * Deduplicate declaration items by customer, type, and period
 * @param {Array<Object>} items - Declaration items to deduplicate
 * @returns {Array<Object>} Deduplicated items
 */
export const deduplicateDeclarations = (items = []) => {
  const seenKeys = new Set();
  return items.filter((item) => {
    const key = `${item.customerId}-${item.typeId}-${item.periodName}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
};