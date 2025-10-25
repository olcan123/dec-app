/**
 * Composable for next period declaration creation logic
 */
import {
  computeDefaultDueForPeriod,
  formatDate,
  monthToQuarterIfEnd,
  getYearFromPeriod,
  getMonthFromPeriod,
} from "~/utils/dateHelpers";
import {
  isQuarterlyTypeName,
  isAnnualTypeName,
  findTypesByTokens,
  declarationExists,
  deduplicateDeclarations,
} from "~/utils/declarationHelpers";

export const useNextPeriod = () => {
  /**
   * Initialize default due dates for declaration types
   * @param {Array<Object>} uniqueTypes - Unique declaration types
   * @param {Array<Object>} normalizedItems - Normalized declaration items
   * @param {string} periodName - Period name for calculation
   * @param {Function} getTypeById - Function to get type info by ID
   * @returns {Object} Map of typeId to default due date
   */
  const initializeTypeDates = (
    uniqueTypes,
    normalizedItems,
    periodName,
    getTypeById
  ) => {
    const dates = {};

    uniqueTypes.forEach((type) => {
      const sampleItem = normalizedItems.find((it) => it.typeId === type.typeId);
      const periodForCalc = sampleItem?.periodName || periodName;
      const typeInfo = getTypeById(type.typeId);
      const defaultDay = typeInfo?.defaultDay ?? 15;

      const isQuarterly = isQuarterlyTypeName(type.typeName);
      const quarterLabel = monthToQuarterIfEnd(periodForCalc);

      let defaultDueDate = "";
      if (isQuarterly && quarterLabel) {
        defaultDueDate = computeDefaultDueForPeriod(quarterLabel, defaultDay);
      } else {
        defaultDueDate = computeDefaultDueForPeriod(periodForCalc, defaultDay);
      }

      dates[type.typeId] = defaultDueDate ? formatDate(new Date(defaultDueDate)) : "";
    });

    return dates;
  };

  /**
   * Initialize customer selections based on active status
   * @param {Array<Object>} uniqueCustomers - Unique customers from items
   * @param {Array<Object>} storeCustomers - Customers from store
   * @returns {Object} Map of customerId to selection state
   */
  const initializeCustomerSelections = (uniqueCustomers, storeCustomers) => {
    const selections = {};

    uniqueCustomers.forEach((cust) => {
      const storeCustomer = storeCustomers.find(
        (sc) => String(sc.id) === cust.customerId
      );
      selections[cust.customerId] = storeCustomer ? !!storeCustomer.isActive : true;
    });

    return selections;
  };

  /**
   * Build payload for creating next period declarations
   * @param {Object} params - Configuration object
   * @returns {Array<Object>} Payload items for creation
   */
  const buildNextPeriodPayload = ({
    selectedItems,
    targetPeriod,
    perTypeDates,
    uniqueCustomers,
    selectedCustomers,
    declarationTypes,
    existingDeclarations,
  }) => {
    const payloadItems = [];
    const isTargetEndOfQuarter = Boolean(monthToQuarterIfEnd(targetPeriod));
    const targetMonth = getMonthFromPeriod(targetPeriod);
    const isTargetEndOfYear = targetMonth === 12;

    // 1. Add selected items from initial list
    //    - Quarterly types: include only if target is end-of-quarter
    //    - Annual types (CD/PD): include only if target is end-of-year (December)
    selectedItems.forEach((item) => {
      const isQuarterly = isQuarterlyTypeName(item.typeName);
      const isAnnual = isAnnualTypeName(item.typeName);

      if (
        // non-quarterly and non-annual types: always include
        (!isQuarterly && !isAnnual) ||
        // quarterly types: include only on quarter-end
        (isQuarterly && isTargetEndOfQuarter) ||
        // annual types: include only on year-end
        (isAnnual && isTargetEndOfYear)
      ) {
        payloadItems.push({
          customerId: item.customerId,
          typeId: item.typeId,
          dueDate: perTypeDates[item.typeId] || "",
          periodName: targetPeriod,
          customerTitle: item.customerTitle,
        });
      }
    });

    // 2. Add extra quarterly/annual types if applicable
    if (isTargetEndOfQuarter || isTargetEndOfYear) {
      const tokens = ["IL", "IS", "QL", "QS"];
      if (isTargetEndOfYear) {
        tokens.push("CD", "PD");
      }

      const additionalTypes = findTypesByTokens(declarationTypes, tokens);
      const selectedCustomerIds = Object.keys(selectedCustomers).filter(
        (k) => selectedCustomers[k]
      );

      selectedCustomerIds.forEach((custId) => {
        const custInfo = uniqueCustomers.find((c) => c.customerId === custId);

        additionalTypes.forEach((qType) => {
          const typeIdStr = String(qType.id);

          // Check if already exists in DB or payload
          const existsInDb = declarationExists(
            existingDeclarations,
            custId,
            typeIdStr,
            targetPeriod
          );
          const existsInPayload = payloadItems.some(
            (p) =>
              p.customerId === custId &&
              String(p.typeId) === typeIdStr &&
              p.periodName === targetPeriod
          );

          if (!existsInDb && !existsInPayload) {
            let dueDateRaw = "";

            // Annual types (CD/PD) have special due date: 31/03 of next year
            if (isAnnualTypeName(qType.typeName)) {
              const year = getYearFromPeriod(targetPeriod);
              if (year) {
                dueDateRaw = `${year + 1}-03-31`;
              }
            }

            // Fallback to default calculation if no special due date
            if (!dueDateRaw) {
              const defaultDay = qType.defaultDay ?? 15;
              dueDateRaw = computeDefaultDueForPeriod(targetPeriod, defaultDay) || "";
            }

            payloadItems.push({
              customerId: custId,
              typeId: qType.id,
              dueDate: dueDateRaw ? formatDate(new Date(dueDateRaw)) : "",
              periodName: targetPeriod,
              customerTitle: custInfo?.customerTitle || `Müşteri #${custId}`,
            });

            // Ensure date exists in perTypeDates for new types
            if (!perTypeDates[typeIdStr]) {
              perTypeDates[typeIdStr] = dueDateRaw ? formatDate(new Date(dueDateRaw)) : "";
            }
          }
        });
      });
    }

    // 3. Deduplicate and return
    return deduplicateDeclarations(payloadItems);
  };

  return {
    initializeTypeDates,
    initializeCustomerSelections,
    buildNextPeriodPayload,
  };
};