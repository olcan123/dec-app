export const normalizeOptionalDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};

export const normalizeDeclarationPayload = (payload) => {
  const data = { ...payload };

  if (data.customerId !== undefined) {
    data.customerId = Number(data.customerId) || null;
  }

  if (data.typeId !== undefined) {
    data.typeId = Number(data.typeId) || null;
  }

  if (data.reminderDays !== undefined) {
    data.reminderDays = Number(data.reminderDays) || 0;
  }

  const nullableNumericFields = ["totalAmount", "lateFee"];
  nullableNumericFields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      data[field] = null;
      return;
    }

    const parsed = Number(data[field]);
    data[field] = Number.isNaN(parsed) ? null : parsed;
  });

  if (data.paidAmount !== undefined) {
    const parsed = Number(data.paidAmount);
    data.paidAmount = Number.isNaN(parsed) ? 0 : parsed;
  }

  data.dueDate = normalizeOptionalDate(data.dueDate);
  if (!data.dueDate) {
    throw new Error("A valid dueDate value is required");
  }
  data.completionDate = normalizeOptionalDate(data.completionDate);

  return data;
};
