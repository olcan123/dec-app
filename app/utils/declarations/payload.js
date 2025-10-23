// Normalizes string-based form values into the shape expected by the API layer.
const mapFormValuesToDeclarationPayload = (values) => {
  const toOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const toRequiredNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const payload = {
    customerId: Number(values.customerId),
    typeId: Number(values.typeId),
    periodName: values.periodName,
    dueDate: values.dueDate,
    reminderDays: toRequiredNumber(values.reminderDays, 0),
    totalAmount: toOptionalNumber(values.totalAmount),
    paidAmount: toRequiredNumber(values.paidAmount, 0),
    lateFee: toRequiredNumber(values.lateFee, 0),
    status: values.status,
    priority: values.priority,
    completionDate: values.completionDate || null,
    completedBy: values.completedBy || null,
  };

  if (values.status === "Completed" && !payload.completionDate) {
    payload.completionDate = new Date().toISOString().slice(0, 10);
  }

  if (values.status !== "Completed") {
    payload.completionDate = null;
  }

  return payload;
};

export { mapFormValuesToDeclarationPayload };
