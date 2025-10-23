export const buildCustomerSummaries = (customers = [], declarations = []) => {
  const customerMap = new Map(
    customers.map((customer) => [Number(customer.id), customer]),
  );

  const aggregation = new Map();

  declarations.forEach((declaration) => {
    const customerId = Number(declaration?.customerId ?? 0);
    if (!customerId) {
      return;
    }

    const periodName = declaration?.periodName ?? "-";

    if (!aggregation.has(customerId)) {
      aggregation.set(customerId, new Map());
    }

    const periodCounts = aggregation.get(customerId);
    const currentCounts = periodCounts.get(periodName) ?? {
      total: 0,
      completed: 0,
    };

    const nextTotal = (currentCounts.total ?? 0) + 1;
    const isCompleted = (declaration?.status ?? "") === "Completed";
    const nextCompleted =
      (currentCounts.completed ?? 0) + (isCompleted ? 1 : 0);

    periodCounts.set(periodName, {
      total: nextTotal,
      completed: nextCompleted,
    });
  });

  return Array.from(aggregation.entries())
    .map(([customerId, periodCounts]) => {
      const customer = customerMap.get(customerId);
      const periods = Array.from(periodCounts.entries())
        .map(([periodName, counts]) => ({
          periodName,
          count: counts?.total ?? 0,
          completedCount: counts?.completed ?? 0,
        }))
        .sort((a, b) => a.periodName.localeCompare(b.periodName));

      return {
        customerId,
        customerTitle: customer?.title ?? "Bilinmeyen Müşteri",
        periodCount: periods.length,
        periodCounts: periods,
      };
    })
    .sort((a, b) => a.customerTitle.localeCompare(b.customerTitle));
};

export const getCustomerSummaryById = (summaries = [], customerId) => {
  if (!customerId) {
    return null;
  }

  return (
    summaries.find(
      (item) => String(item.customerId) === String(customerId),
    ) ?? null
  );
};
